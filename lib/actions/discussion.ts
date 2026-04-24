'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { VoteType } from '@prisma/client'
import type {
  CreateThreadInput,
  CreateCommentInput,
  ThreadWithMeta,
  ThreadDetail,
  CommentWithReplies,
} from '@/types/discussion'

// ── Selectors ─────────────────────────────────────────────────────────────────

const authorSelect = {
  id: true,
  name: true,
  image: true,
  avatarUrl: true,
  isVerified: true,
  role: true,
} as const

// ── Helpers ───────────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')
  return session.user
}

// Nest flat comments into a tree by parentCommentId
function nestComments(flat: CommentWithReplies[]): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>()
  const roots: CommentWithReplies[] = []

  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }))

  flat.forEach((c) => {
    const node = map.get(c.id)!
    if (c.parentCommentId) {
      const parent = map.get(c.parentCommentId)
      if (parent) parent.replies.push(node)
      else roots.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

// ── Thread actions ────────────────────────────────────────────────────────────

export async function createThread(input: CreateThreadInput): Promise<ThreadWithMeta> {
  const user = await requireSession()

  const thread = await prisma.discussionThread.create({
    data: {
      propertyId: input.propertyId,
      authorId: user.id,
      type: input.type,
      title: input.title ?? null,
      content: input.content,
    },
    include: { author: { select: authorSelect } },
  })

  return { ...thread, viewerVote: null }
}

export async function getThreadsForProperty(
  propertyId: string,
  viewerId?: string
): Promise<ThreadWithMeta[]> {
  const threads = await prisma.discussionThread.findMany({
    where: { propertyId, status: 'VISIBLE' },
    include: { author: { select: authorSelect } },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })

  if (!viewerId) return threads.map((t) => ({ ...t, viewerVote: null }))

  const votes = await prisma.threadVote.findMany({
    where: { userId: viewerId, threadId: { in: threads.map((t) => t.id) } },
    select: { threadId: true, voteType: true },
  })
  const voteMap = new Map(votes.map((v) => [v.threadId, v.voteType]))

  return threads.map((t) => ({ ...t, viewerVote: voteMap.get(t.id) ?? null }))
}

export async function getThreadDetail(
  threadId: string,
  viewerId?: string
): Promise<ThreadDetail | null> {
  const thread = await prisma.discussionThread.findUnique({
    where: { id: threadId, status: 'VISIBLE' },
    include: {
      author: { select: authorSelect },
      comments: {
        where: { status: 'VISIBLE' },
        include: { author: { select: authorSelect } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!thread) return null

  let commentVoteMap = new Map<string, VoteType>()
  let threadVote: VoteType | null = null

  if (viewerId) {
    const [tv, cvotes] = await Promise.all([
      prisma.threadVote.findUnique({
        where: { threadId_userId: { threadId, userId: viewerId } },
        select: { voteType: true },
      }),
      prisma.commentVote.findMany({
        where: { userId: viewerId, commentId: { in: thread.comments.map((c) => c.id) } },
        select: { commentId: true, voteType: true },
      }),
    ])
    threadVote = tv?.voteType ?? null
    commentVoteMap = new Map(cvotes.map((v) => [v.commentId, v.voteType]))
  }

  const flatComments: CommentWithReplies[] = thread.comments.map((c) => ({
    ...c,
    replies: [],
    viewerVote: commentVoteMap.get(c.id) ?? null,
  }))

  return {
    ...thread,
    viewerVote: threadVote,
    comments: nestComments(flatComments),
  }
}

// ── Comment actions ───────────────────────────────────────────────────────────

export async function createComment(input: CreateCommentInput): Promise<CommentWithReplies> {
  const user = await requireSession()

  const [comment] = await prisma.$transaction([
    prisma.discussionComment.create({
      data: {
        threadId: input.threadId,
        authorId: user.id,
        parentCommentId: input.parentCommentId ?? null,
        content: input.content,
      },
      include: { author: { select: authorSelect } },
    }),
    prisma.discussionThread.update({
      where: { id: input.threadId },
      data: { commentCount: { increment: 1 } },
    }),
  ])

  return { ...comment, replies: [], viewerVote: null }
}

// ── Vote actions ──────────────────────────────────────────────────────────────

export async function voteOnThread(
  threadId: string,
  voteType: VoteType
): Promise<{ upvoteCount: number; downvoteCount: number; viewerVote: VoteType }> {
  const user = await requireSession()

  const existing = await prisma.threadVote.findUnique({
    where: { threadId_userId: { threadId, userId: user.id } },
  })

  if (existing?.voteType === voteType) {
    // Same vote clicked again — no change
    const thread = await prisma.discussionThread.findUniqueOrThrow({
      where: { id: threadId },
      select: { upvoteCount: true, downvoteCount: true },
    })
    return { ...thread, viewerVote: voteType }
  }

  // Determine count deltas
  const upDelta =
    voteType === 'UP' ? 1 : existing?.voteType === 'UP' ? -1 : 0
  const downDelta =
    voteType === 'DOWN' ? 1 : existing?.voteType === 'DOWN' ? -1 : 0

  const [, thread] = await prisma.$transaction([
    prisma.threadVote.upsert({
      where: { threadId_userId: { threadId, userId: user.id } },
      create: { threadId, userId: user.id, voteType },
      update: { voteType },
    }),
    prisma.discussionThread.update({
      where: { id: threadId },
      data: {
        upvoteCount: { increment: upDelta },
        downvoteCount: { increment: downDelta },
      },
      select: { upvoteCount: true, downvoteCount: true },
    }),
  ])

  return { ...thread, viewerVote: voteType }
}

export async function voteOnComment(
  commentId: string,
  voteType: VoteType
): Promise<{ upvoteCount: number; downvoteCount: number; viewerVote: VoteType }> {
  const user = await requireSession()

  const existing = await prisma.commentVote.findUnique({
    where: { commentId_userId: { commentId, userId: user.id } },
  })

  if (existing?.voteType === voteType) {
    const comment = await prisma.discussionComment.findUniqueOrThrow({
      where: { id: commentId },
      select: { upvoteCount: true, downvoteCount: true },
    })
    return { ...comment, viewerVote: voteType }
  }

  const upDelta =
    voteType === 'UP' ? 1 : existing?.voteType === 'UP' ? -1 : 0
  const downDelta =
    voteType === 'DOWN' ? 1 : existing?.voteType === 'DOWN' ? -1 : 0

  const [, comment] = await prisma.$transaction([
    prisma.commentVote.upsert({
      where: { commentId_userId: { commentId, userId: user.id } },
      create: { commentId, userId: user.id, voteType },
      update: { voteType },
    }),
    prisma.discussionComment.update({
      where: { id: commentId },
      data: {
        upvoteCount: { increment: upDelta },
        downvoteCount: { increment: downDelta },
      },
      select: { upvoteCount: true, downvoteCount: true },
    }),
  ])

  return { ...comment, viewerVote: voteType }
}

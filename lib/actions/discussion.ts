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
import { DiscussionError } from '@/lib/actions/discussion-errors'

// ── Selectors ─────────────────────────────────────────────────────────────────

const authorSelect = {
  id: true,
  name: true,
  image: true,
  avatarUrl: true,
  isVerified: true,
  role: true,
} as const

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new DiscussionError('Unauthorized', 'UNAUTHORIZED')
  return session.user
}

// ── Comment tree builder ──────────────────────────────────────────────────────

// Nest flat comment list into a tree. Orphaned replies (parent hidden/removed
// and therefore absent from the flat list) are dropped — not promoted to root.
function nestComments(flat: CommentWithReplies[]): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>()
  const roots: CommentWithReplies[] = []

  for (const c of flat) map.set(c.id, { ...c, replies: [] })

  for (const c of flat) {
    const node = map.get(c.id)!
    if (c.parentCommentId) {
      const parent = map.get(c.parentCommentId)
      if (parent) {
        parent.replies.push(node)
      }
      // Parent absent (hidden/removed) — drop orphan silently
    } else {
      roots.push(node)
    }
  }

  return roots
}

// ── Thread actions ────────────────────────────────────────────────────────────

export async function createThread(input: CreateThreadInput): Promise<ThreadWithMeta> {
  const user = await requireSession()

  // Verify property exists
  const property = await prisma.property.findUnique({
    where: { id: input.propertyId },
    select: { id: true },
  })
  if (!property) throw new DiscussionError('Property not found', 'NOT_FOUND')

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
  viewerId?: string,
): Promise<ThreadWithMeta[]> {
  const threads = await prisma.discussionThread.findMany({
    where: { propertyId, status: 'VISIBLE' },
    include: { author: { select: authorSelect } },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })

  if (!viewerId || threads.length === 0) {
    return threads.map((t) => ({ ...t, viewerVote: null }))
  }

  const votes = await prisma.threadVote.findMany({
    where: { userId: viewerId, threadId: { in: threads.map((t) => t.id) } },
    select: { threadId: true, voteType: true },
  })
  const voteMap = new Map(votes.map((v) => [v.threadId, v.voteType]))

  return threads.map((t) => ({ ...t, viewerVote: voteMap.get(t.id) ?? null }))
}

export async function getThreadDetail(
  threadId: string,
  viewerId?: string,
): Promise<ThreadDetail | null> {
  const thread = await prisma.discussionThread.findUnique({
    where: { id: threadId, status: 'VISIBLE' },
    include: {
      author: { select: authorSelect },
      // Include ownerId so clients can derive the owner badge without an extra query
      property: { select: { ownerId: true } },
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
        where: {
          userId: viewerId,
          commentId: { in: thread.comments.map((c) => c.id) },
        },
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

  const { property, ...threadFields } = thread

  return {
    ...threadFields,
    propertyOwnerId: property.ownerId,
    viewerVote: threadVote,
    comments: nestComments(flatComments),
  }
}

// ── Comment actions ───────────────────────────────────────────────────────────

export async function createComment(input: CreateCommentInput): Promise<CommentWithReplies> {
  const user = await requireSession()

  // Verify the thread exists and is open for comments
  const thread = await prisma.discussionThread.findUnique({
    where: { id: input.threadId },
    select: { status: true },
  })
  if (!thread) throw new DiscussionError('Thread not found', 'NOT_FOUND')
  if (thread.status !== 'VISIBLE') {
    throw new DiscussionError('This thread is not open for comments', 'FORBIDDEN')
  }

  // If replying, verify parent belongs to the same thread
  if (input.parentCommentId) {
    const parent = await prisma.discussionComment.findUnique({
      where: { id: input.parentCommentId },
      select: { threadId: true, status: true },
    })
    if (!parent || parent.threadId !== input.threadId) {
      throw new DiscussionError('Parent comment not found in this thread', 'NOT_FOUND')
    }
    if (parent.status !== 'VISIBLE') {
      throw new DiscussionError('Cannot reply to a hidden comment', 'FORBIDDEN')
    }
  }

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
//
// Both vote functions use an interactive transaction so the read-compute-write
// is atomic. Without this, two concurrent first-time votes would both see
// existing=null, both upsert, and both increment — causing a double-count.

export async function voteOnThread(
  threadId: string,
  voteType: VoteType,
): Promise<{ upvoteCount: number; downvoteCount: number; viewerVote: VoteType }> {
  const user = await requireSession()

  return prisma.$transaction(async (tx) => {
    // Verify target exists
    const target = await tx.discussionThread.findUnique({
      where: { id: threadId },
      select: { id: true, upvoteCount: true, downvoteCount: true },
    })
    if (!target) throw new DiscussionError('Thread not found', 'NOT_FOUND')

    const existing = await tx.threadVote.findUnique({
      where: { threadId_userId: { threadId, userId: user.id } },
      select: { voteType: true },
    })

    // Same vote clicked again — no-op, return current counts
    if (existing?.voteType === voteType) {
      return {
        upvoteCount: target.upvoteCount,
        downvoteCount: target.downvoteCount,
        viewerVote: voteType,
      }
    }

    const upDelta   = voteType === 'UP'   ? 1 : existing?.voteType === 'UP'   ? -1 : 0
    const downDelta = voteType === 'DOWN' ? 1 : existing?.voteType === 'DOWN' ? -1 : 0

    await tx.threadVote.upsert({
      where: { threadId_userId: { threadId, userId: user.id } },
      create: { threadId, userId: user.id, voteType },
      update: { voteType },
    })

    const updated = await tx.discussionThread.update({
      where: { id: threadId },
      data: {
        upvoteCount:   { increment: upDelta },
        downvoteCount: { increment: downDelta },
      },
      select: { upvoteCount: true, downvoteCount: true },
    })

    return { ...updated, viewerVote: voteType }
  })
}

export async function voteOnComment(
  commentId: string,
  voteType: VoteType,
): Promise<{ upvoteCount: number; downvoteCount: number; viewerVote: VoteType }> {
  const user = await requireSession()

  return prisma.$transaction(async (tx) => {
    const target = await tx.discussionComment.findUnique({
      where: { id: commentId },
      select: { id: true, upvoteCount: true, downvoteCount: true },
    })
    if (!target) throw new DiscussionError('Comment not found', 'NOT_FOUND')

    const existing = await tx.commentVote.findUnique({
      where: { commentId_userId: { commentId, userId: user.id } },
      select: { voteType: true },
    })

    if (existing?.voteType === voteType) {
      return {
        upvoteCount: target.upvoteCount,
        downvoteCount: target.downvoteCount,
        viewerVote: voteType,
      }
    }

    const upDelta   = voteType === 'UP'   ? 1 : existing?.voteType === 'UP'   ? -1 : 0
    const downDelta = voteType === 'DOWN' ? 1 : existing?.voteType === 'DOWN' ? -1 : 0

    await tx.commentVote.upsert({
      where: { commentId_userId: { commentId, userId: user.id } },
      create: { commentId, userId: user.id, voteType },
      update: { voteType },
    })

    const updated = await tx.discussionComment.update({
      where: { id: commentId },
      data: {
        upvoteCount:   { increment: upDelta },
        downvoteCount: { increment: downDelta },
      },
      select: { upvoteCount: true, downvoteCount: true },
    })

    return { ...updated, viewerVote: voteType }
  })
}

import type { DiscussionType, ContentStatus, VoteType } from '@prisma/client'

export type { DiscussionType, ContentStatus, VoteType }

export interface ThreadAuthor {
  id: string
  name: string | null
  image: string | null
  avatarUrl: string | null
  isVerified: boolean
  role: string
}

export interface CommentWithReplies {
  id: string
  threadId: string
  authorId: string
  parentCommentId: string | null
  content: string
  status: ContentStatus
  upvoteCount: number
  downvoteCount: number
  createdAt: Date
  updatedAt: Date
  author: ThreadAuthor
  replies: CommentWithReplies[]
  viewerVote?: VoteType | null
}

export interface ThreadWithMeta {
  id: string
  propertyId: string
  authorId: string
  type: DiscussionType
  title: string | null
  content: string
  status: ContentStatus
  isPinned: boolean
  upvoteCount: number
  downvoteCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
  author: ThreadAuthor
  viewerVote?: VoteType | null
}

export interface ThreadDetail extends ThreadWithMeta {
  // Included so clients can derive owner badge: comment.authorId === propertyOwnerId
  propertyOwnerId: string
  comments: CommentWithReplies[]
}

// ── Input types ───────────────────────────────────────────────────────────────

export interface CreateThreadInput {
  propertyId: string
  type: DiscussionType
  title?: string
  content: string
}

export interface CreateCommentInput {
  threadId: string
  content: string
  parentCommentId?: string
}

export interface VoteInput {
  voteType: VoteType
}

// ── Error codes ───────────────────────────────────────────────────────────────

export type DiscussionErrorCode =
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'VALIDATION'

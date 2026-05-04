'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, AlertCircle, Send, CornerDownRight, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { VoteBar } from './PropertyDiscussions'
import { timeAgo, getInitials } from '@/lib/utils'
import type { ThreadDetail, CommentWithReplies, DiscussionType } from '@/types/discussion'

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<DiscussionType, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline' }> = {
  QUESTION: { label: 'Question', variant: 'default' },
  TIP:      { label: 'Tip',      variant: 'success' },
  FEEDBACK: { label: 'Feedback', variant: 'outline' },
  WARNING:  { label: 'Warning',  variant: 'danger' },
  FLATMATE: { label: 'Flatmate', variant: 'warning' },
  GENERAL:  { label: 'General',  variant: 'secondary' },
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = 8 }: { name?: string | null; image?: string | null; size?: number }) {
  const cls = `rounded-full flex-shrink-0 object-cover`
  if (image) {
    return <img src={image} alt="" className={`${cls} h-${size} w-${size}`} />
  }
  return (
    <div className={`${cls} h-${size} w-${size} bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold`}>
      {getInitials(name ?? 'U')}
    </div>
  )
}

// ── Author meta row ───────────────────────────────────────────────────────────

function AuthorRow({
  author,
  createdAt,
  isOwner,
}: {
  author: CommentWithReplies['author']
  createdAt: Date | string
  isOwner: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
      <span className="font-medium text-gray-800">{author.name ?? 'Anonymous'}</span>
      {isOwner && (
        <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          Owner
        </span>
      )}
      {author.isVerified && (
        <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <CheckCircle className="h-2.5 w-2.5" /> Verified
        </span>
      )}
      <span className="text-gray-400">·</span>
      <span>{timeAgo(createdAt)}</span>
    </div>
  )
}

// ── Reply / comment form ──────────────────────────────────────────────────────

function ReplyForm({
  threadId,
  parentCommentId,
  onPosted,
  onCancel,
  placeholder,
}: {
  threadId: string
  parentCommentId?: string
  onPosted: (comment: CommentWithReplies) => void
  onCancel?: () => void
  placeholder?: string
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/discussions/threads/${threadId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          parentCommentId: parentCommentId ?? undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to post'); return }
      onPosted(data)
      setContent('')
    } catch {
      setError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-start">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder ?? 'Write a reply…'}
        rows={2}
        maxLength={3000}
        className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50 resize-none"
      />
      <div className="flex flex-col gap-1">
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-40 transition-colors"
        >
          {submitting
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </form>
  )
}

// ── Single comment node (recursive) ──────────────────────────────────────────

function CommentNode({
  comment,
  threadId,
  propertyOwnerId,
  isAuthed,
  depth,
  onReplyPosted,
}: {
  comment: CommentWithReplies
  threadId: string
  propertyOwnerId: string
  isAuthed: boolean
  depth: number
  onReplyPosted: (parentId: string, newComment: CommentWithReplies) => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [localVote, setLocalVote] = useState({
    upvoteCount: comment.upvoteCount,
    downvoteCount: comment.downvoteCount,
    viewerVote: comment.viewerVote ?? null,
  })

  const isOwner = comment.authorId === propertyOwnerId

  async function handleVote(voteType: 'UP' | 'DOWN') {
    if (!isAuthed) return
    try {
      const res = await fetch(`/api/discussions/comments/${comment.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
      if (!res.ok) return
      const data = await res.json()
      setLocalVote(data)
    } catch { /* silent */ }
  }

  // Limit visual nesting to 2 levels to stay mobile-friendly
  const canNestFurther = depth < 2

  return (
    <div className={`${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-gray-100 pl-3 sm:pl-4' : ''}`}>
      <div className="py-3">
        {/* Author */}
        <div className="flex items-start gap-2.5">
          <Avatar name={comment.author.name} image={comment.author.image} size={7} />
          <div className="flex-1 min-w-0">
            <AuthorRow
              author={comment.author}
              createdAt={comment.createdAt}
              isOwner={isOwner}
            />
            <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <VoteBar
                upvoteCount={localVote.upvoteCount}
                downvoteCount={localVote.downvoteCount}
                viewerVote={localVote.viewerVote}
                onVote={handleVote}
                disabled={!isAuthed}
              />
              {isAuthed && (
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="text-xs text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-1"
                >
                  <CornerDownRight className="h-3 w-3" />
                  {showReplyForm ? 'Cancel' : 'Reply'}
                </button>
              )}
            </div>

            {showReplyForm && (
              <div className="mt-2">
                <ReplyForm
                  threadId={threadId}
                  parentCommentId={canNestFurther ? comment.id : undefined}
                  placeholder={`Reply to ${comment.author.name ?? 'this comment'}…`}
                  onPosted={(newComment) => {
                    onReplyPosted(comment.id, newComment)
                    setShowReplyForm(false)
                  }}
                  onCancel={() => setShowReplyForm(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.map((reply) => (
        <CommentNode
          key={reply.id}
          comment={reply}
          threadId={threadId}
          propertyOwnerId={propertyOwnerId}
          isAuthed={isAuthed}
          depth={depth + 1}
          onReplyPosted={onReplyPosted}
        />
      ))}
    </div>
  )
}

// ── Thread detail view ────────────────────────────────────────────────────────

interface ThreadDetailViewProps {
  threadId: string
  propertyId: string
  isAuthed: boolean
  onBack: () => void
}

export function ThreadDetailView({ threadId, propertyId, isAuthed, onBack }: ThreadDetailViewProps) {
  const [thread, setThread] = useState<ThreadDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [threadVote, setThreadVote] = useState<{
    upvoteCount: number
    downvoteCount: number
    viewerVote: 'UP' | 'DOWN' | null
  } | null>(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`/api/discussions/threads/${threadId}`)
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok) {
          setError(typeof data.error === 'string' ? data.error : 'Thread not found.')
          setThread(null)
          return
        }
        setThread(data)
        setThreadVote({
          upvoteCount: data.upvoteCount,
          downvoteCount: data.downvoteCount,
          viewerVote: data.viewerVote ?? null,
        })
      })
      .catch(() => setError('Could not load this thread.'))
      .finally(() => setLoading(false))
  }, [threadId])

  async function handleThreadVote(voteType: 'UP' | 'DOWN') {
    if (!isAuthed || !thread) return
    try {
      const res = await fetch(`/api/discussions/threads/${threadId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
      if (!res.ok) return
      const data = await res.json()
      setThreadVote(data)
    } catch { /* silent */ }
  }

  // Insert a newly posted top-level comment into the tree
  function handleCommentPosted(comment: CommentWithReplies) {
    setThread((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        commentCount: prev.commentCount + 1,
        comments: [...prev.comments, { ...comment, replies: [] }],
      }
    })
  }

  // Insert a reply into the correct parent within the tree
  function handleReplyPosted(parentId: string, newComment: CommentWithReplies) {
    setThread((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        commentCount: prev.commentCount + 1,
        comments: insertReply(prev.comments, parentId, newComment),
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Loading thread…</span>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="space-y-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to discussions
        </button>
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4">
          <AlertCircle className="h-4 w-4" />
          {error || 'Thread not found.'}
        </div>
      </div>
    )
  }

  const badge = TYPE_BADGE[thread.type]

  return (
    <div className="space-y-4">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All discussions
      </button>

      {/* Thread header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {thread.isPinned && <Badge variant="secondary">Pinned</Badge>}
        </div>

        {thread.title && (
          <h2 className="text-xl font-bold text-gray-900 mb-2">{thread.title}</h2>
        )}

        <p className="text-gray-700 text-sm whitespace-pre-wrap break-words leading-relaxed mb-4">
          {thread.content}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
          <Avatar name={thread.author.name} image={thread.author.image} size={7} />
          <AuthorRow
            author={thread.author}
            createdAt={thread.createdAt}
            isOwner={thread.authorId === thread.propertyOwnerId}
          />
        </div>

        {/* Thread votes */}
        {threadVote && (
          <VoteBar
            upvoteCount={threadVote.upvoteCount}
            downvoteCount={threadVote.downvoteCount}
            viewerVote={threadVote.viewerVote}
            onVote={handleThreadVote}
            disabled={!isAuthed}
          />
        )}
        {!isAuthed && (
          <p className="text-xs text-gray-400 mt-2">
            <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link> to vote or reply.
          </p>
        )}
      </div>

      {/* Comments section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
          {thread.commentCount > 0
            ? `${thread.commentCount} ${thread.commentCount === 1 ? 'Reply' : 'Replies'}`
            : 'No replies yet'}
        </h3>

        {/* Top-level reply form */}
        {isAuthed && (
          <div className="mt-3 mb-4 pb-4 border-b border-gray-100">
            <ReplyForm
              threadId={threadId}
              placeholder="Write a reply to this thread…"
              onPosted={handleCommentPosted}
            />
          </div>
        )}

        {/* Comment tree */}
        {thread.comments.length === 0 && !isAuthed && (
          <p className="text-sm text-gray-400 py-4 text-center">
            <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link> to be the first to reply.
          </p>
        )}

        <div className="divide-y divide-gray-50">
          {thread.comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              threadId={threadId}
              propertyOwnerId={thread.propertyOwnerId}
              isAuthed={isAuthed}
              depth={0}
              onReplyPosted={handleReplyPosted}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tree helpers ──────────────────────────────────────────────────────────────

function insertReply(
  comments: CommentWithReplies[],
  parentId: string,
  newComment: CommentWithReplies,
): CommentWithReplies[] {
  return comments.map((c) => {
    if (c.id === parentId) {
      return { ...c, replies: [...c.replies, { ...newComment, replies: [] }] }
    }
    if (c.replies.length > 0) {
      return { ...c, replies: insertReply(c.replies, parentId, newComment) }
    }
    return c
  })
}

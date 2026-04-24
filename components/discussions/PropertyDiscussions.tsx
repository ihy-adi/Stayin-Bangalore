'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  MessageCircle, Plus, X, Loader2, AlertCircle, ChevronUp, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ThreadDetailView } from './ThreadDetailView'
import { timeAgo, getInitials } from '@/lib/utils'
import type { ThreadWithMeta, DiscussionType } from '@/types/discussion'

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Questions', value: 'QUESTION' },
  { label: 'Tips', value: 'TIP' },
  { label: 'Feedback', value: 'FEEDBACK' },
  { label: 'Warnings', value: 'WARNING' },
  { label: 'Flatmate', value: 'FLATMATE' },
] as const

type Filter = typeof FILTERS[number]['value']

const TYPE_BADGE: Record<DiscussionType, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' | 'outline' }> = {
  QUESTION: { label: 'Question', variant: 'default' },
  TIP:      { label: 'Tip',      variant: 'success' },
  FEEDBACK: { label: 'Feedback', variant: 'outline' },
  WARNING:  { label: 'Warning',  variant: 'danger' },
  FLATMATE: { label: 'Flatmate', variant: 'warning' },
  GENERAL:  { label: 'General',  variant: 'secondary' },
}

const THREAD_TYPES: DiscussionType[] = ['QUESTION', 'FEEDBACK', 'TIP', 'WARNING', 'FLATMATE', 'GENERAL']

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = 8 }: { name?: string | null; image?: string | null; size?: number }) {
  const cls = `h-${size} w-${size} rounded-full flex-shrink-0 object-cover`
  if (image) return <img src={image} alt="" className={cls} />
  return (
    <div className={`h-${size} w-${size} rounded-full flex-shrink-0 bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold`}>
      {getInitials(name ?? 'U')}
    </div>
  )
}

// ── Vote button pair ──────────────────────────────────────────────────────────

interface VoteBarProps {
  upvoteCount: number
  downvoteCount: number
  viewerVote?: 'UP' | 'DOWN' | null
  onVote: (type: 'UP' | 'DOWN') => void
  disabled?: boolean
}

export function VoteBar({ upvoteCount, downvoteCount, viewerVote, onVote, disabled }: VoteBarProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onVote('UP')}
        disabled={disabled}
        className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
          viewerVote === 'UP'
            ? 'bg-brand-100 text-brand-700'
            : 'text-gray-500 hover:bg-gray-100'
        } disabled:opacity-40`}
      >
        <ChevronUp className="h-4 w-4" />
        {upvoteCount}
      </button>
      <button
        onClick={() => onVote('DOWN')}
        disabled={disabled}
        className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
          viewerVote === 'DOWN'
            ? 'bg-red-100 text-red-700'
            : 'text-gray-500 hover:bg-gray-100'
        } disabled:opacity-40`}
      >
        <ChevronDown className="h-4 w-4" />
        {downvoteCount}
      </button>
    </div>
  )
}

// ── Thread card ───────────────────────────────────────────────────────────────

function ThreadCard({
  thread,
  onClick,
  onVote,
  isAuthed,
}: {
  thread: ThreadWithMeta
  onClick: () => void
  onVote: (threadId: string, type: 'UP' | 'DOWN') => void
  isAuthed: boolean
}) {
  const badge = TYPE_BADGE[thread.type]

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar name={thread.author.name} image={thread.author.image} size={8} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900 truncate">
              {thread.author.name ?? 'Anonymous'}
            </span>
            {thread.author.isVerified && (
              <Badge variant="success" className="text-[10px] py-0">Verified</Badge>
            )}
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
              {timeAgo(thread.createdAt)}
            </span>
          </div>

          {/* Title + content */}
          <button
            onClick={onClick}
            className="text-left w-full group"
          >
            {thread.title && (
              <p className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors mb-0.5">
                {thread.title}
              </p>
            )}
            <p className="text-sm text-gray-600 line-clamp-2">{thread.content}</p>
          </button>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-3">
            <VoteBar
              upvoteCount={thread.upvoteCount}
              downvoteCount={thread.downvoteCount}
              viewerVote={thread.viewerVote}
              onVote={(type) => onVote(thread.id, type)}
              disabled={!isAuthed}
            />
            <button
              onClick={onClick}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors ml-auto"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {thread.commentCount}
              <span className="hidden sm:inline ml-0.5">
                {thread.commentCount === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Create thread form ────────────────────────────────────────────────────────

function CreateThreadForm({
  propertyId,
  onCreated,
  onCancel,
}: {
  propertyId: string
  onCreated: (thread: ThreadWithMeta) => void
  onCancel: () => void
}) {
  const [type, setType] = useState<DiscussionType>('QUESTION')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/discussions/properties/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim() || undefined,
          content: content.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to post'); return }
      onCreated(data)
      setTitle('')
      setContent('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border border-brand-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">Start a Discussion</p>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2">
        {THREAD_TYPES.map((t) => {
          const b = TYPE_BADGE[t]
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                type === t
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {b.label}
            </button>
          )
        })}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        maxLength={200}
        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50"
      />

      {/* Content */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share a question, tip, or experience about this property…"
        rows={3}
        maxLength={5000}
        required
        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 bg-gray-50 resize-none"
      />

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          Post
        </Button>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface PropertyDiscussionsProps {
  propertyId: string
}

export function PropertyDiscussions({ propertyId }: PropertyDiscussionsProps) {
  const { data: session } = useSession()
  const isAuthed = !!session?.user?.id

  const [threads, setThreads] = useState<ThreadWithMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<Filter>('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/discussions/properties/${propertyId}`)
      if (!res.ok) throw new Error('Failed to load')
      setThreads(await res.json())
    } catch {
      setError('Could not load discussions. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [propertyId])

  useEffect(() => { fetchThreads() }, [fetchThreads])

  const filtered = activeFilter === 'ALL'
    ? threads
    : threads.filter((t) => t.type === activeFilter)

  async function handleVote(threadId: string, voteType: 'UP' | 'DOWN') {
    if (!isAuthed) return
    try {
      const res = await fetch(`/api/discussions/threads/${threadId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      })
      if (!res.ok) return
      const { upvoteCount, downvoteCount, viewerVote } = await res.json()
      setThreads((prev) =>
        prev.map((t) => t.id === threadId ? { ...t, upvoteCount, downvoteCount, viewerVote } : t)
      )
    } catch { /* silent */ }
  }

  function handleCreated(thread: ThreadWithMeta) {
    setThreads((prev) => [thread, ...prev])
    setShowCreate(false)
    setSelectedThreadId(thread.id)
  }

  // ── Thread detail view ────────────────────────────────────────────────────

  if (selectedThreadId) {
    return (
      <ThreadDetailView
        threadId={selectedThreadId}
        propertyId={propertyId}
        isAuthed={isAuthed}
        onBack={() => setSelectedThreadId(null)}
      />
    )
  }

  // ── Thread list ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Discussions</h2>
          <p className="text-sm text-gray-500">
            {threads.length > 0 ? `${threads.length} thread${threads.length !== 1 ? 's' : ''}` : 'Ask, share, and discover'}
          </p>
        </div>
        {isAuthed ? (
          <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" /> New Thread
          </Button>
        ) : (
          <Link href="/login">
            <Button size="sm" variant="outline">Sign in to post</Button>
          </Link>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateThreadForm
          propertyId={propertyId}
          onCreated={handleCreated}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Sign-in nudge (unauthenticated) */}
      {!isAuthed && !loading && threads.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">Be the first to start a discussion</p>
          <Link href="/login"><Button size="sm">Sign In</Button></Link>
        </div>
      )}

      {/* Filter tabs */}
      {threads.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => {
            const count = f.value === 'ALL'
              ? threads.length
              : threads.filter((t) => t.type === f.value).length
            if (f.value !== 'ALL' && count === 0) return null
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === f.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm">Loading discussions…</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && threads.length > 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No {activeFilter.toLowerCase()} threads yet.
        </p>
      )}

      {!loading && !error && filtered.length === 0 && threads.length === 0 && isAuthed && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No discussions yet. Start one!</p>
        </div>
      )}

      {/* Thread list */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => setSelectedThreadId(thread.id)}
              onVote={handleVote}
              isAuthed={isAuthed}
            />
          ))}
        </div>
      )}
    </div>
  )
}

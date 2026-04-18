'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate, getInitials } from '@/lib/utils'

const CONCERN_LABELS: Record<string, string> = {
  CLEANLINESS: 'Cleanliness',
  SAFETY: 'Safety',
  FOOD_QUALITY: 'Food Quality',
  HIDDEN_CHARGES: 'Hidden Charges',
  MISLEADING_PHOTOS: 'Misleading Photos',
  NOISE: 'Noise',
  OWNER_BEHAVIOR: 'Owner Behavior',
  OTHER: 'Other',
}

interface Review {
  id: string
  rating: number
  body: string
  hasLivedThere: boolean
  createdAt: string | Date
  user: { id: string; name: string | null; image: string | null }
}

interface Comment {
  id: string
  body: string
  concernType: string | null
  createdAt: string | Date
  user: { id: string; name: string | null; image: string | null }
}

interface ReviewSectionProps {
  propertyId: string
  reviews: Review[]
  comments: Comment[]
  avgRating: number
}

export function ReviewSection({ propertyId, reviews, comments, avgRating }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [localReviews, setLocalReviews] = useState(reviews)
  const [localComments, setLocalComments] = useState(comments)
  const [reviewForm, setReviewForm] = useState({ rating: 0, body: '', hasLivedThere: false })
  const [commentForm, setCommentForm] = useState({ body: '', concernType: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [commentError, setCommentError] = useState('')
  const [activeTab, setActiveTab] = useState<'reviews' | 'comments'>('reviews')

  async function submitReview() {
    if (!reviewForm.rating || !reviewForm.body) {
      setReviewError('Please provide a rating and review text.')
      return
    }
    setSubmittingReview(true)
    setReviewError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, ...reviewForm }),
    })
    const data = await res.json()
    if (!res.ok) {
      setReviewError(data.error ?? 'Failed to submit review.')
    } else {
      setLocalReviews((prev) => [data, ...prev])
      setReviewForm({ rating: 0, body: '', hasLivedThere: false })
    }
    setSubmittingReview(false)
  }

  async function submitComment() {
    if (!commentForm.body) { setCommentError('Please write a comment.'); return }
    setSubmittingComment(true)
    setCommentError('')
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, ...commentForm, concernType: commentForm.concernType || undefined }),
    })
    const data = await res.json()
    if (!res.ok) {
      setCommentError(data.error ?? 'Failed to submit comment.')
    } else {
      setLocalComments((prev) => [data, ...prev])
      setCommentForm({ body: '', concernType: '' })
    }
    setSubmittingComment(false)
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: localReviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      {localReviews.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
            <StarRating value={avgRating} size="sm" className="justify-center mt-1" />
            <p className="text-xs text-gray-500 mt-1">{localReviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-gray-600">{star}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all"
                    style={{ width: localReviews.length ? `${(count / localReviews.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="w-6 text-right text-gray-500">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Reviews ({localReviews.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Community Comments ({localComments.length})
        </button>
      </div>

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Add review form */}
          {session && (
            <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Write a Review</h4>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Your Rating</label>
                <StarRating
                  value={reviewForm.rating}
                  onChange={(v) => setReviewForm((f) => ({ ...f, rating: v }))}
                  size="lg"
                />
              </div>
              <textarea
                placeholder="Share your experience staying here…"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reviewForm.hasLivedThere}
                  onChange={(e) => setReviewForm((f) => ({ ...f, hasLivedThere: e.target.checked }))}
                  className="h-4 w-4 rounded text-brand-600"
                />
                I have lived at or visited this property
              </label>
              {reviewError && <p className="text-xs text-red-600">{reviewError}</p>}
              <Button size="sm" onClick={submitReview} disabled={submittingReview}>
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </Button>
            </div>
          )}

          {/* Reviews list */}
          {localReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Star className="h-8 w-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            localReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {review.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={review.user.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      getInitials(review.user.name ?? 'U')
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{review.user.name ?? 'Anonymous'}</span>
                      {review.hasLivedThere && (
                        <Badge variant="success" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" /> Verified Resident
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    </div>
                    <StarRating value={review.rating} size="sm" className="mt-1" />
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.body}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          {session && (
            <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Share a Concern or Note</h4>
              <select
                value={commentForm.concernType}
                onChange={(e) => setCommentForm((f) => ({ ...f, concernType: e.target.value }))}
                className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">General comment (no category)</option>
                {Object.entries(CONCERN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <textarea
                placeholder="Share what others should know about this place…"
                value={commentForm.body}
                onChange={(e) => setCommentForm((f) => ({ ...f, body: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
              {commentError && <p className="text-xs text-red-600">{commentError}</p>}
              <Button size="sm" onClick={submitComment} disabled={submittingComment}>
                {submittingComment ? 'Posting…' : 'Post Comment'}
              </Button>
            </div>
          )}

          {localComments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No community comments yet.</p>
            </div>
          ) : (
            localComments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {getInitials(comment.user.name ?? 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{comment.user.name ?? 'Anonymous'}</span>
                      {comment.concernType && (
                        <Badge variant="warning" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {CONCERN_LABELS[comment.concernType]}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{comment.body}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!session && (
        <p className="text-sm text-center text-gray-500 py-4">
          <a href="/login" className="text-brand-600 hover:underline font-medium">Sign in</a> to leave a review or comment.
        </p>
      )}
    </div>
  )
}

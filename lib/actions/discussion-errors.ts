import type { DiscussionErrorCode } from '@/types/discussion'

export class DiscussionError extends Error {
  constructor(
    message: string,
    public readonly code: DiscussionErrorCode,
  ) {
    super(message)
    this.name = 'DiscussionError'
  }
}

export function httpStatusForDiscussionError(code: DiscussionErrorCode): number {
  switch (code) {
    case 'NOT_FOUND':
      return 404
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'VALIDATION':
      return 400
    default:
      return 400
  }
}

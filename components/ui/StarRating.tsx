'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-6 w-6' }

export function StarRating({ value, max = 5, onChange, size = 'md', className }: StarRatingProps) {
  return (
    <div className={cn('flex gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value)
        return (
          <Star
            key={i}
            className={cn(
              sizes[size],
              filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300',
              onChange ? 'cursor-pointer hover:text-amber-400 transition-colors' : ''
            )}
            onClick={() => onChange?.(i + 1)}
          />
        )
      })}
    </div>
  )
}

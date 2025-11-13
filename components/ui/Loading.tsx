import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

export function Loading({ size = 'md', text, fullScreen = false, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2
        className={cn('animate-spin text-[var(--primary)]', sizeClasses[size])}
        aria-hidden="true"
      />
      {text && (
        <p className="text-body text-[var(--foreground-muted)]" role="status">
          {text}
        </p>
      )}
      <span className="sr-only">로딩 중...</span>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]">
        {content}
      </div>
    )
  }

  return content
}

// Skeleton loader for content placeholders
export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  count?: number
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  const skeletonElement = (
    <div
      className={cn(
        'animate-pulse bg-[var(--gray-200)]',
        variantClasses[variant],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1rem' : undefined),
      }}
      aria-hidden="true"
    />
  )

  if (count === 1) {
    return skeletonElement
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  )
}

// Spinner for inline loading
export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <Loader2
      className={cn('animate-spin text-[var(--primary)]', sizeClasses[size], className)}
      aria-label="로딩 중"
    />
  )
}

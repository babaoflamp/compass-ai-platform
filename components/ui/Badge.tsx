import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]',
        success:
          'bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]',
        warning:
          'bg-[var(--warning-light)] text-[var(--warning)] border border-[var(--warning)]',
        error:
          'bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]',
        info: 'bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]',
        neutral:
          'bg-[var(--gray-100)] text-[var(--gray-700)] border border-[var(--gray-300)]',
        outline:
          'bg-transparent text-[var(--foreground)] border border-[var(--border)]',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {dot && (
          <span
            className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

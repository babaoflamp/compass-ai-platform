import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)]',
        secondary:
          'bg-[var(--surface-variant)] text-[var(--foreground)] hover:bg-[var(--gray-200)] border border-[var(--border)]',
        outline:
          'border border-[var(--border)] bg-transparent hover:bg-[var(--surface-variant)] text-[var(--foreground)]',
        ghost:
          'bg-transparent hover:bg-[var(--surface-variant)] text-[var(--foreground)]',
        success:
          'bg-[var(--success)] text-white hover:bg-[var(--success-hover)] focus-visible:ring-[var(--success)]',
        error:
          'bg-[var(--error)] text-white hover:bg-[var(--error-hover)] focus-visible:ring-[var(--error)]',
        link:
          'text-[var(--primary)] hover:text-[var(--primary-hover)] underline-offset-4 hover:underline bg-transparent p-0',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {!loading && leftIcon && <span className="inline-flex" aria-hidden="true">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="inline-flex" aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

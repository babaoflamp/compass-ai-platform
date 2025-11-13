import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-label mb-2 text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full h-10 px-4 rounded-lg border bg-[var(--surface)] text-[var(--foreground)]',
              'placeholder:text-[var(--foreground-muted)]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
              error
                ? 'border-[var(--error)] focus:ring-[var(--error)]'
                : 'border-[var(--border)] hover:border-[var(--gray-400)]',
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--gray-100)]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-caption text-[var(--error)]"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${props.id}-helper`}
            className="mt-1 text-caption text-[var(--foreground-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

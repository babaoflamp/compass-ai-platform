import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const currentLength =
      typeof value === 'string' ? value.length : value?.toString().length || 0

    return (
      <div className="w-full">
        {label && (
          <label className="block text-label mb-2 text-[var(--foreground)]">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            className={cn(
              'w-full px-4 py-3 rounded-lg border bg-[var(--surface)] text-[var(--foreground)]',
              'placeholder:text-[var(--foreground-muted)]',
              'resize-none',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
              error
                ? 'border-[var(--error)] focus:ring-[var(--error)]'
                : 'border-[var(--border)] hover:border-[var(--gray-400)]',
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--gray-100)]',
              className
            )}
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex-1">
            {error && (
              <p
                id={`${props.id}-error`}
                className="text-caption text-[var(--error)]"
                role="alert"
              >
                {error}
              </p>
            )}
            {!error && helperText && (
              <p
                id={`${props.id}-helper`}
                className="text-caption text-[var(--foreground-muted)]"
              >
                {helperText}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-caption text-[var(--foreground-muted)] ml-2">
              {currentLength} / {maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

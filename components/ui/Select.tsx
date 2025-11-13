import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
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
          <select
            className={cn(
              'w-full h-10 px-4 pr-10 rounded-lg border bg-[var(--surface)] text-[var(--foreground)]',
              'appearance-none cursor-pointer',
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
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)] pointer-events-none"
            aria-hidden="true"
          />
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

Select.displayName = 'Select'

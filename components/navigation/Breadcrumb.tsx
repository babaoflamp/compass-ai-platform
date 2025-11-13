import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="h-4 w-4 mx-2 text-[var(--foreground-muted)]"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm',
                    isLast
                      ? 'text-[var(--foreground)] font-medium'
                      : 'text-[var(--foreground-muted)]'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

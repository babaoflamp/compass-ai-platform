'use client'

import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

export interface TopBarProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export function TopBar({
  title,
  subtitle,
  actions,
  breadcrumbs,
  onMenuClick,
  sidebarCollapsed = false,
}: TopBarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-[var(--surface)] border-b border-[var(--border)]',
        'transition-all duration-300 z-30',
        'flex items-center px-6 gap-4',
        sidebarCollapsed ? 'left-16' : 'left-64'
      )}
    >
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[var(--surface-variant)] rounded-lg transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Breadcrumbs or Title */}
      <div className="flex-1 min-w-0">
        {breadcrumbs ? (
          <nav aria-label="Breadcrumb">{breadcrumbs}</nav>
        ) : (
          <div>
            {title && (
              <h1 className="text-h4 text-[var(--foreground)] truncate">{title}</h1>
            )}
            {subtitle && (
              <p className="text-caption text-[var(--foreground-muted)] truncate">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}

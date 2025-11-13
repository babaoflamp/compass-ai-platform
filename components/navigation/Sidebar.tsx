'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
}

export interface SidebarProps {
  items: SidebarItem[]
  header?: React.ReactNode
  footer?: React.ReactNode
  collapsed?: boolean
}

export function Sidebar({ items, header, footer, collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)]',
        'transition-all duration-300 ease-in-out z-40',
        'flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
      aria-label="Main navigation"
    >
      {/* Header */}
      {header && (
        <div className={cn('p-4 border-b border-[var(--border)]', collapsed && 'px-2')}>
          {header}
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4" role="navigation">
        <ul className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'transition-all duration-200',
                    'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]',
                    isActive && 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]',
                    collapsed && 'justify-center'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'px-2 py-0.5 text-xs rounded-full',
                            isActive
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--gray-200)] text-[var(--gray-700)]'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {footer && (
        <div className={cn('p-4 border-t border-[var(--border)]', collapsed && 'px-2')}>
          {footer}
        </div>
      )}
    </aside>
  )
}

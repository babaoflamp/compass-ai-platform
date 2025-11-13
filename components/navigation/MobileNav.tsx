'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { SidebarItem } from './Sidebar'

export interface MobileNavProps {
  items: SidebarItem[]
  isOpen: boolean
  onClose: () => void
  header?: React.ReactNode
}

export function MobileNav({ items, isOpen, onClose, header }: MobileNavProps) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[var(--sidebar-bg)] z-50 lg:hidden animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-label="모바일 메뉴"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          {header}
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--sidebar-hover)] rounded-lg transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="overflow-y-auto h-[calc(100vh-73px)] scrollbar-thin py-4">
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
                      isActive && 'bg-[var(--sidebar-active)] text-[var(--sidebar-text-active)]'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
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
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}

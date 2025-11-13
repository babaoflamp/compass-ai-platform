'use client'

import { useState } from 'react'
import { LayoutDashboard, GraduationCap, MessageCircle, Home } from 'lucide-react'
import { Sidebar, SidebarItem } from '@/components/navigation/Sidebar'
import { TopBar } from '@/components/navigation/TopBar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { SkipLink } from '@/components/navigation/SkipLink'

const studentNavItems: SidebarItem[] = [
  {
    label: '홈',
    href: '/',
    icon: Home,
  },
  {
    label: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: '과목 추천',
    href: '/advisor',
    icon: GraduationCap,
  },
  {
    label: 'AI 튜터',
    href: '/tutor',
    icon: MessageCircle,
  },
]

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      <SkipLink />
      <div className="min-h-screen bg-[var(--background)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
        <Sidebar
          items={studentNavItems}
          collapsed={sidebarCollapsed}
          header={
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              {!sidebarCollapsed && (
                <span className="text-h4 text-[var(--foreground)]">COMPASS</span>
              )}
            </div>
          }
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        items={studentNavItems}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        header={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-h4 text-[var(--foreground)]">COMPASS</span>
          </div>
        }
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Top Bar */}
        <TopBar
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setIsMobileNavOpen(true)}
        />

        {/* Page Content */}
        <main id="main-content" className="pt-16 min-h-screen">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </>
  )
}

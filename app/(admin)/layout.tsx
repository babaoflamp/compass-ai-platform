'use client'

import { useState } from 'react'
import { Upload, FileText, BarChart3, Home, Settings } from 'lucide-react'
import { Sidebar, SidebarItem } from '@/components/navigation/Sidebar'
import { TopBar } from '@/components/navigation/TopBar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { SkipLink } from '@/components/navigation/SkipLink'

const adminNavItems: SidebarItem[] = [
  {
    label: '홈',
    href: '/',
    icon: Home,
  },
  {
    label: '데이터 업로드',
    href: '/upload',
    icon: Upload,
  },
  {
    label: '학습 자료',
    href: '/materials',
    icon: FileText,
  },
  {
    label: '분석',
    href: '/analytics',
    icon: BarChart3,
  },
]

export default function AdminLayout({
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
          items={adminNavItems}
          collapsed={sidebarCollapsed}
          header={
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-h4 text-[var(--foreground)]">관리자</span>
              )}
            </div>
          }
        />
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        items={adminNavItems}
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        header={
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="text-h4 text-[var(--foreground)]">관리자</span>
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

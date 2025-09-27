'use client'

import { ReactNode } from 'react'
import SimpleSidebar from './sidebar'
import MobileBottomNav from './mobile-bottom-nav'
import MobileHeader from './mobile-header'
import { Search, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { useResponsive } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
  showMobileHeader?: boolean
  showMobileBottomNav?: boolean
}

export default function AppLayout({ 
  children, 
  pageTitle,
  showMobileHeader = true,
  showMobileBottomNav = true 
}: AppLayoutProps) {
  const { isMobile, shouldShowSidebar } = useResponsive()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggle = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className={cn(
      "flex bg-background w-full sidebar-layout",
      isMobile ? "flex-col mobile-min-vh" : "h-screen"
    )}>
      {/* Sidebar */}
      {shouldShowSidebar && (
        <SimpleSidebar 
          isOpen={sidebarOpen} 
          onToggle={toggle}
        />
      )}
      
      {/* Mobile Header */}
      {isMobile && showMobileHeader && (
        <MobileHeader 
          title={pageTitle}
          notification={{
            count: 3,
            onClick: () => console.log('Mobile notifications')
          }}
        />
      )}

      <div className="flex flex-1 flex-col w-full">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="flex h-16 items-center justify-between bg-card border-b border-border px-6 w-full">
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari resep, bahan, pesanan..."
                  className="w-64 pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SmartNotifications />
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-background",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className={cn(
            "w-full mx-auto",
            isMobile ? "max-w-none" : "max-w-7xl",
            // Add padding bottom for mobile bottom nav
            isMobile && showMobileBottomNav && "pb-20"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && showMobileBottomNav && (
        <MobileBottomNav />
      )}
    </div>
  )
}

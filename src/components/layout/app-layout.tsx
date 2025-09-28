'use client'

import { ReactNode } from 'react'
import SimpleSidebar from './sidebar'
import MobileHeader from './mobile-header'
import { Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { useMobileFirst } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
  showMobileHeader?: boolean
}

export default function AppLayout({ 
  children, 
  pageTitle,
  showMobileHeader = true
}: AppLayoutProps) {
  const { isMobile } = useMobileFirst()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggle = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className={cn(
      "flex bg-background w-full sidebar-layout",
      isMobile ? "flex-col mobile-min-vh" : "h-screen"
    )}>
      {/* Sidebar - Always show, works on mobile and desktop */}
      <SimpleSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggle}
      />
      
      {/* Mobile Header - Disabled for now, using sidebar */}
      {/* {isMobile && showMobileHeader && (
        <MobileHeader 
          title={pageTitle}
          notification={{
            count: 3,
            onClick: () => console.log('Mobile notifications')
          }}
        />
      )} */}

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
            isMobile ? "max-w-none" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

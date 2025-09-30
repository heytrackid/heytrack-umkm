'use client'

import { ReactNode, useState } from 'react'
import SimpleSidebar from './sidebar'
import MobileHeader from './mobile-header'
import { Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { useMobileFirst } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <div className={cn(
     "flex bg-background w-full sidebar-layout overflow-hidden",
      isMobile ?"flex-col mobile-min-vh" :"h-screen"
    )}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <SimpleSidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar}
        />
      )}
      
      {/* Mobile Header */}
      {isMobile && showMobileHeader && (
        <MobileHeader 
          title={pageTitle}
          sidebarOpen={mobileMenuOpen}
          onMenuToggle={toggleMobileMenu}
          notification={{
            count: 3,
            onClick: () => console.log('Mobile notifications')
          }}
        />
      )}

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Desktop Header */}
        {!isMobile && (
          <header className="flex h-16 items-center justify-between bg-card border-b border-border px-6 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={"Placeholder"}
                  className="w-64 pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SmartNotifications />
              <ThemeToggle />
              {/* User menu */}
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                User
              </Button>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
         "flex-1 overflow-auto bg-background min-w-0",
          isMobile ?"pt-0 p-4" :"p-6"
        )}>
          <div className={cn(
           "w-full mx-auto min-w-0",
            isMobile ?"max-w-none" :"max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

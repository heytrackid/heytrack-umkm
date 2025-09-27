'use client'

import { ReactNode } from 'react'
import AppSidebar from './sidebar'
import MobileBottomNav from './mobile-bottom-nav'
import MobileHeader from './mobile-header'
import { Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { useResponsive } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

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

  return (
    <SidebarProvider>
      <div className={cn(
        "flex bg-background",
        isMobile ? "flex-col mobile-min-vh" : "h-screen"
      )}>
        {/* Desktop Sidebar */}
        {shouldShowSidebar && <AppSidebar />}
        
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

        <div className="flex flex-1 flex-col">
          {/* Desktop Header */}
          {!isMobile && (
            <header className="flex h-16 items-center justify-between bg-card border-b border-border px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="md:hidden" />
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
            isMobile ? "p-4" : "p-6",
            // Add padding bottom for mobile bottom nav
            isMobile && showMobileBottomNav && "pb-20"
          )}>
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && showMobileBottomNav && <MobileBottomNav />}
      </div>
    </SidebarProvider>
  )
}

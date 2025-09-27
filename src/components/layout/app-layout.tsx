'use client'

import { ReactNode } from 'react'
import AppSidebar from './sidebar'
import MobileBottomNav from './mobile-bottom-nav'
import MobileHeader from './mobile-header'
import { Search, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { useResponsive } from '@/hooks/use-mobile'
import { useSidebar } from '@/hooks/useSidebar'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { toggle } = useSidebar()

  return (
    <div className={cn(
      "flex bg-background w-full sidebar-layout",
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

      <div className="flex flex-1 flex-col w-full">
        {/* Desktop Header */}
        {!isMobile && (
          <motion.header 
            className="flex h-16 items-center justify-between bg-card border-b border-border px-6 w-full"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className="h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
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
          </motion.header>
        )}

        {/* Main Content */}
        <motion.main 
          className={cn(
            "flex-1 overflow-auto bg-background",
            isMobile ? "p-4" : "p-6"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className={cn(
            "w-full mx-auto",
            isMobile ? "max-w-none" : "max-w-7xl",
            // Add padding bottom for mobile bottom nav
            isMobile && showMobileBottomNav && "pb-20"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pageTitle || 'default'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && showMobileBottomNav && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <MobileBottomNav />
        </motion.div>
      )}
    </div>
  )
}

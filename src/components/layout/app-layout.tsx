'use client'

import Link from 'next/link'
import { ReactNode, useState, useTransition } from 'react'
import SimpleSidebar from './sidebar'
import MobileHeader from './mobile-header'
import { Search, User, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { useMobileFirst } from '@/hooks/use-responsive'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/auth/actions'

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
  const [isLoggingOut, startLogout] = useTransition()
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  const handleLogout = () => {
    startLogout(() => logout())
  }

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
                  className="w-64 pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SmartNotifications />
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Akun
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Pengguna</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Keluar...' : 'Keluar'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

'use client'

import { useState, useEffect, memo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useMobile } from '@/hooks/useResponsive'
import { uiLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { Search, User } from 'lucide-react'
import MobileHeader from './mobile-header'
import Sidebar from './sidebar'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
  showMobileHeader?: boolean
}

const AppLayout = memo(({
  children,
  pageTitle,
  showMobileHeader = true
}: AppLayoutProps) => {
  const { isMobile } = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check auth state on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        void setUser(user)
      } catch (err: unknown) {
        const error = err as Error
        uiLogger.error({ error }, 'Error getting user:')
      } finally {
        void setLoading(false)
      }
    }

    void getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void setUser(session?.user ?? null)
        void setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    setSidebarOpen(!isMobile)

  }, [isMobile])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }

    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [isMobile, mobileMenuOpen])

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  // Keyboard shortcuts for sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close mobile menu
      if (e.key === 'Escape' && isMobile && mobileMenuOpen) {
        toggleMobileMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, mobileMenuOpen])

  return (
    <div className={cn(
      "flex bg-background w-full sidebar-layout overflow-hidden",
      isMobile ? "flex-col mobile-min-vh" : "h-screen"
    )}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-background shadow-lg transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar
            isOpen={mobileMenuOpen}
            onToggle={toggleMobileMenu}
            isMobile
          />
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && showMobileHeader && (
        <MobileHeader
          title={pageTitle}
          sidebarOpen={mobileMenuOpen}
          onMenuToggle={toggleMobileMenu}
          notification={{
            count: 3,
            onClick: () => uiLogger.debug('Mobile notifications clicked')
          }}
        />
      )}

      <div className={cn(
        "flex flex-1 flex-col min-w-0 overflow-hidden transition-all duration-300",
        !isMobile && "ml-72"
      )}>
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
              <ThemeToggle />
              {/* User Authentication */}
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      {user.email?.split('@')[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      Pengaturan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={async () => {
                        await supabase.auth.signOut()
                        void router.push('/auth/login')
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/auth/login')}
                  >
                    Masuk
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/auth/register')}
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-background min-w-0",
          isMobile ? "pt-0 p-4" : "p-6"
        )}>
          <div className={cn(
            "w-full mx-auto min-w-0",
            isMobile ? "max-w-none" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
})

export default AppLayout

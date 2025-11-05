'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { NotificationCenter } from '@/components/ui/notification-center'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useNotifications } from '@/hooks/useNotifications'
import { useResponsive } from '@/hooks/useResponsive'
import { uiLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { createClient } from '@/utils/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useState, type ReactNode } from 'react'

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
}

const AppLayout = memo(({
  children,
  pageTitle
}: AppLayoutProps) => {
  const { isMobile } = useResponsive()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Notifications
  const notifications = useNotifications()

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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2 px-3">
            {isMobile && pageTitle && (
              <h1 className="font-semibold text-lg">{pageTitle}</h1>
            )}
            {!isMobile && (
              <div className="relative w-full max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari..."
                  className="w-full pl-8"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter
              notifications={notifications.notifications}
              onMarkAsRead={notifications.markAsRead}
              onMarkAllAsRead={notifications.markAllAsRead}
              onClearAll={notifications.clearAll}
            />
            <ThemeToggle />
            
            {/* User Authentication */}
            {loading && (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            )}
            
            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
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
            )}
            
            {!loading && !user && (
              <div className="flex items-center gap-2">
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
                  className="hidden sm:inline-flex"
                >
                  Daftar
                </Button>
              </div>
            )}
          </div>
        </header>
        <main className={cn(
          "flex-1 overflow-auto p-4 md:p-6"
        )}>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
})

AppLayout.displayName = 'AppLayout'

export default AppLayout

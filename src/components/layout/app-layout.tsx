'use client'

import { Download, User } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import { SmartBottomNav } from '@/components/navigation/SmartNavigation'
import { TabNavigation } from '@/components/navigation/TabNavigation'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { LoadingState } from '@/components/ui/loading-state'

import { NotificationBell } from '@/components/layout/NotificationBell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationProvider } from '@/contexts/notification-context'
import { useAuth } from '@/hooks/useAuth'
import { useInstantNavigation } from '@/hooks/useInstantNavigation'
import { cn } from '@/lib/utils'

import { uiLogger } from '@/lib/client-logger'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useResponsive } from '@/utils/responsive'

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
}

export const AppLayout = memo(({ children }: AppLayoutProps) => {
  const { user, isLoading: loading, isAuthenticated } = useAuth()
  const { prefetchRoute } = useInstantNavigation()
  const router = useRouter()
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state to prevent hydration mismatch
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // Prefetch critical routes on mount for faster navigation
  useEffect(() => {
    if (user) {
      const criticalRoutes = ['/dashboard', '/orders', '/customers', '/ingredients']
      criticalRoutes.forEach((route) => {
        void prefetchRoute(route)
      })
    }
  }, [user, prefetchRoute])

  // Responsive detection
  const { isMobile } = useResponsive()



  // Supabase client
  const { supabase: _supabase } = useSupabase()

  // Swipe gesture support for mobile navigation
  useEffect(() => {
    if (!isMobile || !mounted) {
      return
    }

    const mainContent = mainContentRef.current
    if (!mainContent) {
      return
    }

    let startX = 0
    let startY = 0
    let isHorizontalSwipe = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }
      isHorizontalSwipe = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY || !e.touches[0]) {
        return
      }

      const deltaX = e.touches[0].clientX - startX
      const deltaY = e.touches[0].clientY - startY

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        isHorizontalSwipe = true
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isHorizontalSwipe || !startX || !e.changedTouches[0]) {
        return
      }

      const endX = e.changedTouches[0].clientX
      const deltaX = endX - startX

      if (Math.abs(deltaX) < 100) {
        return
      }

      const currentPath = window.location.pathname
      const navOrder = ['/dashboard', '/orders', '/customers', '/ingredients']

      const currentIndex = navOrder.findIndex(
        (path) => currentPath === path || (path !== '/' && currentPath.startsWith(path))
      )

      if (currentIndex === -1) {
        return
      }

      let nextIndex
      if (deltaX > 0) {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : navOrder.length - 1
      } else {
        nextIndex = currentIndex < navOrder.length - 1 ? currentIndex + 1 : 0
      }

      const nextPath = navOrder[nextIndex]
      if (nextPath && nextPath !== currentPath) {
        router.push(nextPath)
      }

      startX = 0
      startY = 0
      isHorizontalSwipe = false
    }

    mainContent.addEventListener('touchstart', handleTouchStart, { passive: true })
    mainContent.addEventListener('touchmove', handleTouchMove, { passive: false })
    mainContent.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      mainContent.removeEventListener('touchstart', handleTouchStart)
      mainContent.removeEventListener('touchmove', handleTouchMove)
      mainContent.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, router, mounted])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoadingState size="md" />
      </div>
    )
  }

  return (
    <GlobalErrorBoundary>
      <NotificationProvider>
        <div className="min-h-screen bg-background">
          {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            {!isMobile && (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">HT</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">HeyTrack</span>
                  <span className="text-muted-foreground text-xs">UMKM Management</span>
                </div>
              </>
            )}
          </div>

            <div className="flex items-center gap-2">

              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/export/global')
                    if (response.ok) {
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `heytrack-export-${new Date().toISOString().split('T')[0]}.xlsx`
                      document['body'].appendChild(a)
                      a.click()
                      document['body'].removeChild(a)
                      window.URL.revokeObjectURL(url)
                    } else {
                      uiLogger.error({}, 'Failed to export data')
                    }
                  } catch (error) {
                    uiLogger.error({ error }, 'Error exporting data')
                  }
                }}
                title="Export Data"
              >
                <Download className="h-4 w-4" />
              </Button>
              <ThemeToggle />
              {!loading && user && <NotificationBell />}

              {/* User Authentication */}
              {loading && <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />}

              {!loading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      Pengaturan
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/handler/sign-out')}
                      className="text-red-600 focus:text-red-600"
                    >
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {!loading && !isAuthenticated && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/handler/sign-in')}
                  >
                    Masuk
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push('/handler/sign-up')}
                    className="hidden sm:inline-flex"
                  >
                    Daftar
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Tab Navigation - Desktop Only */}
          {!isMobile && <TabNavigation />}

          {/* Main Content */}
          <main
            ref={mainContentRef}
            className={cn(
              "flex-1 overflow-auto bg-background",
              isMobile && "pb-[calc(56px+env(safe-area-inset-bottom))]"
            )}
          >
            <div className="container mx-auto h-full px-4 py-6 md:px-6 md:py-8">{children}</div>
          </main>

        {/* Bottom Navigation for Mobile */}
        {isMobile && <SmartBottomNav />}
        </div>
      </NotificationProvider>
    </GlobalErrorBoundary>
  )
})

AppLayout.displayName = 'AppLayout'

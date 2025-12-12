'use client'

import { useRouter } from 'next/navigation'
import { memo, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import { Sidebar } from '@/components/navigation/Sidebar'
import { SmartBottomNav } from '@/components/navigation/SmartNavigation'
import { WelcomeModal } from '@/components/onboarding'
import { UpdateBanner } from '@/components/shared/UpdateBanner'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LoadingState } from '@/components/ui/loading-state'

import { NotificationBell } from '@/components/layout/NotificationBell'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NotificationProvider } from '@/contexts/notification-context'
import { useAuth } from '@/hooks/useAuth'
import { useInstantNavigation } from '@/hooks/useInstantNavigation'
import { cn } from '@/lib/utils'

import { useSupabase } from '@/providers/SupabaseProvider'
import { useResponsive } from '@/utils/responsive'

interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
}

export const AppLayout = memo(({ children }: AppLayoutProps) => {
  const { user, isLoading: loading } = useAuth()
  const { prefetchRoute } = useInstantNavigation()
  const router = useRouter()
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user) {
      const criticalRoutes = ['/dashboard', '/orders', '/customers', '/ingredients']
      criticalRoutes.forEach((route) => {
        void prefetchRoute(route)
      })
    }
  }, [user, prefetchRoute])

  const { isMobile } = useResponsive()
  const { supabase: _supabase } = useSupabase()


  // Swipe gesture support for mobile navigation
  useEffect(() => {
    if (!isMobile || !mounted) return

    const mainContent = mainContentRef.current
    if (!mainContent) return

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
      if (!startX || !startY || !e.touches[0]) return

      const deltaX = e.touches[0].clientX - startX
      const deltaY = e.touches[0].clientY - startY

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        isHorizontalSwipe = true
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isHorizontalSwipe || !startX || !e.changedTouches[0]) return

      const endX = e.changedTouches[0].clientX
      const deltaX = endX - startX

      if (Math.abs(deltaX) < 100) return

      const currentPath = window.location.pathname
      const navOrder = ['/dashboard', '/orders', '/customers', '/ingredients']

      const currentIndex = navOrder.findIndex(
        (path) => currentPath === path || (path !== '/' && currentPath.startsWith(path))
      )

      if (currentIndex === -1) return

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
        <div className="min-h-screen bg-background flex">
          {/* Update Banner */}
          <UpdateBanner />

          {/* Sidebar - Fixed position, desktop only */}
          {!isMobile && (
            <Sidebar
              collapsed={sidebarCollapsed}
              onCollapsedChange={setSidebarCollapsed}
            />
          )}

          {/* Main wrapper - takes remaining space */}
          <div
            className={cn(
              'flex-1 flex flex-col min-h-screen transition-all duration-300',
              !isMobile && (sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64')
            )}
          >
            {/* Top Header */}
            <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
              <div className="flex-1">
                {isMobile && (
                  <h1 className="text-sm font-semibold text-foreground/80">HeyTrack</h1>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {!loading && user && <NotificationBell />}

                {!loading && user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm font-medium truncate">{user.email}</div>
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
              </div>
            </header>

            {/* Main Content */}
            <main
              ref={mainContentRef}
              className={cn(
                'flex-1 bg-background p-4 md:p-6',
                isMobile && 'pb-[calc(56px+env(safe-area-inset-bottom))]'
              )}
            >
              <div className="mx-auto max-w-7xl space-y-4">{children}</div>
            </main>
          </div>

          {/* Bottom Navigation for Mobile */}
          {isMobile && <SmartBottomNav />}

          {/* Welcome Modal & Onboarding Chatbot */}
          {!loading && user && (
            <>
              <WelcomeModal />
            </>
          )}
        </div>
      </NotificationProvider>
    </GlobalErrorBoundary>
  )
})

AppLayout.displayName = 'AppLayout'

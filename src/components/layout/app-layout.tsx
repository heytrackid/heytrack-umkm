'use client'

import {
  BarChart3,
  Calculator,
  CircleDollarSign,
  Download,
  Factory,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Truck,
  User,
  Users,
  Utensils,
  Wallet
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo, useEffect, useLayoutEffect, useState, useRef, type ReactNode } from 'react'

import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import { TabNavigation } from '@/components/layout/TabNavigation'
import { SmartBottomNav } from '@/components/navigation/SmartNavigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { NotificationCenter } from '@/components/ui/notification-center'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useInstantNavigation } from '@/hooks/useInstantNavigation'
import { useNotifications } from '@/hooks/useNotifications'
import { uiLogger } from '@/lib/client-logger'
import { useAuth } from '@/providers/AuthProvider'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useResponsive } from '@/utils/responsive'


interface AppLayoutProps {
  children: ReactNode
  pageTitle?: string
}

const mainTabs = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Inventori',
    icon: Package,
    items: [
      { label: 'Bahan Baku', href: '/ingredients', icon: Package },
      { label: 'Resep', href: '/recipes', icon: Utensils },
      { label: 'Pemasok', href: '/suppliers', icon: Truck },
      { label: 'HPP', href: '/hpp', icon: Calculator }
    ]
  },
  {
    label: 'Manajemen',
    icon: Users,
    items: [
      { label: 'Pelanggan', href: '/customers', icon: Users }
    ]
  },
  {
    label: 'Operasional',
    icon: Factory,
    items: [
      { label: 'Produksi', href: '/production', icon: Factory },
      { label: 'Pesanan', href: '/orders', icon: ShoppingCart },
      { label: 'Biaya Operasional', href: '/operational-costs', icon: Receipt }
    ]
  },
  {
    label: 'Keuangan',
    icon: Wallet,
    items: [
      { label: 'Arus Kas', href: '/cash-flow', icon: CircleDollarSign },
      { label: 'Profit', href: '/profit', icon: TrendingUp }
    ]
  },
  { label: 'AI Chatbot', href: '/ai-chatbot', icon: MessageSquare, badge: '✨' },
  {
    label: 'Analitik',
    icon: BarChart3,
    items: [
      { label: 'Laporan', href: '/reports', icon: FileText }
    ]
  }
]

const AppLayout = memo(({
  children
}: AppLayoutProps) => {
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
      // Prefetch common routes after user loads
      const criticalRoutes = ['/dashboard', '/orders', '/customers', '/ingredients']
      criticalRoutes.forEach(route => {
        void prefetchRoute(route)
      })
    }
  }, [user, prefetchRoute])

  // Responsive detection
  const { isMobile } = useResponsive()

  // Notifications
  const notifications = useNotifications()

  // Supabase client
  const { supabase } = useSupabase()



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

      // Determine if this is a horizontal swipe (more horizontal than vertical movement)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        isHorizontalSwipe = true
        e.preventDefault() // Prevent scrolling when swiping horizontally
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isHorizontalSwipe || !startX || !e.changedTouches[0]) {
        return
      }

      const endX = e.changedTouches[0].clientX
      const deltaX = endX - startX

      // Minimum swipe distance (100px)
      if (Math.abs(deltaX) < 100) {
        return
      }

      // Get current path to determine navigation
      const currentPath = window.location.pathname

      // Define navigation order for swipe gestures
      const navOrder = ['/dashboard', '/orders', '/customers', '/ingredients']

      const currentIndex = navOrder.findIndex(path =>
        currentPath === path || (path !== '/' && currentPath.startsWith(path))
      )

      if (currentIndex === -1) {
        return
      }

      let nextIndex
      if (deltaX > 0) {
        // Swipe right - go to previous item
        nextIndex = currentIndex > 0 ? currentIndex - 1 : navOrder.length - 1
      } else {
        // Swipe left - go to next item
        nextIndex = currentIndex < navOrder.length - 1 ? currentIndex + 1 : 0
      }

      const nextPath = navOrder[nextIndex]
      if (nextPath && nextPath !== currentPath) {
        router.push(nextPath)
      }

      // Reset swipe state
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <GlobalErrorBoundary>
      <div className="flex h-screen flex-col">
      {/* Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold text-sm">HT</span>
          </div>
          <span className="hidden font-semibold md:inline">HeyTrack</span>
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter
            notifications={notifications.notifications}
            onMarkAsRead={notifications.markAsRead}
            onMarkAllAsRead={notifications.markAllAsRead}
            onClearAll={notifications.clearAll}
          />
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
                  uiLogger.error('Failed to export data')
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

          {/* User Authentication */}
          {loading && (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
          )}

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
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/auth/login')
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!loading && !user && !isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>
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

      {/* Conditional Navigation: Tab Navigation for tablet/desktop, Bottom Nav for mobile */}
      {!isMobile && <TabNavigation tabs={mainTabs} />}

       {/* Main Content */}
       <main
         ref={mainContentRef}
          className={`flex-1 overflow-auto bg-background ${isMobile ? 'pb-[calc(56px+env(safe-area-inset-bottom))]' : ''}`}
       >
         <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
           {children}
         </div>
       </main>

      {/* Bottom Navigation for Mobile */}
      {isMobile && <SmartBottomNav />}
      </div>
    </GlobalErrorBoundary>
  )
})

AppLayout.displayName = 'AppLayout'

export default AppLayout

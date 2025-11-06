'use client'

import { TabNavigation } from '@/components/layout/TabNavigation'
import { SmartBottomNav } from '@/components/navigation/SmartNavigation'
import { Button } from '@/components/ui/button'
import { GlobalErrorBoundary } from '@/components/error-boundaries/GlobalErrorBoundary'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { NotificationCenter } from '@/components/ui/notification-center'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useNotifications } from '@/hooks/useNotifications'
import { useResponsive } from '@/hooks/responsive'
import { uiLogger } from '@/lib/logger'
import { useSupabase } from '@/providers/SupabaseProvider'
import type { User as SupabaseUser } from '@supabase/supabase-js'
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
import { memo, useEffect, useState, type ReactNode } from 'react'

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
      { label: 'Kategori Produk', href: '/categories', icon: Package },
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
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Responsive detection
  const { isMobile } = useResponsive()

  // Notifications
  const notifications = useNotifications()

  // Supabase client
  const { supabase } = useSupabase()

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
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
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
      <main className="flex-1 overflow-auto bg-background">
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

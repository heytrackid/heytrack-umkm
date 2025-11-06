'use client'

import { NotificationBell } from '@/components/notifications/NotificationBell'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useMobile } from '@/hooks/responsive'
import { uiLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useSupabase } from '@/providers/SupabaseProvider'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import {
    ArrowLeft,
    Menu,
    MoreVertical,
    Search,
    User,
    X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react'

interface MobileHeaderProps {
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
  actions?: ReactNode[]
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  notification?: {
    count: number
    onClick: () => void
  }
  className?: string
  onMenuToggle?: () => void

}

const MobileHeader = ({
  title,
  showBackButton,
  onBackClick,
  actions,
  showSearch = true,
  searchPlaceholder = "Cari...",
  onSearch,
  notification: _notification,
  className,
  onMenuToggle,

}: MobileHeaderProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { isMobile } = useMobile()
  const router = useRouter()
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
      (_event: string, session: { user: SupabaseUser | null } | null) => {
        void setUser(session?.user ?? null)
        void setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSearchSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }, [onSearch, searchQuery])

  const handleSearchToggle = useCallback(() => {
    void setIsSearchExpanded(!isSearchExpanded)
    if (isSearchExpanded) {
      void setSearchQuery('')
    }
  }, [isSearchExpanded])

  // Auto-collapse search on outside click
  useEffect(() => {
    if (!isSearchExpanded) { return }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        void setIsSearchExpanded(false)
        void setSearchQuery('')
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isSearchExpanded])

  if (!isMobile) {
    return null // Only render on mobile
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        "bg-background/95 backdrop-blur-sm border-b border-border",
        "transition-transform duration-300 ease-in-out",
        "supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {/* Main Header */}
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-2 flex-1">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="p-2 h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-10 w-10"
              onClick={onMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Title - Hidden when search is expanded */}
          {!isSearchExpanded && title && (
            <h1 className="font-semibold text-lg text-wrap-mobile">
              {title}
            </h1>
          )}
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div
            className={cn(
              "flex items-center transition-all duration-300",
              isSearchExpanded ? "flex-1 mx-2" : ""
            )}
            data-search-container
          >
            {isSearchExpanded ? (
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-9 pr-9"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchToggle}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchToggle}
                className="p-2"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Dark/Light Mode Toggle */}
          <ThemeToggle />

          {/* Custom Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center space-x-1">
              {actions.slice(0, 2).map((action, index: number) => (
                <div key={index}>{action}</div>
              ))}
              {actions.length > 2 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.slice(2).map((action, index: number) => (
                      <DropdownMenuItem key={index + 2} asChild>
                        {action}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* User Authentication */}
          {loading && (
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          )}
          
          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <User className="h-5 w-5" />
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
      </div>
    </header>
  )
}

export default MobileHeader

// Pre-built header variants for common use cases
export const DashboardHeader = () => (
  <MobileHeader
    title="Dashboard"
    notification={{
      count: 5,
      onClick: () => uiLogger.debug('Notifications clicked')
    }}
  />
)

export const PageHeader = ({
  title,
  showBackButton = true,
  actions
}: {
  title: string
  showBackButton?: boolean
  actions?: ReactNode[]
}) => (
  <MobileHeader
    title={title}
    showBackButton={showBackButton}
    onBackClick={() => window.history.back()}
    actions={actions}
    showSearch={false}
  />
)

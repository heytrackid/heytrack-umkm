'use client'

import {
    ArrowLeft,
    Menu,
    MoreVertical,
    Search,
    User,
    X
} from '@/components/icons'
import { useRouter } from 'next/navigation'
import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react'


import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/hooks/useAuth'
import { uiLogger } from '@/lib/logger'
import { cn } from '@/lib/utils'
import { useMobile } from '@/utils/responsive'

interface MobileHeaderProps {
  title?: string | undefined
  showBackButton?: boolean | undefined
  onBackClick?: (() => void) | undefined
  actions?: ReactNode[] | undefined
  showSearch?: boolean | undefined
  searchPlaceholder?: string | undefined
  onSearch?: ((query: string) => void) | undefined

  className?: string
  onMenuToggle?: () => void

}

export const MobileHeader = ({
  title,
  showBackButton,
  onBackClick,
  actions,
  showSearch = true,
  searchPlaceholder = "Cari...",
  onSearch,

  className,
  onMenuToggle,

}: MobileHeaderProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isMobile } = useMobile()
  const router = useRouter()
  const { user, isLoading: loading } = useAuth()

  const handleSearchSubmit = useCallback((e: FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }, [onSearch, searchQuery])

  const handleSearchToggle = useCallback(() => {
    setIsSearchExpanded(!isSearchExpanded)
    if (isSearchExpanded) {
      setSearchQuery('')
    }
  }, [isSearchExpanded])

  // Auto-collapse search on outside click
  useEffect(() => {
    if (!isSearchExpanded) { return }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.search-container')) {
        setIsSearchExpanded(false)
        setSearchQuery('')
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
        "bg-background/95 backdrop-blur-sm border-b border-border/20",
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

          {/* Logo and Title - Hidden when search is expanded */}
          {!isSearchExpanded && (
            <>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground mr-2 cursor-pointer"
                onClick={() => router.push('/dashboard')}
              >
                <span className="font-bold text-sm">HT</span>
              </div>
              {title && (
                <h1 className="font-semibold text-lg text-wrap-mobile">
                  {title}
                </h1>
              )}
            </>
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-9 pr-9"

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
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
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
                  onClick={() => router.push('/auth/logout')}
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

 // Pre-built header variants for common use cases
export const DashboardHeader = (): JSX.Element => (
  <MobileHeader
    title="Dashboard"
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

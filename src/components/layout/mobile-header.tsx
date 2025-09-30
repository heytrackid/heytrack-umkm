'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import SmartNotifications from '@/components/automation/smart-notifications'
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  ArrowLeft,
  MoreVertical,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
// Clerk removed for development
// import { 
//   SignInButton, 
//   SignUpButton, 
//   SignedIn, 
//   SignedOut, 
//   UserButton 
// } from '@clerk/nextjs'
import { useMobileFirst } from '@/hooks/use-responsive'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from"@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from"@/components/ui/dropdown-menu"
import SimpleSidebar from './sidebar'

interface MobileHeaderProps {
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
  actions?: React.ReactNode[]
  showSearch?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  notification?: {
    count: number
    onClick: () => void
  }
  className?: string
  onMenuToggle?: () => void
  sidebarOpen?: boolean
}

export default function MobileHeader({
  title,
  showBackButton,
  onBackClick,
  actions,
  showSearch = true,
  searchPlaceholder ="Cari...",
  onSearch,
  notification,
  className,
  onMenuToggle,
  sidebarOpen
}: MobileHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isMobile } = useMobileFirst()
  const router = useRouter()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (isSearchExpanded) {
      setSearchQuery('')
    }
  }

  // Auto-collapse search on outside click
  useEffect(() => {
    if (!isSearchExpanded) return

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
            <Sheet open={sidebarOpen} onOpenChange={onMenuToggle}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 h-10 w-10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu Navigasi</SheetTitle>
                </SheetHeader>
                <div className="h-full">
                  <SimpleSidebar isMobile={true} />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Title - Hidden when search is expanded */}
          {!isSearchExpanded && title && (
            <h1 className="font-semibold text-lg truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div 
            className={cn(
             "flex items-center transition-all duration-300",
              isSearchExpanded ?"flex-1 mx-2" :""
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
          {/* Dark/Light Mode Toggle */}
          <ThemeToggle />
          
          {/* Smart Notification - Shared component with desktop */}
          <SmartNotifications />

          {/* Custom Actions */}
          {actions && actions.length > 0 && (
            <div className="flex items-center space-x-1">
              {actions.slice(0, 2).map((action, index) => (
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
                    {actions.slice(2).map((action, index) => (
                      <DropdownMenuItem key={index + 2} asChild>
                        {action}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Simple User Menu for Development */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={() => router.push('/settings')}
            aria-label="Open settings"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}

// Pre-built header variants for common use cases
export function DashboardHeader() {
  return (
    <MobileHeader
      title="Dashboard"
      notification={{
        count: 5,
        onClick: () => console.log('Notifications clicked')
      }}
    />
  )
}

export function PageHeader({ 
  title, 
  showBackButton = true,
  actions 
}: { 
  title: string
  showBackButton?: boolean
  actions?: React.ReactNode[]
}) {
  return (
    <MobileHeader
      title={title}
      showBackButton={showBackButton}
      onBackClick={() => window.history.back()}
      actions={actions}
      showSearch={false}
    />
  )
}
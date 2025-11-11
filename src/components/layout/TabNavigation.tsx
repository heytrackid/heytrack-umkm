'use client'

import { ChevronDown, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useRoutePreloader } from '@/hooks/use-preloader'
import { prefetchRoute } from '@/lib/route-loader'
import { cn } from '@/lib/utils'

interface TabItem {
  label: string
  href?: string
  icon?: LucideIcon
  badge?: number | string
  items?: Array<{
    label: string
    href: string
    icon?: LucideIcon
    description?: string
  }>
}

interface TabNavigationProps {
  tabs: TabItem[]
}

const HOVER_PREFETCH_DELAY = 100

export const TabNavigation = ({ tabs }: TabNavigationProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { preloadOnHover } = useRoutePreloader()
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>()
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const closeTimeoutRef = useRef<NodeJS.Timeout>()
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  const handlePrefetch = useCallback(
    (href: string) => {
      const heavyRoutes = ['/reports', '/orders', '/recipes', '/ai-chatbot', '/ingredients', '/admin']
      if (heavyRoutes.includes(href)) {
        if (prefetchTimeoutRef.current) {
          clearTimeout(prefetchTimeoutRef.current)
        }
        prefetchTimeoutRef.current = setTimeout(() => {
          router.prefetch(href)
          prefetchRoute(href)
          const { preload } = preloadOnHover(href, 50)
          preload()
        }, HOVER_PREFETCH_DELAY)
      }
    },
    [router, preloadOnHover]
  )

  const handleMouseEnter = useCallback((label: string) => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    // Set hover timeout to open after a short delay
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenPopover(label)
    }, 150) // Small delay to prevent accidental opens
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Clear hover timeout if mouse leaves before opening
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    // Set close timeout
    closeTimeoutRef.current = setTimeout(() => {
      setOpenPopover(null)
    }, 200) // Delay before closing to allow moving to popover
  }, [])

  useEffect(
    () => () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current)
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    },
    []
  )

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center gap-1 overflow-x-auto px-4 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const hasDropdown = tab.items && tab.items.length > 0
          const active = tab.href ? isActive(tab.href) : tab.items?.some((item) => isActive(item.href))

          // Simple link tab
          if (!hasDropdown && tab.href) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                onMouseEnter={() => tab.href && handlePrefetch(tab.href)}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </Link>
            )
          }

          // Dropdown tab
          return (
            <div
              key={tab.label}
              onMouseEnter={() => handleMouseEnter(tab.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Popover open={openPopover === tab.label} onOpenChange={(open) => !open && setOpenPopover(null)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-medium',
                      active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                    onMouseEnter={() => tab.href && handlePrefetch(tab.href)}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="whitespace-nowrap">{tab.label}</span>
                    <ChevronDown className={cn('h-3 w-3 transition-transform', openPopover === tab.label && 'rotate-180')} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[400px] p-2"
                  align="start"
                  onMouseEnter={() => {
                    // Keep popover open when hovering over it
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current)
                    }
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="grid gap-1">
                    {tab.items?.map((item) => {
                      const ItemIcon = item.icon
                      const itemActive = isActive(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenPopover(null)}
                          className={cn(
                            'flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-accent hover:text-accent-foreground',
                            itemActive && 'bg-accent text-accent-foreground font-medium'
                          )}
                          onMouseEnter={() => handlePrefetch(item.href)}
                        >
                          {ItemIcon && <ItemIcon className="h-4 w-4 shrink-0 mt-0.5" />}
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium leading-none">{item.label}</div>
                            {item.description && (
                              <p className="text-xs leading-snug text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )
        })}
      </div>
    </div>
  )
}



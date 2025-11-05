'use client'

import { cn } from '@/lib/utils'
import { ChevronDown, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface TabItem {
  label: string
  href?: string
  icon?: LucideIcon
  badge?: string | number
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

export const TabNavigation = ({ tabs }: TabNavigationProps) => {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [showLeftShadow, setShowLeftShadow] = useState(false)
  const [showRightShadow, setShowRightShadow] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [dropdownPositions, setDropdownPositions] = useState<Record<string, { top: number; left: number }>>({})
  const closeTimeoutRef = useRef<NodeJS.Timeout>()

  const isActive = (href: string) => {
    if (href === '/dashboard') {return pathname === href}
    return pathname.startsWith(href)
  }

  const isGroupActive = (items?: Array<{ href: string }>) => {
    if (!items) {return false}
    return items.some((item) => isActive(item.href))
  }

  const handleMouseEnter = (label: string) => {
    if (isMobile) {return}
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setOpenDropdown(label)
  }

  const handleMouseLeave = () => {
    if (isMobile) {return}
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  const handleClick = (label: string) => {
    if (isMobile) {
      // On mobile, toggle the dropdown
      setOpenDropdown(openDropdown === label ? null : label)
    } else {
      // On desktop, if dropdown is closed, open it. If it's open, navigation happens via links in dropdown
      setOpenDropdown(openDropdown === label ? null : label)
    }
  }

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) {return}
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftShadow(scrollLeft > 0)
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    handleScroll()
    const ref = scrollRef.current
    ref?.addEventListener('scroll', handleScroll)
    return () => ref?.removeEventListener('scroll', handleScroll)
  }, [])

  // Update dropdown positions when they open or when the window is resized
  useEffect(() => {
    if (openDropdown && tabButtonRefs.current[openDropdown]) {
      const buttonEl = tabButtonRefs.current[openDropdown]
      if (buttonEl) {
        const rect = buttonEl.getBoundingClientRect()
        setDropdownPositions(prev => ({
          ...prev,
          [openDropdown]: {
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
          }
        }))
      }
    }
  }, [openDropdown])

  // Handle window resize and scroll to update positions
  useEffect(() => {
    const updatePositions = () => {
      if (openDropdown && tabButtonRefs.current[openDropdown]) {
        const buttonEl = tabButtonRefs.current[openDropdown]
        if (buttonEl) {
          const rect = buttonEl.getBoundingClientRect()
          setDropdownPositions(prev => ({
            ...prev,
            [openDropdown]: {
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX
            }
          }))
        }
      }
    }

    window.addEventListener('resize', updatePositions)
    // We also need to listen to scroll events that might affect the position
    const scrollContainer = scrollRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updatePositions)
    }

    return () => {
      window.removeEventListener('resize', updatePositions)
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updatePositions)
      }
    }
  }, [openDropdown])

  return (
    <div className="relative z-[9998] border-b border-border bg-background">
      {/* Left shadow */}
      {showLeftShadow && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-background" />
      )}

      {/* Tabs container */}
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto overflow-y-visible px-4 scrollbar-none py-1 relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const hasDropdown = tab.items && tab.items.length > 0
          const active = tab.href ? isActive(tab.href) : isGroupActive(tab.items)
          const isOpen = openDropdown === tab.label

          // Simple link tab
          if (!hasDropdown && tab.href) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'group relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-primary hover:bg-muted/30 hover:text-foreground'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
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
              className="relative"
              onMouseEnter={() => handleMouseEnter(tab.label)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleClick(tab.label)}
                ref={(el) => {
                  tabButtonRefs.current[tab.label] = el
                }}
                className={cn(
                  'group relative flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-primary hover:bg-muted/30 hover:text-foreground'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="whitespace-nowrap">{tab.label}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
              </button>

              {/* Dropdown menu */}
              {isOpen && tab.items && (
                <div
                  className="fixed z-[9999] mt-0 min-w-[200px] rounded-md border border-border bg-popover p-1 shadow-lg"
                  style={{
                    top: `${dropdownPositions[tab.label]?.top || 0}px`,
                    left: `${dropdownPositions[tab.label]?.left || 0}px`,
                  }}
                  onMouseEnter={() => handleMouseEnter(tab.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {tab.items.map((item) => {
                    const ItemIcon = item.icon
                    const itemActive = isActive(item.href)

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={cn(
                          'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                          itemActive
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {ItemIcon && <ItemIcon className="h-4 w-4 shrink-0" />}
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Right shadow */}
      {showRightShadow && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-background" />
      )}
    </div>
  )
}

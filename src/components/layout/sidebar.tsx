'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Calculator,
  Warehouse,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Receipt,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface NavigationGroup {
  title: string
  items: {
    name: string
    href: string
    icon: any
  }[]
}

const navigationGroups: NavigationGroup[] = [
  {
    title: 'Dashboard',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      }
    ]
  },
  {
    title: 'Produksi',
    items: [
      {
        name: 'Resep',
        href: '/recipes',
        icon: ChefHat,
      },
      {
        name: 'HPP Calculator',
        href: '/hpp',
        icon: Calculator,
      },
      {
        name: 'Produksi',
        href: '/production',
        icon: TrendingUp,
      }
    ]
  },
  {
    title: 'Inventory',
    items: [
      {
        name: 'Bahan Baku',
        href: '/ingredients',
        icon: Package,
      },
      {
        name: 'Stok & Inventory',
        href: '/inventory',
        icon: Warehouse,
      }
    ]
  },
  {
    title: 'Penjualan',
    items: [
      {
        name: 'Pesanan',
        href: '/orders',
        icon: ShoppingCart,
      },
      {
        name: 'Pelanggan',
        href: '/customers',
        icon: Users,
      }
    ]
  },
  {
    title: 'Keuangan',
    items: [
      {
        name: 'Keuangan',
        href: '/finance',
        icon: CreditCard,
      },
      {
        name: 'Biaya Operasional',
        href: '/expenses',
        icon: Receipt,
      }
    ]
  },
  {
    title: 'Laporan & Pengaturan',
    items: [
      {
        name: 'Laporan',
        href: '/reports',
        icon: BarChart3,
      },
      {
        name: 'Pengaturan',
        href: '/settings',
        icon: Settings,
      }
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Dashboard'])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(false) // Reset collapse state on mobile
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleCollapse = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const closeMobile = () => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  const toggleGroup = (groupTitle: string) => {
    if (isCollapsed) return // Don't allow toggle when collapsed
    
    setExpandedGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  const isGroupExpanded = (groupTitle: string) => {
    return expandedGroups.includes(groupTitle)
  }

  // Check if current path belongs to any item in the group
  const isGroupActive = (group: NavigationGroup) => {
    return group.items.some(item => pathname === item.href)
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button - Fixed Position */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCollapse}
          aria-label="Toggle menu"
          className="fixed top-4 left-4 z-50 md:hidden bg-background border-border"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Mobile Backdrop */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={closeMobile}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Mobile Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="ml-2 text-xl font-bold text-foreground">Bakery MS</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobile}
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigationGroups.map((group) => (
                <li key={group.title}>
                  {/* Group Header */}
                  <div className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {group.title}
                  </div>
                  {/* Group Items */}
                  <ul className="space-y-1 mb-4">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.name}>
                          <Link href={item.href} onClick={closeMobile}>
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-start px-3 py-2 transition-all duration-200",
                                isActive 
                                  ? "bg-orange-600 text-white hover:bg-orange-700" 
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              <item.icon className="mr-2 h-4 w-4 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </Button>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <div className={cn(
      "hidden md:flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Toggle Button */}
      <div className="flex h-16 items-center border-b border-border px-4">
        {!isCollapsed && (
          <>
            <ChefHat className="h-8 w-8 text-orange-600" />
            <span className="ml-2 text-xl font-bold text-foreground">Bakery MS</span>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "h-8 w-8 shrink-0",
            isCollapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navigationGroups.map((group) => {
            const groupActive = isGroupActive(group)
            const groupExpanded = isGroupExpanded(group.title)
            
            return (
              <li key={group.title}>
                {/* Group Header/Toggle */}
                {group.items.length === 1 ? (
                  // Single item groups render directly
                  group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full transition-all duration-200 mb-2",
                            isCollapsed ? "justify-center px-2" : "justify-start px-3",
                            isActive 
                              ? "bg-orange-600 text-white hover:bg-orange-700" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 shrink-0",
                            isCollapsed ? "" : "mr-2"
                          )} />
                          {!isCollapsed && (
                            <span className="truncate">{item.name}</span>
                          )}
                        </Button>
                      </Link>
                    )
                  })
                ) : (
                  // Multi-item groups render with dropdown
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => toggleGroup(group.title)}
                      className={cn(
                        "w-full transition-all duration-200 mb-1",
                        isCollapsed ? "justify-center px-2" : "justify-between px-3",
                        groupActive 
                          ? "text-orange-600 hover:text-orange-700 font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      title={isCollapsed ? group.title : undefined}
                      disabled={isCollapsed}
                    >
                      {isCollapsed ? (
                        // Show first icon of group when collapsed
                        (() => {
                          const IconComponent = group.items[0].icon
                          return <IconComponent className="h-4 w-4 shrink-0" />
                        })()
                      ) : (
                        <>
                          <span className="truncate text-sm font-medium">{group.title}</span>
                          {groupExpanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                        </>
                      )}
                    </Button>
                    
                    {/* Group Items */}
                    {!isCollapsed && groupExpanded && (
                      <ul className="ml-3 space-y-1 mb-2">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href
                          return (
                            <li key={item.name}>
                              <Link href={item.href}>
                                <Button
                                  variant={isActive ? "default" : "ghost"}
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start px-3 py-1.5 transition-all duration-200",
                                    isActive 
                                      ? "bg-orange-600 text-white hover:bg-orange-700" 
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  <item.icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate text-sm">{item.name}</span>
                                </Button>
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Collapse indicator */}
      {isCollapsed && (
        <div className="px-2 py-2 border-t border-border">
          <div className="h-8 flex items-center justify-center">
            <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  )
}

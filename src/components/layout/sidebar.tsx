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
  Receipt
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
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
    name: 'Bahan Baku',
    href: '/ingredients',
    icon: Package,
  },
  {
    name: 'Stok & Inventory',
    href: '/inventory',
    icon: Warehouse,
  },
  {
    name: 'Pesanan',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Pelanggan',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Produksi',
    href: '/production',
    icon: TrendingUp,
  },
  {
    name: 'Keuangan',
    href: '/finance',
    icon: CreditCard,
  },
  {
    name: 'Biaya Operasional',
    href: '/expenses',
    icon: Receipt,
  },
  {
    name: 'Laporan',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link href={item.href} onClick={closeMobile}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start px-3 transition-all duration-200",
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
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full transition-all duration-200",
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

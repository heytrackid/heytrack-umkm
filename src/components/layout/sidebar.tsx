'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  X
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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={cn(
      "flex h-full flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
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

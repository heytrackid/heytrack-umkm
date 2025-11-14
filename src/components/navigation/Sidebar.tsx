'use client'

import { cn } from '@/lib/utils'
import {
  BarChart3,
  Calculator,
  ChefHat,
  Factory,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bahan Baku', href: '/ingredients', icon: Package },
  { name: 'Resep', href: '/recipes', icon: ChefHat },
  { name: 'Pesanan', href: '/orders', icon: ShoppingCart },
  { name: 'Produksi', href: '/production', icon: Factory },
  { name: 'HPP Calculator', href: '/hpp', icon: Calculator },
  { name: 'Pelanggan', href: '/customers', icon: Users },
  { name: 'Laporan', href: '/reports', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
]

export function Sidebar(): JSX.Element {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card min-h-screen">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

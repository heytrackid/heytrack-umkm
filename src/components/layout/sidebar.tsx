'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
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

export default function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Package className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">HeyTrack UMKM</span>
            <span className="text-xs text-muted-foreground">Bakery Management</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-2">
          <div className="text-xs text-muted-foreground text-center">
            © 2024 HeyTrack UMKM
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

'use client'

import {
    BarChart3,
    ChefHat,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    Wallet
} from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import Link from 'next/link'

// HeyTrack navigation data
const data = {
  user: {
    name: 'User',
    email: 'user@heytrack.com',
    avatar: '/avatars/user.jpg',
  },
  navMain: [
    {
      title: 'Manajemen',
      url: '#',
      icon: Package,
      isActive: true,
      items: [
        {
          title: 'Bahan Baku',
          url: '/ingredients',
        },
        {
          title: 'Resep',
          url: '/recipes',
        },
        {
          title: 'Pelanggan',
          url: '/customers',
        },
      ],
    },
    {
      title: 'Operasional',
      url: '#',
      icon: ShoppingCart,
      items: [
        {
          title: 'Pesanan',
          url: '/orders',
        },
        {
          title: 'Produksi',
          url: '/production',
        },
      ],
    },
    {
      title: 'Keuangan',
      url: '#',
      icon: Wallet,
      items: [
        {
          title: 'Arus Kas',
          url: '/cash-flow',
        },
        {
          title: 'Kalkulator HPP',
          url: '/hpp',
        },
      ],
    },
    {
      title: 'Analitik',
      url: '#',
      icon: BarChart3,
      items: [
        {
          title: 'Laporan',
          url: '/reports',
        },
        {
          title: 'Analytics',
          url: '/analytics',
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>): JSX.Element {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ChefHat className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">HeyTrack</span>
                  <span className="truncate text-xs">UMKM Kuliner</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard">
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavMain items={data.navMain} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Pengaturan">
              <Link href="/settings">
                <Settings />
                <span>Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

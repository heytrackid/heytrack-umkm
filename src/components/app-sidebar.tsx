'use client'

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible'
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@/components/ui/sidebar'
import {
    BarChart3,
    Bot,
    Calculator,
    ChevronRight,
    DollarSign,
    Factory,
    FileText,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingCart,
    TrendingUp,
    Truck,
    Users,
    Utensils
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExportButton } from './layout/ExportButton'
import { LogoutButton } from './layout/LogoutButton'

const menuItems = [
  {
    title: 'Utama',
    items: [
      {
        title: 'Beranda',
        url: '/dashboard',
        icon: LayoutDashboard
      }
    ]
  },
  {
    title: 'Inventori',
    items: [
      {
        title: 'Bahan Baku',
        url: '/ingredients',
        icon: Package
      },
      {
        title: 'Resep',
        url: '/recipes',
        icon: Utensils,
        items: [
          {
            title: 'Semua Resep',
            url: '/recipes'
          },
          {
            title: 'Generator AI',
            url: '/recipes/ai-generator',
            icon: Bot
          }
        ]
      },
      {
        title: 'Pemasok',
        url: '/suppliers',
        icon: Truck
      }
    ]
  },
  {
    title: 'Operasional',
    items: [
      {
        title: 'Produksi',
        url: '/production',
        icon: Factory
      },
      {
        title: 'HPP',
        url: '/hpp',
        icon: Calculator
      },
      {
        title: 'Pesanan',
        url: '/orders',
        icon: ShoppingCart,
        items: [
          {
            title: 'Semua Pesanan',
            url: '/orders'
          },
          {
            title: 'Pesanan Baru',
            url: '/orders/new'
          }
        ]
      },
      {
        title: 'Pelanggan',
        url: '/customers',
        icon: Users
      }
    ]
  },
  {
    title: 'Analitik',
    items: [
      {
        title: 'Laporan',
        url: '/reports',
        icon: FileText,
        items: [
          {
            title: 'Profit',
            url: '/profit',
            icon: TrendingUp
          },
          {
            title: 'Arus Kas',
            url: '/cash-flow',
            icon: DollarSign
          }
        ]
      },
      {
        title: 'Analitik',
        url: '/analytics',
        icon: BarChart3
      }
    ]
  },
  {
    title: 'Sistem',
    items: [
      {
        title: 'Pengaturan',
        url: '/settings',
        icon: Settings
      }
    ]
  }
]

export const AppSidebar = () => {
  const pathname = usePathname()

  const isActive = (url: string) => pathname === url || (url !== '/' && pathname.startsWith(url))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">HT</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">HeyTrack</span>
                  <span className="text-xs text-muted-foreground">UMKM Manager</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {menuItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const hasSubItems = item.items && item.items.length > 0

                  if (hasSubItems) {
                    return (
                      <Collapsible
                        key={item.title}
                        asChild
                        defaultOpen={isActive(item.url)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={item.title}
                              isActive={isActive(item.url)}
                            >
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.items?.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive(subItem.url)}
                                  >
                                    <Link href={subItem.url}>
                                      {subItem.icon && <subItem.icon className="h-4 w-4" />}
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive(item.url)}
                      >
                        <Link href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ExportButton collapsed={false} />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <LogoutButton collapsed={false} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

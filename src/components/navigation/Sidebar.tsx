'use client'

import {
    Bot,
    ChefHat,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Factory,
    FileText,
    Home,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Truck,
    Users,
    Wallet
} from '@/components/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const navigationGroups = [
  {
    label: 'Utama',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Pesanan', url: '/orders', icon: ShoppingCart },
      { title: 'Pelanggan', url: '/customers', icon: Users }
    ]
  },
  {
    label: 'Super Agent',
    items: [
      { title: 'Super Agent', url: '/super-agent', icon: Sparkles },
      { title: 'AI Chatbot', url: '/ai-chatbot', icon: Bot },
      { title: 'AI Recipe Generator', url: '/recipes/ai-generator', icon: ChefHat }
    ]
  },
  {
    label: 'Hitung HPP',
    items: [
      { title: 'Bahan Baku', url: '/ingredients', icon: Package },
      { title: 'Biaya Operasional', url: '/operational-costs', icon: Receipt },
      { title: 'Resep Produk', url: '/recipes', icon: ChefHat },
      { title: 'Kalkulator HPP', url: '/hpp/calculator', icon: TrendingUp }
    ]
  },
  {
    label: 'Produksi',
    items: [
      { title: 'Produksi', url: '/production', icon: Factory }
    ]
  },
  {
    label: 'Pengadaan',
    items: [
      { title: 'Supplier', url: '/suppliers', icon: Truck }
    ]
  },
  {
    label: 'Keuangan',
    items: [
      { title: 'Arus Kas', url: '/cash-flow', icon: Wallet },
      { title: 'Laba', url: '/profit', icon: TrendingUp }
    ]
  },
  {
    label: 'Laporan',
    items: [
      { title: 'Laporan', url: '/reports', icon: FileText }
    ]
  }
]

const settingsItems = [
  { title: 'Pengaturan', url: '/settings', icon: Settings }
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Utama': true,
    'Super Agent': true,
    'Hitung HPP': true,
    'Produksi': true,
    'Pengadaan': true,
    'Keuangan': true,
    'Laporan': true,
  })

  const checkIsActive = (url: string) => {
    if (url === '/dashboard') return pathname === url
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const hasActiveItem = (items: { url: string }[]) => {
    return items.some(item => checkIsActive(item.url))
  }

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r bg-background transition-all duration-300 flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full w-full flex-col">
          {/* Header with Logo and Collapse Toggle */}
          <div className="flex h-14 items-center justify-between px-4 border-b">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">HeyTrack</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", collapsed && "mx-auto")}
              onClick={() => onCollapsedChange?.(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="space-y-2">
              {navigationGroups.map((group) => {
                const groupHasActiveItem = hasActiveItem(group.items)
                const isOpen = openGroups[group.label] ?? true

                if (collapsed) {
                  // Collapsed mode - show only icons with tooltips
                  return (
                    <div key={group.label} className="space-y-1">
                      {group.items.map((item) => {
                        const isActive = checkIsActive(item.url)
                        return (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.url}
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors",
                                  isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  )
                }

                // Expanded mode - show full navigation with collapsible groups
                return (
                  <Collapsible
                    key={group.label}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(group.label)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-between px-3 py-2 text-sm font-medium",
                          groupHasActiveItem && "text-primary"
                        )}
                      >
                        <span>{group.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pt-1">
                      {group.items.map((item) => {
                        const isActive = checkIsActive(item.url)
                        return (
                          <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className={cn(
                              "h-4 w-4",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span>{item.title}</span>
                          </Link>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}

              {/* Settings */}
              <div className="pt-4 border-t mt-4">
                {settingsItems.map((item) => {
                  const isActive = checkIsActive(item.url)
                  
                  if (collapsed) {
                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.url}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg mx-auto transition-colors",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </TooltipProvider>
  )
}

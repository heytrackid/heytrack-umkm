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
import { m, type MotionProps, type Variants } from 'framer-motion'
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

  const navItemMotionProps: MotionProps = {
    whileHover: { scale: 1.02, x: 2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.12, ease: 'easeOut' }
  }

  const groupContentVariants: Variants = {
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] }
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <m.aside
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-background/95 to-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/50 shadow-xl transition-all duration-300 ease-in-out flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full w-full flex-col min-h-0">
          {/* Header with Logo and Collapse Toggle */}
          <div className="flex h-14 items-center justify-between px-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            {!collapsed && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-base font-semibold text-foreground">HeyTrack</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 rounded-md hover:bg-accent transition-colors duration-150",
                collapsed && "mx-auto"
              )}
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
          <ScrollArea className="flex-1 min-h-0 h-full px-3 [&>div>div]:scrollbar-thin [&>div>div]:scrollbar-thumb-border [&>div>div]:scrollbar-track-transparent [&>div>div]:scroll-smooth">
            <nav className="space-y-6 py-6 pb-20">
              {navigationGroups.map((group) => {
                const groupHasActiveItem = hasActiveItem(group.items)
                const isOpen = openGroups[group.label] ?? true

                if (collapsed) {
                  // Collapsed mode - show only icons with tooltips
                  return (
                    <div key={group.label} className="space-y-2">
                      {group.items.map((item) => {
                        const isActive = checkIsActive(item.url)
                        return (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <m.div {...navItemMotionProps}>
                                <Link
                                  href={item.url}
                                  className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-xl mx-auto transition-all duration-200 group",
                                    isActive
                                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                      : "text-muted-foreground hover:bg-accent/80 hover:text-foreground hover:shadow-sm hover:scale-105"
                                  )}
                                >
                                  <item.icon className="h-5 w-5" />
                                </Link>
                              </m.div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-medium">
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
                          "w-full justify-between px-3 py-2.5 text-sm font-semibold rounded-lg hover:bg-accent/50 transition-all duration-200",
                          groupHasActiveItem && "text-primary bg-primary/5 hover:bg-primary/10"
                        )}
                      >
                        <span className="tracking-wide">{group.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isOpen && "rotate-180"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden">
                      <m.div
                        className="space-y-1 pt-2"
                        variants={groupContentVariants}
                        initial={isOpen ? 'open' : 'closed'}
                        animate={isOpen ? 'open' : 'closed'}
                      >
                        {group.items.map((item) => {
                          const isActive = checkIsActive(item.url)
                          return (
                            <m.div key={item.title} {...navItemMotionProps}>
                              <Link
                                href={item.url}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground hover:translate-x-1 hover:shadow-sm"
                                )}
                              >
                                <div className={cn(
                                  "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
                                  isActive 
                                    ? "bg-primary-foreground/20 text-primary-foreground" 
                                    : "bg-muted/50 group-hover:bg-accent/60"
                                )}>
                                  <item.icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{item.title}</span>
                                {isActive && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                                )}
                              </Link>
                            </m.div>
                          )
                        })}
                      </m.div>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Settings - Pinned to bottom */}
          <div className="p-3 border-t border-border/50 bg-background/80 backdrop-blur-sm mt-auto">
            {settingsItems.map((item) => {
              const isActive = checkIsActive(item.url)
              
              if (collapsed) {
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <m.div {...navItemMotionProps}>
                        <Link
                          href={item.url}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl mx-auto transition-all duration-200 group",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground hover:shadow-sm hover:scale-105"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </Link>
                      </m.div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <m.div key={item.title} {...navItemMotionProps}>
                  <Link
                    href={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        : "text-muted-foreground hover:bg-accent/80 hover:text-foreground hover:translate-x-1 hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground" 
                        : "bg-muted/50 group-hover:bg-accent/60"
                    )}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{item.title}</span>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                    )}
                  </Link>
                </m.div>
              )
            })}
          </div>
        </div>
      </m.aside>
    </TooltipProvider>
  )
}

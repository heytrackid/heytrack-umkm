'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useCallback, useEffect } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ChefHat,
  Users,
  Factory,
  Calculator,
  Bot,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  DollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Receipt
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ExportButton } from './ExportButton'
import { LogoutButton } from './LogoutButton'

interface SidebarItem {
  label: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

interface SidebarSection {
  title: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  items: SidebarItem[]
  defaultOpen?: boolean
  collapsible?: boolean
}

const NAV_SECTIONS: SidebarSection[] = [
  // 1. Dashboard - Always first
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    defaultOpen: true,
    collapsible: false,
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
  },

  // 2. Operasional Harian - Core daily operations
  {
    title: 'Operasional',
    icon: ShoppingCart,
    defaultOpen: true,
    collapsible: true,
    items: [
      { label: 'Pesanan', href: '/orders', icon: ShoppingCart },
      { label: 'Pelanggan', href: '/customers', icon: Users },
      { label: 'Produksi', href: '/production', icon: Factory }
    ]
  },

  // 3. Inventory & Recipes - Product management
  {
    title: 'Produk & Stok',
    icon: Package,
    defaultOpen: true,
    collapsible: true,
    items: [
      { label: 'Resep', href: '/recipes', icon: ChefHat },
      { label: 'Bahan', href: '/ingredients', icon: Package }
    ]
  },

  // 4. Keuangan - Financial management
  {
    title: 'Keuangan',
    icon: DollarSign,
    defaultOpen: true,
    collapsible: true,
    items: [
      { label: 'Cash Flow', href: '/cash-flow', icon: TrendingUp },
      { label: 'HPP & Profit', href: '/hpp', icon: Calculator },
      { label: 'Biaya Operasional', href: '/operational-costs', icon: Receipt }
    ]
  },

  // 5. Laporan - Reports
  {
    title: 'Laporan',
    icon: FileText,
    defaultOpen: false,
    collapsible: false,
    items: [
      { label: 'Laporan', href: '/reports', icon: FileText }
    ]
  },

  // 6. AI Assistant - Advanced features
  {
    title: 'AI Tools',
    icon: Bot,
    defaultOpen: false,
    collapsible: true,
    items: [
      { label: 'AI Chatbot', href: '/ai-chatbot', icon: Bot }
    ]
  },

  // 7. Pengaturan - Always last
  {
    title: 'Pengaturan',
    icon: Settings,
    defaultOpen: false,
    collapsible: false,
    items: [{ label: 'Pengaturan', href: '/settings', icon: Settings }]
  }
]

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
  isCollapsed?: boolean
  onCollapse?: () => void
}

const Sidebar = ({
  onToggle,
  isMobile = false,
  isCollapsed = false,
  onCollapse
}: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const sections = useMemo(() => NAV_SECTIONS, [])

  // Initialize expanded sections - use function to ensure consistent initial state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() =>
    new Set(sections.filter(s => s.defaultOpen).map(s => s.title))
  )

  // Track if component is mounted to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prefetch route on hover for faster navigation
  const handlePrefetch = useCallback((href: string) => {
    router.prefetch(href)
  }, [router])

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedSections(newExpanded)
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const content = (
    <nav className="flex h-full flex-col bg-card">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <div className="transition-opacity duration-200">
              <h2 className="text-lg font-bold text-foreground">HeyTrack</h2>
              <p className="text-xs text-muted-foreground">UMKM Management</p>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
          )}
          {isMobile && onToggle && isMounted && (
            <button
              onClick={onToggle}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <div className="space-y-1">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.title)
            const SectionIcon = section.icon
            const hasActiveItem = section.items.some(item => isActive(item.href))

            return (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                {section.collapsible ? (
                  isCollapsed ? (
                    // Collapsed mode - Don't show section header, only show submenu icons below
                    null
                  ) : (
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                        'hover:bg-muted',
                        hasActiveItem && 'text-primary'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <SectionIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{section.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  )
                ) : (
                  isCollapsed ? (
                    // Non-collapsible section in collapsed mode - Don't show header, only submenu icons
                    null
                  ) : (
                    // Non-collapsible section in expanded mode - show text
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </div>
                  )
                )}

                {/* Section Items - Expanded Mode */}
                {(isExpanded || !section.collapsible) && !isCollapsed && (
                  <div className={cn(
                    'space-y-0.5 transition-all duration-200',
                    section.collapsible && 'ml-2 pl-4 border-l-2 border-muted'
                  )}>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      const active = isActive(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => isMobile && onToggle?.()}
                          onMouseEnter={() => handlePrefetch(item.href)}
                          onFocus={() => handlePrefetch(item.href)}
                          prefetch
                          className={cn(
                            'relative flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200',
                            'hover:bg-muted hover:text-foreground',
                            active
                              ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                              : 'text-muted-foreground'
                          )}
                        >
                          <ItemIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {/* Active indicator */}
                          {active && (
                            <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Collapsed Mode - Show only submenu icons with tooltip */}
                {isCollapsed && (
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      const active = isActive(item.href)

                      return (
                        <TooltipProvider key={item.href} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.href}
                                onClick={() => isMobile && onToggle?.()}
                                onMouseEnter={() => handlePrefetch(item.href)}
                                onFocus={() => handlePrefetch(item.href)}
                                prefetch
                                className={cn(
                                  'relative flex items-center justify-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200',
                                  'hover:bg-muted hover:text-foreground',
                                  active
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground'
                                )}
                              >
                                <ItemIcon className="h-5 w-5 flex-shrink-0" />
                                {/* Active indicator dot */}
                                {active && (
                                  <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                                )}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              className="font-medium bg-popover text-popover-foreground border shadow-lg z-50"
                              sideOffset={12}
                              avoidCollisions={true}
                            >
                              <div className="flex items-center gap-2">
                                <span>{item.label}</span>
                                {active && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-2">
        {/* Export & Logout - Show on mobile and desktop (when not collapsed) */}
        {!isCollapsed && isMounted && (
          <>
            <ExportButton />
            <LogoutButton />
          </>
        )}

        {/* Collapse/Expand button - Desktop only */}
        {!isMobile && onCollapse && isMounted && (
          isCollapsed ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onCollapse}
                    className={cn(
                      "w-full flex items-center justify-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                      "hover:bg-muted hover:text-foreground text-muted-foreground"
                    )}
                  >
                    <PanelLeftOpen className="h-5 w-5 flex-shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="font-medium bg-popover text-popover-foreground border shadow-lg z-50"
                  sideOffset={12}
                  avoidCollisions={true}
                >
                  Perluas sidebar
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <button
              onClick={onCollapse}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200",
                "hover:bg-muted hover:text-foreground text-muted-foreground"
              )}
            >
              <PanelLeftClose className="h-4 w-4 flex-shrink-0" />
              <span>Ciutkan</span>
            </button>
          )
        )}

        {/* Footer text - Show when not collapsed */}
        {!isCollapsed && isMounted && (
          <div className="text-xs text-muted-foreground text-center transition-opacity duration-200">
            <p>© 2025 HeyTrack</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        )}
      </div>
    </nav>
  )

  if (isMobile) {
    return (
      <div className="h-full w-full bg-background">
        {content}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 border-r border-border bg-card shadow-sm',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {content}
    </aside>
  )
}

export default Sidebar

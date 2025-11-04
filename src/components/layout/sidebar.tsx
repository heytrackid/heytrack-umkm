'use client'

import { useSidebar } from '@/hooks/useSidebar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState, type ComponentType, type SVGProps } from 'react'

import {
    Bot,
    ChevronDown,
    ChevronRight,
    LayoutDashboard,
    Package,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    X,
    ClipboardList,
    TrendingUp,
    BarChart3
} from 'lucide-react'
import { ExportButton } from './ExportButton'
import { LogoutButton } from './LogoutButton'


interface SidebarItem {
  label: string
  href: string
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
     items: [{ label: 'Dashboard', href: '/dashboard' }]
   },

   // 2. AI Assistant - Quick access
   {
     title: 'AI Tools',
     icon: Bot,
     defaultOpen: false,
     collapsible: false,
     items: [
       { label: 'AI Chatbot', href: '/ai-chatbot' }
     ]
   },

   // 3. Operasional Harian - Core daily operations
   {
     title: 'Operasional',
     icon: ClipboardList,
     defaultOpen: true,
     collapsible: true,
     items: [
       { label: 'Pesanan', href: '/orders' },
       { label: 'Pelanggan', href: '/customers' },
       { label: 'Produksi', href: '/production' }
     ]
   },

   // 4. Inventory & Recipes - Product management
   {
     title: 'Produk & Stok',
     icon: Package,
     defaultOpen: true,
     collapsible: true,
     items: [
       { label: 'Resep', href: '/recipes' },
       { label: 'Bahan', href: '/ingredients' }
     ]
   },

   // 5. Keuangan - Financial management
   {
     title: 'Keuangan',
     icon: TrendingUp,
     defaultOpen: true,
     collapsible: true,
     items: [
       { label: 'Cash Flow', href: '/cash-flow' },
       { label: 'HPP', href: '/hpp' },
       { label: 'Profit Analysis', href: '/profit' },
       { label: 'Biaya Operasional', href: '/operational-costs' }
     ]
   },

   // 6. Laporan - Reports
   {
     title: 'Laporan',
     icon: BarChart3,
     defaultOpen: false,
     collapsible: false,
     items: [
       { label: 'Laporan', href: '/reports' }
     ]
   },

   // 7. Pengaturan - Always last
   {
     title: 'Pengaturan',
     icon: Settings,
     defaultOpen: false,
     collapsible: false,
     items: [{ label: 'Pengaturan', href: '/settings' }]
   }
]

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

const Sidebar = ({
  onToggle,
  isMobile = false
}: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const sections = useMemo(() => NAV_SECTIONS, [])
  const { isCollapsed, toggle: toggleCollapse, setHovered } = useSidebar()

  // Initialize expanded sections - use function to ensure consistent initial state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() =>
    new Set(sections.filter(s => s.defaultOpen).map(s => s.title))
  )

  // Track if component is mounted to prevent hydration issues
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-expand sections when hovering collapsed sidebar
  useEffect(() => {
    if (isCollapsed && !isMobile) {
      // When collapsed, keep sections expanded for easier access
      setExpandedSections(new Set(sections.filter(s => s.defaultOpen).map(s => s.title)))
    } else if (!isCollapsed) {
      // When expanded, restore default state
      setExpandedSections(new Set(sections.filter(s => s.defaultOpen).map(s => s.title)))
    }
  }, [isCollapsed, isMobile, sections])

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

  // Determine if sidebar should show expanded view
  const showExpanded = !isCollapsed || isMobile

  const content = (
    <nav
      className="flex h-full flex-col bg-card/95 backdrop-blur-sm border-r border-border/50 shadow-xl"
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
    >
       {/* Header */}
       <div className="border-b border-border/50 px-4 py-5 bg-gradient-to-r from-background to-muted/20">
         <div className="flex items-center justify-between">
           <div className={cn(
             "transition-all duration-300",
             !showExpanded && "opacity-0 w-0 overflow-hidden"
           )}>
             <h2 className="text-xl font-bold text-foreground whitespace-nowrap bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
               HeyTrack
             </h2>
             <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">UMKM Management</p>
           </div>

           {/* Toggle buttons */}
           {isMobile && onToggle && isMounted && (
             <button
               onClick={onToggle}
               className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
               aria-label="Tutup menu"
             >
               <X className="h-5 w-5" />
             </button>
           )}

           {!isMobile && isMounted && (
             <button
               onClick={toggleCollapse}
               className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-sm"
               aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
               title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
             >
               {isCollapsed ? (
                 <PanelLeftOpen className="h-5 w-5" />
               ) : (
                 <PanelLeftClose className="h-5 w-5" />
               )}
             </button>
           )}
         </div>
       </div>

       {/* Navigation */}
       <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
         <div className="space-y-2">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.title)
            const SectionIcon = section.icon
            const hasActiveItem = section.items.some(item => isActive(item.href))

            return (
              <div key={section.title} className="space-y-1">
                 {/* Section Header */}
                 {section.collapsible ? (
                   <button
                     onClick={() => toggleSection(section.title)}
                     className={cn(
                       'w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                       'hover:bg-accent hover:text-accent-foreground hover:shadow-sm',
                       hasActiveItem && 'text-primary bg-primary/5',
                       !showExpanded && 'justify-center px-2 py-2'
                     )}
                     title={!showExpanded ? section.title : undefined}
                   >
                     <div className={cn(
                       "flex items-center gap-3",
                       !showExpanded && "justify-center gap-0"
                     )}>
                       <SectionIcon className={cn(
                         "flex-shrink-0 transition-colors",
                         hasActiveItem ? "text-primary" : "text-muted-foreground",
                         !showExpanded ? "h-6 w-6" : "h-5 w-5"
                       )} />
                       {showExpanded && <span className="whitespace-nowrap font-medium">{section.title}</span>}
                     </div>
                     {showExpanded && (
                       <div className="flex items-center">
                         {isExpanded ? (
                           <ChevronDown className="h-4 w-4 transition-transform duration-200 text-muted-foreground" />
                         ) : (
                           <ChevronRight className="h-4 w-4 transition-transform duration-200 text-muted-foreground" />
                         )}
                       </div>
                     )}
                   </button>
                 ) : (
                   <div className={cn(
                     "flex items-center px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-all duration-200",
                     !showExpanded && "justify-center px-2"
                   )}>
                     <SectionIcon className={cn(
                       "flex-shrink-0",
                       !showExpanded ? "h-6 w-6" : "h-4 w-4 mr-3"
                     )} />
                     {showExpanded && <span>{section.title}</span>}
                   </div>
                 )}

                {/* Section Items */}
                {(isExpanded || !section.collapsible) && (
                  <div className={cn(
                    'space-y-0.5 transition-all duration-200',
                    section.collapsible && showExpanded && 'ml-2 pl-4 border-l-2 border-muted'
                   )}>
                     {section.items.map((item) => {
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
                              'group relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200',
                              'hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:translate-x-1',
                              active
                                ? 'bg-primary text-primary-foreground font-medium shadow-sm translate-x-1'
                                : 'text-muted-foreground hover:text-foreground',
                              !showExpanded && 'justify-center px-2 py-2 gap-0'
                            )}
                            title={!showExpanded ? item.label : undefined}
                          >
                            {/* Active indicator - left border */}
                            {active && showExpanded && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                            )}

                            {/* Icon for collapsed mode */}
                            {!showExpanded && (
                              <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                                active ? "bg-primary-foreground/20" : "group-hover:bg-accent"
                              )}>
                                <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                              </div>
                            )}

                            {showExpanded && <span className="flex-1 whitespace-nowrap">{item.label}</span>}

                            {/* Active indicator - right dot */}
                            {active && showExpanded && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground/80 animate-pulse" />
                            )}
                          </Link>
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
       <div className="border-t border-border/50 p-4 space-y-3 bg-muted/10">
         {/* Export & Logout */}
         {isMounted && (
           <div className={cn(
             "space-y-2 transition-all duration-300",
             !showExpanded && "flex flex-col items-center space-y-1"
           )}>
             <ExportButton collapsed={!showExpanded} />
             <LogoutButton collapsed={!showExpanded} />
           </div>
         )}

         {/* Footer text */}
         {isMounted && showExpanded && (
           <div className="text-xs text-muted-foreground text-center transition-all duration-300 opacity-100 pt-2 border-t border-border/30">
             <p className="font-medium">© 2025 HeyTrack</p>
             <p className="mt-1 text-[10px]">v1.0.0</p>
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
        'fixed inset-y-0 left-0 z-50 bg-card/95 backdrop-blur-sm border-r border-border/50 shadow-xl',
        'transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {content}
    </aside>
  )
}

export default Sidebar
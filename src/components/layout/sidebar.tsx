'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState, useCallback, useEffect, type ComponentType, type SVGProps } from 'react'
import { cn } from '@/lib/utils'

import { ExportButton } from './ExportButton'
import { LogoutButton } from './LogoutButton'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Bot,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText
} from 'lucide-react'


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
     icon: ShoppingCart,
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
     icon: DollarSign,
     defaultOpen: true,
     collapsible: true,
     items: [
       { label: 'Cash Flow', href: '/cash-flow' },
       { label: 'HPP & Profit', href: '/hpp' },
       { label: 'Biaya Operasional', href: '/operational-costs' }
     ]
   },

   // 6. Laporan - Reports
   {
     title: 'Laporan',
     icon: FileText,
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
          <div className="transition-opacity duration-200">
            <h2 className="text-lg font-bold text-foreground">HeyTrack</h2>
            <p className="text-xs text-muted-foreground">UMKM Management</p>
          </div>
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
                ) : (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </div>
                )}

                {/* Section Items */}
                {(isExpanded || !section.collapsible) && (
                  <div className={cn(
                    'space-y-0.5 transition-all duration-200',
                    section.collapsible && 'ml-2 pl-4 border-l-2 border-muted'
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
                             'relative flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200',
                             'hover:bg-muted hover:text-foreground',
                             active
                               ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                               : 'text-muted-foreground'
                           )}
                         >
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


              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-2">
        {/* Export & Logout */}
        {isMounted && (
          <>
            <ExportButton />
            <LogoutButton />
          </>
        )}

        {/* Footer text */}
        {isMounted && (
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
        'transition-all duration-300 ease-in-out w-72'
      )}
    >
      {content}
    </aside>
  )
}

export default Sidebar
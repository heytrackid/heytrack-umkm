'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
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
    Utensils,
    X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { ExportButton } from './ExportButton'
import { LogoutButton } from './LogoutButton'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SidebarItem[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Beranda',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Bahan Baku',
    href: '/ingredients',
    icon: Package
  },
  {
    title: 'Pemasok',
    href: '/suppliers',
    icon: Truck
  },
  {
    title: 'Resep',
    href: '/recipes',
    icon: Utensils,
    subItems: [
      { title: 'Semua Resep', href: '/recipes', icon: Utensils },
      { title: 'Generator AI', href: '/recipes/ai-generator', icon: Bot }
    ]
  },
  {
    title: 'Produksi',
    href: '/production',
    icon: Factory
  },
  {
    title: 'HPP',
    href: '/hpp',
    icon: Calculator
  },
  {
    title: 'Pesanan',
    href: '/orders',
    icon: ShoppingCart,
    subItems: [
      { title: 'Semua Pesanan', href: '/orders', icon: ShoppingCart },
      { title: 'Pesanan Baru', href: '/orders/new', icon: ShoppingCart }
    ]
  },
  {
    title: 'Pelanggan',
    href: '/customers',
    icon: Users
  },
  {
    title: 'Laporan',
    href: '/reports',
    icon: FileText,
    subItems: [
      { title: 'Profit', href: '/profit', icon: TrendingUp },
      { title: 'Arus Kas', href: '/cash-flow', icon: DollarSign }
    ]
  },
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings
  }
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
  isMobile?: boolean
  onClose?: () => void
}

export const Sidebar = ({ 
  isCollapsed = false, 
  onToggleCollapse, 
  className,
  isMobile = false,
  onClose
}: SidebarProps) => {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = useCallback((title: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }, [])

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose()
    }
  }

  const renderSidebarItem = (item: SidebarItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isExpanded = expandedItems.has(item.title)
    const isItemActive = isActive(item.href)

    return (
      <div key={item.href} className="w-full">
        {hasSubItems ? (
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "group flex items-center w-full px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-400 ease-out relative overflow-hidden border-2 border-transparent",
              "hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:via-indigo-900/30 dark:hover:to-purple-900/30",
              "hover:shadow-xl hover:shadow-blue-500/15 dark:hover:shadow-blue-500/25 hover:border-blue-300 dark:hover:border-blue-600 hover:border-opacity-70",
              "hover:scale-[1.08] active:scale-[0.92]",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-800",
              "after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-400/0 after:via-blue-400/5 after:to-purple-400/0 hover:after:from-blue-400/10 hover:after:via-blue-400/20 hover:after:to-purple-400/10 after:transition-all after:duration-400",
              isCollapsed && "justify-center px-3 py-3",
              isItemActive && "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20 border-blue-300 dark:border-blue-600 border-opacity-50"
            )}
            title={isCollapsed ? item.title : undefined}
          >
            <item.icon className={cn(
              "h-5 w-5 flex-shrink-0 transition-all duration-400 ease-out relative z-10",
              "group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-125 group-hover:drop-shadow-lg group-hover:rotate-6",
              !isCollapsed && "mr-4",
              isItemActive && "text-blue-600 dark:text-blue-400"
            )} />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left transition-all duration-400 ease-out relative z-10 group-hover:font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:drop-shadow-md">
                  {item.title}
                </span>
                <ChevronRight className={cn(
                  "h-4 w-4 transition-all duration-500 ease-out relative z-10 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  isExpanded && "rotate-90"
                )} />
              </>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              "group flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-400 ease-out relative overflow-hidden border-2 border-transparent",
              "hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:via-indigo-900/30 dark:hover:to-purple-900/30",
              "hover:shadow-xl hover:shadow-blue-500/15 dark:hover:shadow-blue-500/25 hover:border-blue-300 dark:hover:border-blue-600 hover:border-opacity-70",
              "hover:scale-[1.08] active:scale-[0.95]",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-800",
              "after:absolute after:inset-0 after:bg-gradient-to-r after:from-blue-400/0 after:via-blue-400/5 after:to-purple-400/0 hover:after:from-blue-400/10 hover:after:via-blue-400/20 hover:after:to-purple-400/10 after:transition-all after:duration-400",
              isCollapsed && "justify-center px-3 py-3",
              isItemActive && "bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/20 border-blue-300 dark:border-blue-600 border-opacity-50"
            )}
            title={isCollapsed ? item.title : undefined}
          >
            <item.icon className={cn(
              "h-5 w-5 flex-shrink-0 transition-all duration-400 ease-out relative z-10",
              "group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-125 group-hover:drop-shadow-lg group-hover:rotate-6",
              !isCollapsed && "mr-4",
              isItemActive && "text-blue-600 dark:text-blue-400"
            )} />
            {!isCollapsed && (
              <span className="transition-all duration-400 ease-out relative z-10 group-hover:font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:drop-shadow-md">
                {item.title}
              </span>
            )}
          </Link>
        )}

        {hasSubItems && isExpanded && !isCollapsed && item.subItems && (
          <div className="ml-6 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300 ease-in-out">
            {item.subItems.map(subItem => (
              <Link
                key={subItem.href}
                href={subItem.href}
                onClick={handleLinkClick}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-400 ease-out ml-6 relative overflow-hidden border-2 border-transparent",
                  "hover:bg-gradient-to-r hover:from-slate-50 hover:via-slate-100 hover:to-slate-50 dark:hover:from-slate-700/40 dark:hover:via-slate-600/40 dark:hover:to-slate-700/40",
                  "hover:shadow-lg hover:shadow-slate-500/10 dark:hover:shadow-slate-500/20 hover:border-slate-300 dark:hover:border-slate-500 hover:border-opacity-60",
                  "hover:scale-[1.05] active:scale-[0.95]",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-600",
                  isActive(subItem.href) && "bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-600/60 dark:to-slate-700/60 text-slate-800 dark:text-slate-200 font-bold shadow-md shadow-slate-500/15 border-slate-300 dark:border-slate-500 border-opacity-40"
                )}
              >
                <subItem.icon className="h-4 w-4 mr-4 flex-shrink-0 opacity-70 group-hover:opacity-100 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:scale-110 transition-all duration-400 ease-out relative z-10" />
                <span className="transition-all duration-400 ease-out group-hover:font-semibold group-hover:text-slate-800 dark:group-hover:text-slate-200 relative z-10">
                  {subItem.title}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-100/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 border-r border-slate-200/60 dark:border-slate-700/60 h-full shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/40 backdrop-blur-xl",
        !isMobile && "transition-all duration-500 ease-out",
        isCollapsed ? "w-16" : "w-72",
        className
      )}
      suppressHydrationWarning
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200/40 dark:border-slate-700/40 h-18 flex-shrink-0 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 dark:from-slate-800/80 dark:via-slate-700/60 dark:to-slate-800/80">
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-4 group transition-all duration-400 ease-out"
            onClick={handleLinkClick}
          >
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-400 ease-out group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out" />
              <span className="text-white font-black text-base relative z-10 transition-all duration-400 ease-out group-hover:scale-110 group-hover:text-yellow-200">HT</span>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent transition-all duration-400 ease-out group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-600">
                HeyTrack
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold transition-all duration-400 ease-out group-hover:text-blue-500/80">UMKM Manager</p>
            </div>
          </Link>
        )}

        {isMobile && onClose ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ease-in-out rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn(
                "h-8 w-8 p-0 hover:bg-accent/50 transition-all duration-200 ease-in-out rounded-lg",
                !isCollapsed && "ml-auto"
              )}
            >
              <span className="text-sm font-medium transition-transform duration-200 ease-in-out">
                {isCollapsed ? '→' : '←'}
              </span>
            </Button>
          )
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-1">
        <nav className="p-4 space-y-3">
          {sidebarItems.map(item => renderSidebarItem(item))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-5 border-t border-slate-200/40 dark:border-slate-700/40 space-y-4 flex-shrink-0 bg-gradient-to-t from-slate-100/60 via-slate-50/40 to-transparent dark:from-slate-800/60 dark:via-slate-700/40 dark:to-transparent">
        <ExportButton collapsed={isCollapsed} />
        <LogoutButton collapsed={isCollapsed} />
      </div>
    </aside>
  )
}

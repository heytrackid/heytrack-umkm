'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  Users, 
  Calculator,
  Receipt,
  BarChart3,
  Menu,
  X,
  ClipboardCheck,
  TrendingUp,
  Settings,
  FileText,
  Target,
  CheckCircle,
  Tags,
  DollarSign
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
  isSimple?: boolean
  badge?: string
  stepNumber?: number
  description?: string
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
  description?: string
  isWorkflow?: boolean
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Dashboard',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        description: 'Overview & analytics'
      }
    ]
  },
  {
    title: '🚀 STEP 1: DATA MASTER',
    description: 'Setup data dasar untuk HPP',
    isWorkflow: true,
    items: [
      {
        name: 'Bahan Baku',
        href: '/inventory',
        icon: Package,
        isSimple: true,
        badge: 'MULAI',
        description: 'Input harga & stok bahan'
      },
      {
        name: 'Biaya Operasional',
        href: '/operational-costs',
        icon: Receipt,
        isSimple: true,
        badge: 'WAJIB',
        description: 'Listrik, gas, gaji, dll'
      },
      {
        name: 'Resep',
        href: '/resep',
        icon: ChefHat,
        isSimple: true,
        badge: 'PENTING',
        description: 'Komposisi & takaran'
      }
    ]
  },
  {
    title: '🎯 STEP 2: SALES & ORDERS',
    description: 'Kelola penjualan',
    isWorkflow: true,
    items: [
      {
        name: 'Pesanan',
        href: '/orders',
        icon: ShoppingCart,
        description: 'Kelola pesanan masuk'
      },
      {
        name: 'Pelanggan',
        href: '/customers',
        icon: Users,
        description: 'Database pelanggan'
      }
    ]
  },
  {
    title: '⚙️ LAINNYA',
    items: [
      {
        name: 'Keuangan',
        href: '/finance',
        icon: DollarSign,
        description: 'Laporan keuangan'
      },
      {
        name: 'Pengaturan',
        href: '/settings',
        icon: Settings,
        description: 'Konfigurasi sistem'
      }
    ]
  }
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile: boolean
}

export default function SimpleSidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const pathname = usePathname()

  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = isActivePath(item.href)
    const Icon = item.icon

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        onClick={isMobile ? onToggle : undefined}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const renderNavigationSection = (section: NavigationSection) => (
    <div key={section.title} className="space-y-2">
      <div className="px-3 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {section.description}
          </p>
        )}
      </div>
      <div className="space-y-1">
        {section.items.map(renderNavigationItem)}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ChefHat className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">HeyTrack</span>
          </div>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {navigationSections.map(renderNavigationSection)}
        </nav>
      </aside>
    </>
  )
}

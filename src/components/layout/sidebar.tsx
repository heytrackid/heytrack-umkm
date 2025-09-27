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
  Brain
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
  isSimple?: boolean
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigationSections: NavigationSection[] = [
  {
    title: 'Main',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        name: 'AI Hub',
        href: '/ai',
        icon: Brain,
      },
    ]
  },
  {
    title: 'UMKM Simple',
    items: [
      {
        name: 'Resep',
        href: '/resep-simple',
        icon: ChefHat,
        isSimple: true
      },
      {
        name: 'HPP Cepat',
        href: '/hpp-simple',
        icon: Calculator,
        isSimple: true
      },
      {
        name: 'Bahan Baku',
        href: '/bahan-simple',
        icon: Package,
        isSimple: true
      },
      {
        name: 'Pesanan',
        href: '/pesanan-simple',
        icon: ShoppingCart,
        isSimple: true
      },
      {
        name: 'Pelanggan',
        href: '/pelanggan-simple',
        icon: Users,
        isSimple: true
      },
      {
        name: 'Pengeluaran',
        href: '/pengeluaran-simple',
        icon: Receipt,
        isSimple: true
      },
      {
        name: 'Laporan',
        href: '/laporan-simple',
        icon: BarChart3,
        isSimple: true
      },
    ]
  }
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function SimpleSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64",
        "bg-white dark:bg-black",
        "border-r border-gray-200 dark:border-gray-800",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
              <Package className="h-5 w-5 text-gray-900 dark:text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                HeyTrack
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                UMKM Management
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {/* Section Title */}
              <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      <span>{item.name}</span>
                      {item.isSimple && (
                        <span className="ml-auto text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          SIMPLE
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden",
          "p-2 rounded-md",
          "bg-white dark:bg-black",
          "border border-gray-200 dark:border-gray-800",
          "text-gray-600 dark:text-gray-400",
          "hover:text-gray-900 dark:hover:text-white",
          "hover:bg-gray-50 dark:hover:bg-gray-900"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </>
  )
}
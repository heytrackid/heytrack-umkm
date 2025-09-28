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
  Brain,
  ClipboardCheck,
  TrendingUp,
  Settings,
  FileText,
  Target,
  CheckCircle,
  Tags
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
      },
      {
        name: 'AI Hub',
        href: '/ai',
        icon: Brain,
        description: 'Smart assistant'
      },
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
      },
    ]
  },
  {
    title: '🧮 STEP 2: HITUNG HPP',
    description: 'Kalkulasi harga pokok produksi',
    isWorkflow: true,
    items: [
      {
        name: 'HPP Calculator',
        href: '/hpp',
        icon: Calculator,
        isSimple: true,
        badge: 'AUTO',
        description: 'Hitung HPP otomatis'
      },
      {
        name: 'Target Harga',
        href: '/pricing',
        icon: Target,
        isSimple: true,
        badge: 'PROFIT',
        description: 'Set margin & harga jual'
      },
    ]
  },
  {
    title: '📊 STEP 3: OPERASIONAL',
    description: 'Jalankan bisnis dengan data akurat',
    isWorkflow: true,
    items: [
      {
        name: 'Kelola Pesanan',
        href: '/orders',
        icon: ShoppingCart,
        isSimple: true,
        badge: 'HARIAN',
        description: 'Terima & proses order'
      },
      {
        name: 'Data Pelanggan',
        href: '/customers',
        icon: Users,
        isSimple: true,
        badge: 'CRM',
        description: 'Database customer'
      },
    ]
  },
  {
    title: '📈 STEP 4: MONITORING',
    description: 'Pantau performa & profit',
    isWorkflow: true,
    items: [
      {
        name: 'Laporan Profit',
        href: '/reports',
        icon: BarChart3,
        isSimple: true,
        badge: 'ANALISA',
        description: 'Track keuntungan harian'
      },
      {
        name: 'Review HPP',
        href: '/review',
        icon: TrendingUp,
        isSimple: true,
        badge: 'OPTIMASI',
        description: 'Evaluasi & tingkatkan'
      },
    ]
  },
  {
    title: '⚙️ LAINNYA',
    items: [
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'Pengaturan aplikasi'
      },
      {
        name: 'More Features',
        href: '/more',
        icon: FileText,
        description: 'Fitur tambahan'
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
        "fixed inset-y-0 left-0 z-50 flex flex-col",
        "bg-white dark:bg-black",
        "border-r border-gray-200 dark:border-gray-800",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:inset-0",
        // Mobile: full screen width on small screens, 80% on larger mobile
        "w-full sm:w-80 lg:w-72",
        // Animation
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-800 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                HeyTrack
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                UMKM Kuliner HPP
              </p>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 lg:px-4 py-4 space-y-4 lg:space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {/* Section Title */}
              <div className={cn(
                "px-3 py-2 rounded-lg",
                section.isWorkflow 
                  ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700" 
                  : ""
              )}>
                <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  section.isWorkflow 
                    ? "text-gray-700 dark:text-gray-300" 
                    : "text-gray-400 dark:text-gray-500"
                )}>
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {section.description}
                  </p>
                )}
              </div>
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href.includes('#') && pathname === item.href.split('#')[0])
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-start px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                        "hover:scale-[1.02] hover:shadow-sm",
                        isActive 
                          ? "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-center mr-3 mt-0.5">
                        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{item.name}</span>
                          
                          {/* Badges */}
                          <div className="flex items-center gap-1 ml-2">
                            {item.badge && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {item.badge}
                              </span>
                            )}
                            {item.isSimple && !item.badge && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium">
                                SIMPLE
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="w-1 bg-gray-700 dark:bg-gray-300 rounded-full self-stretch ml-2" />
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
          "p-3 rounded-lg shadow-lg",
          "bg-gray-800 dark:bg-gray-600",
          "text-white",
          "hover:bg-gray-700 dark:hover:bg-gray-500",
          "transition-all duration-200",
          "hover:scale-105"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </>
  )
}
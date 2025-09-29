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
  TrendingUp,
  Settings,
  Target,
  DollarSign,
  Layers,
  Banknote,
  X,
  Menu
} from 'lucide-react'
import ExcelExportButton from '@/components/export/ExcelExportButton'
import { useI18n } from '@/providers/I18nProvider'

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

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

export default function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useI18n()

  const navigationSections: NavigationSection[] = [
    {
      title: t('navigation.dashboard.title'),
      items: [
        {
          name: t('navigation.dashboard.title'),
          href: '/',
          icon: LayoutDashboard,
          description: t('navigation.dashboard.description')
        }
      ]
    },
    {
      title: t('navigation.dataManager.title'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.dataManager.rawMaterials.title'),
          href: '/inventory',
          icon: Package,
          isSimple: true,
          badge: t('navigation.dataManager.rawMaterials.badge'),
          description: t('navigation.dataManager.rawMaterials.description')
        },
        {
          name: t('navigation.dataManager.categories.title'),
          href: '/categories',
          icon: Layers,
          isSimple: true,
          badge: t('navigation.dataManager.categories.badge'),
          description: t('navigation.dataManager.categories.description')
        },
        {
          name: t('navigation.dataManager.operationalCosts.title'),
          href: '/operational-costs',
          icon: Receipt,
          isSimple: true,
          badge: t('navigation.dataManager.operationalCosts.badge'),
          description: t('navigation.dataManager.operationalCosts.description')
        },
        {
          name: t('navigation.dataManager.recipes.title'),
          href: '/resep',
          icon: ChefHat,
          isSimple: true,
          badge: t('navigation.dataManager.recipes.badge'),
          description: t('navigation.dataManager.recipes.description')
        },
      ]
    },
    {
      title: t('navigation.calculation.title'),
      description: t('navigation.calculation.description'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.calculation.hppPricing.title'),
          href: '/hpp',
          icon: Calculator,
          isSimple: true,
          badge: t('navigation.calculation.hppPricing.badge'),
          description: t('navigation.calculation.hppPricing.description')
        },
        {
          name: t('navigation.calculation.hppEnhanced.title'),
          href: '/hpp-enhanced',
          icon: Target,
          isSimple: true,
          badge: t('navigation.calculation.hppEnhanced.badge'),
          description: t('navigation.calculation.hppEnhanced.description')
        },
      ]
    },
    {
      title: t('navigation.operations.title'),
      description: t('navigation.operations.description'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.operations.orders.title'),
          href: '/orders',
          icon: ShoppingCart,
          isSimple: true,
          badge: t('navigation.operations.orders.badge'),
          description: t('navigation.operations.orders.description')
        },
        {
          name: t('navigation.operations.customers.title'),
          href: '/customers',
          icon: Users,
          isSimple: true,
          badge: t('navigation.operations.customers.badge'),
          description: t('navigation.operations.customers.description')
        },
      ]
    },
    {
      title: t('navigation.monitoring.title'),
      description: t('navigation.monitoring.description'),
      isWorkflow: true,
      items: [
        {
          name: t('navigation.monitoring.cashFlow.title'),
          href: '/cash-flow',
          icon: DollarSign,
          isSimple: true,
          badge: t('navigation.monitoring.cashFlow.badge'),
          description: t('navigation.monitoring.cashFlow.description')
        },
        {
          name: t('navigation.monitoring.finance.title'),
          href: '/finance',
          icon: Banknote,
          isSimple: true,
          badge: t('navigation.monitoring.finance.badge'),
          description: t('navigation.monitoring.finance.description')
        },
        {
          name: t('navigation.monitoring.reports.title'),
          href: '/reports',
          icon: BarChart3,
          isSimple: true,
          badge: t('navigation.monitoring.reports.badge'),
          description: t('navigation.monitoring.reports.description')
        },
        {
          name: t('navigation.monitoring.review.title'),
          href: '/review',
          icon: TrendingUp,
          isSimple: true,
          badge: t('navigation.monitoring.review.badge'),
          description: t('navigation.monitoring.review.description')
        },
      ]
    },
    {
      title: t('navigation.others.title'),
      items: [
        {
          name: t('navigation.others.settings.title'),
          href: '/settings',
          icon: Settings,
          description: t('navigation.others.settings.description')
        },
      ]
    }
  ]

  // If it's mobile mode (used within Sheet), render simplified version
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                HeyTrack
              </h1>
              <p className="text-xs text-muted-foreground">
                UMKM Kuliner HPP
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {/* Section Title */}
              <div className={cn(
               "px-3 py-2 rounded-lg",
                section.isWorkflow 
                  ?"bg-muted/50 border border-border" 
                  :""
              )}>
                <h3 className={cn(
                 "text-xs font-semibold uppercase tracking-wider",
                  section.isWorkflow 
                    ?"text-foreground" 
                    :"text-muted-foreground"
                )}>
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-xs text-muted-foreground mt-1">
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
                       "hover:scale-[1.02]",
                        isActive 
                          ?"bg-primary/10 text-primary border border-primary/20" 
                          :"text-muted-foreground hover:bg-muted hover:text-foreground"
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
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="w-1 bg-primary rounded-full self-stretch ml-2" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    )
  }

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
       "overflow-hidden",
        // Fixed width for consistency
       "w-80 lg:w-72",
        // Animation
        isOpen ?"translate-x-0" :"-translate-x-full lg:translate-x-0"
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
                  ?"bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700" 
                  :""
              )}>
                <h3 className={cn(
                 "text-xs font-semibold uppercase tracking-wider",
                  section.isWorkflow 
                    ?"text-gray-700 dark:text-gray-300" 
                    :"text-gray-400 dark:text-gray-500"
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
                       "hover:scale-[1.02]",
                        isActive 
                          ?"bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700" 
                          :"text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-center mr-3 mt-0.5">
                        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate flex-1">{item.name}</span>
                          
                          {/* Badges */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {item.badge && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                {item.badge}
                              </span>
                            )}
                            {item.isSimple && !item.badge && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium whitespace-nowrap">
                                SIMPLE
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Description */}
                        {item.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed break-words">
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
        
        {/* Footer with Export Button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <ExcelExportButton 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
          />
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2024 HeyTrack
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button - Only show if not using mobile header */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className={cn(
           "fixed top-4 left-4 z-50 lg:hidden",
           "p-3 rounded-lg",
           "bg-gray-800 dark:bg-gray-600",
           "text-white",
           "hover:bg-gray-700 dark:hover:bg-gray-500",
           "transition-all duration-200",
           "hover:scale-105"
          )}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}
    </>
  )
}
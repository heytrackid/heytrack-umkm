'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/useSidebar'
import { 
  LayoutDashboard, 
  ChefHat, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Calculator,
  Warehouse,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  Receipt,
  ChevronDown,
  ChevronRight,
  Brain,
  Sparkles,
  ChevronLeft,
  Zap
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

export default function AppSidebar() {
  const pathname = usePathname()
  const { isCollapsed, isHovered, toggle, setHovered } = useSidebar()

  // Determine if sidebar should show content (expanded or hovered)
  const showContent = !isCollapsed || isHovered
  
  const sidebarVariants = {
    collapsed: { 
      width: 60,
      transition: { 
        duration: 0.2,
        ease: "easeInOut" as const
      }
    },
    expanded: { 
      width: 240,
      transition: { 
        duration: 0.2,
        ease: "easeInOut" as const
      }
    }
  } as const

  const contentVariants = {
    hidden: { 
      opacity: 0,
      x: -10,
      transition: { 
        duration: 0.15
      }
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: { 
        delay: 0.1,
        duration: 0.2
      }
    }
  }

  return (
    <motion.div
      className={cn(
        "h-full bg-card border-r border-border flex flex-col relative",
        isCollapsed && "hover:shadow-lg"
      )}
      initial={false}
      animate={showContent ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      onHoverStart={() => isCollapsed && setHovered(true)}
      onHoverEnd={() => isCollapsed && setHovered(false)}
      style={{ zIndex: isCollapsed && isHovered ? 50 : 'auto' }}
    >
      {/* Logo/Brand */}
      <div className="flex items-center p-4 border-b border-border">
        <Package className="h-6 w-6 text-primary flex-shrink-0" />
        <AnimatePresence>
          {showContent && (
            <motion.div
              className="ml-3 flex flex-col min-w-0"
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <span className="font-semibold text-sm truncate">HeyTrack UMKM</span>
              <span className="text-xs text-muted-foreground truncate">Bakery Management</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-4 px-2">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="space-y-1">
              {/* Section Title */}
              <AnimatePresence>
                {showContent && (
                  <motion.div
                    className="px-3 py-1"
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <h3 className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      section.title === 'UMKM Simple' 
                        ? "text-slate-600 dark:text-slate-400" 
                        : "text-muted-foreground"
                    )}>
                      {section.title === 'UMKM Simple' && (
                        <span className="inline-flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {section.title}
                        </span>
                      ) || section.title}
                    </h3>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href
                  const globalIndex = sectionIndex * 10 + itemIndex
                  
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: globalIndex * 0.02 }}
                    >
                      <Link href={item.href}>
                        <motion.div
                          className={cn(
                            "flex items-center rounded-lg transition-all duration-200 relative group",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive 
                              ? item.isSimple
                                ? "bg-slate-700 text-white shadow-sm" 
                                : "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                            showContent ? "px-3 py-2" : "px-3 py-2 justify-center"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative">
                            <item.icon className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isActive && (item.isSimple ? "text-white" : "text-primary-foreground")
                            )} />
                            {item.isSimple && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-400 rounded-full" />
                            )}
                          </div>
                          
                          <AnimatePresence>
                            {showContent && (
                              <motion.span
                                className={cn(
                                  "ml-3 text-sm font-medium truncate",
                                  item.isSimple && "flex items-center gap-1"
                                )}
                                variants={contentVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                              >
                                {item.name}
                                {item.isSimple && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    SIMPLE
                                  </span>
                                )}
                              </motion.span>
                            )}
                          </AnimatePresence>
                          
                          {/* Tooltip for collapsed state only when not hovering */}
                          {isCollapsed && !isHovered && (
                            <div className={cn(
                              "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground",
                              "text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100", 
                              "transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap"
                            )}>
                              {item.name}
                              {item.isSimple && (
                                <span className="ml-1 text-slate-500">⚡</span>
                              )}
                            </div>
                          )}
                          
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full",
                                item.isSimple ? "bg-white" : "bg-primary-foreground"
                              )}
                              layoutId="activeIndicator"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Toggle Button */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "w-full h-8 transition-all duration-200",
            showContent ? "justify-start pl-3" : "justify-center"
          )}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="h-4 w-4" />
          </motion.div>
          <AnimatePresence>
            {showContent && (
              <motion.span
                className="ml-2 text-xs"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {isCollapsed ? 'Expand' : 'Collapse'}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  )
}

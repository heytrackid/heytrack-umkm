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
  ChevronLeft
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: any
}

const navigationItems: NavigationItem[] = [
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
  {
    name: 'Resep',
    href: '/recipes',
    icon: ChefHat,
  },
  {
    name: 'HPP Calculator',
    href: '/hpp',
    icon: Calculator,
  },
  {
    name: 'Produksi',
    href: '/production',
    icon: TrendingUp,
  },
  {
    name: 'Bahan Baku',
    href: '/ingredients',
    icon: Package,
  },
  {
    name: 'Stok & Inventory',
    href: '/inventory',
    icon: Warehouse,
  },
  {
    name: 'Pesanan',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Pelanggan',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Keuangan',
    href: '/finance',
    icon: CreditCard,
  },
  {
    name: 'Biaya Operasional',
    href: '/expenses',
    icon: Receipt,
  },
  {
    name: 'Laporan',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Pengaturan',
    href: '/settings',
    icon: Settings,
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
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Link href={item.href}>
                  <motion.div
                    className={cn(
                      "flex items-center rounded-lg transition-all duration-200 relative group",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground",
                      showContent ? "px-3 py-2" : "px-3 py-2 justify-center"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive && "text-primary-foreground"
                    )} />
                    
                    <AnimatePresence>
                      {showContent && (
                        <motion.span
                          className="ml-3 text-sm font-medium truncate"
                          variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          {item.name}
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
                      </div>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
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

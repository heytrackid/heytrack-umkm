'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Plus,
  MoreHorizontal,
  Receipt
} from 'lucide-react'

interface BottomNavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  color?: string
}

const mainNavItems: BottomNavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Pesanan',
    href: '/orders',
    icon: ShoppingCart,
    color: 'text-gray-600 dark:text-gray-400'
  },
  {
    name: 'Bahan',
    href: '/inventory',
    icon: Package,
    color: 'text-gray-600 dark:text-gray-400'
  },
  {
    name: 'Biaya',
    href: '/finance',
    icon: Receipt,
    color: 'text-gray-600 dark:text-gray-400'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: MoreHorizontal,
    color: 'text-gray-600'
  }
]

interface MobileBottomNavProps {
  className?: string
}

function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={cn(
     "fixed bottom-0 left-0 right-0 z-50",
     "bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800",
     "",
     "md:hidden", // Only show on mobile
     "safe-area-pb", // Respect safe area on devices with notch/home indicator
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
             "relative flex flex-col items-center justify-center",
             "min-w-0 flex-1 py-2 px-1",
             "text-xs font-medium",
             "transition-colors duration-200",
             "rounded-lg",
              isActive(item.href)
                ?"text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                :"text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
            )}
          >
            <div className="relative">
              <item.icon 
                className={cn(
                 "h-5 w-5 mb-1 transition-colors duration-200",
                  isActive(item.href)
                    ?"text-gray-900 dark:text-white"
                    :"text-gray-500 dark:text-gray-400"
                )}
              />
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive"
                  className={cn(
                   "absolute -top-1 -right-1",
                   "h-4 w-4 p-0",
                   "flex items-center justify-center",
                   "text-xs font-bold",
                   "min-w-4"
                  )}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
            </div>
            <span className={cn(
             "truncate",
              isActive(item.href) 
                ?"font-semibold text-gray-900 dark:text-white" 
                :"font-normal text-gray-500 dark:text-gray-400"
            )}>
              {item.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <Link
          href="/orders"
          className={cn(
           "flex items-center justify-center",
           "w-14 h-14 rounded-full",
           "bg-gray-900 dark:bg-white",
           "text-white dark:text-gray-900",
           " hover:",
           "transition-all duration-200",
           "active:scale-95",
           "border-4 border-white dark:border-black"
          )}
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </nav>
  )
}

// Safe area utilities for CSS
export const SafeAreaStyles = `
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-area-pt {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-area-pl {
    padding-left: env(safe-area-inset-left);
  }
  
  .safe-area-pr {
    padding-right: env(safe-area-inset-right);
  }
  
  /* Mobile viewport height fix */
  .mobile-vh {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height for mobile browsers */
  }
  
  .mobile-min-vh {
    min-height: 100vh;
    min-height: 100dvh;
  }
`

// Hook untuk mengatur padding bottom ketika bottom nav aktif
export function useBottomNavPadding() {
  const { isMobile } = React.useMemo(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false }
    }
    return {
      isMobile: window.innerWidth < 768
    }
  }, [])

  return {
    paddingBottom: isMobile ? '80px' : '0', // Height of bottom nav + padding
    className: isMobile ? 'pb-20' : ''
  }
}

export default MobileBottomNav
export { MobileBottomNav }

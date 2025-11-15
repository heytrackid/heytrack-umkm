'use client'

import { LayoutDashboard, ShoppingCart, Users, Package, Utensils, DollarSign, Settings, TrendingUp, Plus, Search, Truck, MoreHorizontal, Receipt, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, type ReactNode, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useInstantNavigation } from '@/hooks/useInstantNavigation'
import { useAdvancedLinkPreloading, useAdvancedButtonPreloading } from '@/hooks/usePreloading'
import { cn } from '@/lib/utils'


// Haptic feedback utility for mobile devices
interface ExtendedWindow extends Window {
  hapticFeedback?: {
    impact: (type: string) => void
  }
}

const triggerHapticFeedback = (type: 'heavy' | 'light' | 'medium' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    try {
      // Check for modern vibration API
      if ('vibrate' in navigator) {
        const patterns: Record<string, number[]> = {
          light: [10],
          medium: [20],
          heavy: [30]
        }
        navigator.vibrate(patterns[type] ?? [10])
      }
      // Fallback for iOS devices with haptic feedback
      else if ('hapticFeedback' in (window as ExtendedWindow)) {
        const hapticTypes: Record<string, string> = {
          light: 'impactLight',
          medium: 'impactMedium',
          heavy: 'impactHeavy'
        }
        ;(window as ExtendedWindow).hapticFeedback?.impact(hapticTypes[type] ?? 'impactLight')
      }
    } catch {
      // Silently fail if haptic feedback is not supported
    }
  }
}

// Smart Link component with preloading
interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: ReactNode
  className?: string
  activeClassName?: string
  preloadOnHover?: boolean
  preloadDelay?: number
  onClick?: () => void
  style?: React.CSSProperties
}

export const SmartLink = ({
  href,
  children,
  className,
  activeClassName,
  preloadOnHover = true,
  preloadDelay = 100,
  onClick,
  style,
}: SmartLinkProps) => {
  const pathname = usePathname()
  const linkPreloading = useAdvancedLinkPreloading()
  const [isHovered, setIsHovered] = useState(false)

  // Enhanced active state detection
  const isActive = pathname === href ||
    (href !== '/' && pathname.startsWith(href)) ||
    (href === '/dashboard' && pathname === '/')

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (preloadOnHover) {
      setTimeout(() => {
        linkPreloading.onMouseEnter(href)
      }, preloadDelay)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Link
      href={href}
      className={cn(
        className,
        isActive && ['active', activeClassName], // Add 'active' class for CSS targeting
        isHovered && !isActive && 'hover:opacity-80 transition-opacity'
      )}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
}

// Smart Button component with modal preloading
interface SmartButtonProps {
  children: ReactNode
  onClick?: () => void
  modalType?: string
  preloadOnHover?: boolean
  className?: string
  variant?: "default" | "destructive" | "ghost" | "link" | "outline" | "secondary"
  size?: "default" | "icon" | "lg" | "sm"
}

export const SmartButton = ({
  children,
  onClick,
  modalType,
  preloadOnHover = true,
  className,
  variant = "default",
  size = "default"
}: SmartButtonProps) => {
  const { preloadModalOnHover } = useAdvancedButtonPreloading()

  const handleMouseEnter = () => {
    if (preloadOnHover && modalType) {
      preloadModalOnHover(modalType)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Button>
  )
}

// Main navigation items with preloading
const navigationItems = [
  {
    title: 'Dasbor',
    href: '/dashboard',
    icon: LayoutDashboard,
    preloadTargets: ['/orders', '/cash-flow', '/ingredients']
  },
  {
    title: 'Pesanan',
    href: '/orders',
    icon: ShoppingCart,
    preloadTargets: ['/customers', '/orders/new']
  },
  {
    title: 'Pelanggan',
    href: '/customers',
    icon: Users,
    preloadTargets: ['/orders', '/cash-flow']
  },
  {
    title: 'Bahan',
    href: '/ingredients',
    icon: Package,
    preloadTargets: ['/recipes', '/orders']
  },
  {
    title: 'Resep',
    href: '/recipes',
    icon: Utensils,
    preloadTargets: ['/ingredients', '/hpp']
  },
  {
    title: 'Pemasok',
    href: '/suppliers',
    icon: Truck,
    preloadTargets: ['/ingredients', '/recipes']
  },
  {
    title: 'HPP',
    href: '/hpp',
    icon: TrendingUp,
    preloadTargets: ['/recipes', '/hpp']
  },
  {
    title: 'Arus Kas',
    href: '/cash-flow',
    icon: DollarSign,
    preloadTargets: ['/orders', '/dashboard']
  },
  {
    title: 'Pengaturan',
    href: '/settings',
    icon: Settings,
    preloadTargets: ['/dashboard']
  },
  {
    title: 'Biaya Operasional',
    href: '/operational-costs',
    icon: Receipt,
    preloadTargets: ['/orders', '/production']
  },
  {
    title: 'Chatbot AI',
    href: '/ai-chatbot',
    icon: MessageSquare,
    badge: '✨',
    preloadTargets: ['/dashboard']
  }
]



// Navigation Item Component with Active State
interface NavItemProps {
  item: typeof navigationItems[0]
  index: number
}

export const NavItem = ({ item, index }: NavItemProps) => {
  const pathname = usePathname()
  const linkPreloading = useAdvancedLinkPreloading()
  const { navigateInstant } = useInstantNavigation()
  const [isHovered, setIsHovered] = useState(false)

  // Enhanced active state detection
  const isActive = pathname === item.href ||
    (item.href !== '/' && pathname.startsWith(item.href)) ||
    (item.href === '/dashboard' && pathname === '/')

  const handleMouseEnter = () => {
    setIsHovered(true)
    setTimeout(() => {
      linkPreloading.onMouseEnter(item.href)
    }, 100)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleClick = () => {
    triggerHapticFeedback('light')
  }

  return (
    <button
      onClick={() => {
        handleClick()
        navigateInstant(item.href)
      }}
      className={cn(
        "flex flex-col items-center space-y-1 px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-[13px] font-medium transition-all duration-200 rounded-lg min-w-[50px] sm:min-w-[60px] flex-1 max-w-[70px] sm:max-w-[80px] relative group touch-manipulation",
        "min-h-[56px] active:scale-95", // Ensure minimum touch target size (44px is iOS minimum, we use 56px for comfort)
        isActive && "text-primary bg-primary/10  scale-105",
        isHovered && !isActive && "hover:opacity-80"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => linkPreloading.onFocus(item.href)}
       aria-label={`Navigate to ${item.title}`}
    >
      <div className="relative">
        <item.icon
          className={cn(
            "h-5 w-5 sm:h-6 sm:w-6 transition-transform",
            isHovered && "scale-110"
          )}
          data-testid="nav-icon"
        />
        {/* Active indicator dot */}
        <div
          className={cn(
            "absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-0"
          )}
          data-testid="active-indicator"
        />
      </div>
      <span className="truncate text-center leading-tight">{item.title}</span>
      {/* Active background glow */}
      <div className={cn(
        "absolute inset-0 bg-primary/5 rounded-lg transition-opacity duration-200 -z-10",
        isActive ? "opacity-100" : "opacity-0"
      )} />
    </button>
  )
}

// Smart Mobile Bottom Navigation
export const SmartBottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mainItems = navigationItems.slice(0, 4) // First 4 items for mobile
  const additionalItems = navigationItems.slice(4) // Remaining items for menu

  const handleMoreClick = () => {
    triggerHapticFeedback('medium')
  }

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      {/* Bottom Navigation Bar - Fixed positioning untuk semua mobile */}
      <nav
        data-mobile-nav
        data-testid="mobile-nav"
        className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 place-items-center h-[56px] px-1 bg-background/95 backdrop-blur-md border-t border-border/50  safe-bottom animate-in fade-in duration-300 pb-[env(safe-area-inset-bottom)]"
        role="navigation"
        aria-label="Mobile navigation"
      >
        {mainItems.map((item, index) => (
          <NavItem
            key={item.href}
            item={item}
            index={index}
          />
        ))}

        {/* More Menu Button */}
        <SheetTrigger asChild>
          <button
            className="flex flex-col items-center space-y-1 px-2 py-2 sm:px-4 sm:py-4 text-xs font-medium transition-all duration-200 rounded-lg min-w-[50px] sm:min-w-[60px] flex-1 max-w-[70px] sm:max-w-[80px] text-muted-foreground hover:text-foreground hover:bg-accent/50 active:scale-95 animate-in slide-in-from-bottom-2 duration-200 touch-manipulation min-h-[60px]"
            style={{ animationDelay: '400ms' }}
            aria-label="More navigation options"
            aria-expanded={isMenuOpen}
            aria-haspopup="dialog"
            onClick={handleMoreClick}
          >
            <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate text-center leading-tight">Lainnya</span>
          </button>
        </SheetTrigger>
      </nav>

      <SheetContent
        side="bottom"
        className="max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-32px)] safe-bottom"
        aria-label="Additional navigation menu"
      >
        <SheetHeader>
          <SheetTitle>Lainnya</SheetTitle>
          <SheetDescription>Menu navigasi tambahan untuk fitur lainnya</SheetDescription>
        </SheetHeader>
        <div
          className="flex flex-col gap-3 mt-6 px-4 animate-in slide-in-from-bottom-4 duration-300 overflow-y-auto"
          role="menu"
          aria-label="Additional navigation options"
        >
          {additionalItems.map((item, index) => (
            <SmartLink
              key={item.href}
              href={item.href}
              className="flex items-center space-x-4 p-4 rounded-xl border  hover: hover:scale-105 transition-all duration-200 bg-card hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              activeClassName="border-primary bg-primary/15 ring-2 ring-primary/20 text-primary font-semibold"
              preloadDelay={100}
              onClick={() => {
                triggerHapticFeedback('light')
                setIsMenuOpen(false)
              }}
              style={{ animationDelay: `${index * 50}ms` }}
              role="menuitem"
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">{item.title}</span>
                {item.badge && <span className="ml-2 text-xs">{item.badge}</span>}
              </div>
            </SmartLink>
          ))}
        </div>
       </SheetContent>
     </Sheet>
   )
 }

// Smart Action Buttons (for forms, modals, etc)
export const SmartActionButton = ({
  action,
  children,
  ...props
}: Omit<SmartButtonProps, 'modalType'> & {
  action: 'add-customer' | 'add-finance' | 'add-ingredient' | 'add-order' | 'add-recipe'
  children: ReactNode
}) => {

  const modalTypeMap = {
    'add-order': 'order-form',
    'add-customer': 'customer-form',
    'add-ingredient': 'ingredient-form',
    'add-recipe': 'recipe-form',
    'add-finance': 'finance-form'
  }

  return (
    <SmartButton modalType={modalTypeMap[action]} {...props}>
      <Plus className="h-4 w-4 mr-2" />
      {children}
    </SmartButton>
  )
}

// Smart Search Component (preloads search results)
export const SmartSearchButton = () => {
  const { preloadChartOnHover } = useAdvancedButtonPreloading()

  return (
    <Button
      variant="outline"
      size="sm"
      onMouseEnter={() => preloadChartOnHover()}
    >
      <Search className="h-4 w-4 mr-2" />
      Cari
    </Button>
  )
}

// Navigation breadcrumbs with preloading
interface BreadcrumbItem {
  label: string
  href?: string
}

export const SmartBreadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
    {items.map((item, index: number) => (
      <Fragment key={index}>
        {item.href ? (
          <SmartLink
            href={item.href}
            className="hover:text-foreground transition-colors"
            preloadDelay={200}
          >
            {item.label}
          </SmartLink>
        ) : (
          <span className="text-foreground font-medium">{item.label}</span>
        )}
        {index < items.length - 1 && (
          <span className="text-muted-foreground">/</span>
        )}
      </Fragment>
    ))}
  </nav>
)

// Quick Actions Panel with Smart Buttons
export const SmartQuickActions = () => (
  <div className="flex flex-wrap gap-2">
    <SmartActionButton action="add-order">
      Pesanan Baru
    </SmartActionButton>

    <SmartActionButton action="add-customer" variant="outline">
      Tambah Pelanggan
    </SmartActionButton>

    <SmartActionButton action="add-ingredient" variant="outline">
      Tambah Bahan
    </SmartActionButton>

    <SmartSearchButton />
  </div>
)

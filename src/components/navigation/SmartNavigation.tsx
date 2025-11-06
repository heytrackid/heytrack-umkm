'use client'

import { Fragment, type ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { cn } from '@/lib/utils'
import { useAdvancedLinkPreloading, useAdvancedButtonPreloading } from '@/hooks/usePreloading'
import { LayoutDashboard, ShoppingCart, Users, Package, Utensils, DollarSign, Settings, BarChart3, Plus, Search, Truck, MoreHorizontal, Receipt, MessageSquare } from 'lucide-react'

// Smart Link component with preloading
interface SmartLinkProps {
  href: string
  children: ReactNode
  className?: string
  activeClassName?: string
  preloadOnHover?: boolean
  preloadDelay?: number
  onClick?: () => void
}

export const SmartLink = ({
  href,
  children,
  className,
  activeClassName,
  preloadOnHover = true,
  preloadDelay = 100,
  onClick
}: SmartLinkProps) => {
  const pathname = usePathname()
  const linkPreloading = useAdvancedLinkPreloading()
  const [isHovered, setIsHovered] = useState(false)

  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

  const handleMouseEnter = () => {
    void setIsHovered(true)
    if (preloadOnHover) {
      setTimeout(() => {
        linkPreloading.onMouseEnter(href)
      }, preloadDelay)
    }
  }

  const handleMouseLeave = () => {
    void setIsHovered(false)
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
        isActive && activeClassName,
        isHovered && 'opacity-80 transition-opacity'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => linkPreloading.onFocus(href)}
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
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
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
      void preloadModalOnHover(modalType)
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
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    preloadTargets: ['/orders', '/cash-flow', '/ingredients']
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    preloadTargets: ['/customers', '/orders/new']
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    preloadTargets: ['/orders', '/cash-flow']
  },
  {
    title: 'Ingredients',
    href: '/ingredients',
    icon: Package,
    preloadTargets: ['/recipes', '/orders']
  },
  {
    title: 'Recipes',
    href: '/recipes',
    icon: Utensils,
    preloadTargets: ['/ingredients', '/hpp']
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
    preloadTargets: ['/ingredients', '/recipes']
  },
  {
    title: 'HPP',
    href: '/hpp',
    icon: BarChart3,
    preloadTargets: ['/recipes', '/hpp']
  },
  {
    title: 'Cash Flow',
    href: '/cash-flow',
    icon: DollarSign,
    preloadTargets: ['/orders', '/dashboard']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    preloadTargets: ['/dashboard']
  },
  {
    title: 'Operational Costs',
    href: '/operational-costs',
    icon: Receipt,
    preloadTargets: ['/orders', '/production']
  },
  {
    title: 'AI Chatbot',
    href: '/ai-chatbot',
    icon: MessageSquare,
    badge: '✨',
    preloadTargets: ['/dashboard']
  }
]



// Smart Mobile Bottom Navigation
export const SmartBottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const mainItems = navigationItems.slice(0, 4) // First 4 items for mobile
  const additionalItems = navigationItems.slice(4) // Remaining items for menu

  return (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <nav data-mobile-nav className="flex justify-around items-center py-2 bg-background border-t">
        {mainItems.map((item) => (
          <SmartLink
            key={item.href}
            href={item.href}
            className="flex flex-col items-center space-y-1 px-2 py-1 text-xs font-medium transition-colors"
            activeClassName="text-primary"
            preloadDelay={100}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </SmartLink>
        ))}

        {/* More Menu Button */}
        <SheetTrigger asChild>
          <button className="flex flex-col items-center space-y-1 px-2 py-1 text-xs font-medium transition-colors text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </button>
        </SheetTrigger>
      </nav>

      <SheetContent side="bottom" className="h-[80vh] safe-bottom">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {additionalItems.map((item) => (
            <SmartLink
              key={item.href}
              href={item.href}
              className="flex flex-col items-center space-y-2 p-4 rounded-lg border hover:bg-accent transition-colors"
              activeClassName="border-primary bg-primary/5"
              preloadDelay={100}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-sm font-medium text-center">{item.title}</span>
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
}: {
  action: 'add-order' | 'add-customer' | 'add-ingredient' | 'add-recipe' | 'add-finance'
  children: ReactNode
} & Omit<SmartButtonProps, 'modalType'>) => {

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
      Search
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
      New Order
    </SmartActionButton>

    <SmartActionButton action="add-customer" variant="outline">
      Add Customer
    </SmartActionButton>

    <SmartActionButton action="add-ingredient" variant="outline">
      Add Ingredient
    </SmartActionButton>

    <SmartSearchButton />
  </div>
)

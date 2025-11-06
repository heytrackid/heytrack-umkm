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
  style
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
      style={style}
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
    icon: BarChart3,
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
            <span>Lainnya</span>
          </button>
        </SheetTrigger>
      </nav>

      <SheetContent side="bottom" className="h-[80vh] safe-bottom">
        <SheetHeader>
          <SheetTitle>Lainnya</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 mt-6 animate-in slide-in-from-bottom-4 duration-300">
          {additionalItems.map((item, index) => (
            <SmartLink
              key={item.href}
              href={item.href}
              className="flex items-center space-x-4 p-4 rounded-xl border shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 bg-card hover:bg-accent/50"
              activeClassName="border-primary bg-primary/10 shadow-primary/20"
              preloadDelay={100}
              onClick={() => setIsMenuOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
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

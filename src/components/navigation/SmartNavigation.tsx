'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLinkPreloading, useButtonPreloading } from '@/hooks/useSimplePreloading'
import {
  LayoutDashboard,
  ShoppingCart, 
  Users,
  Package,
  Utensils,
  DollarSign,
  Settings,
  BarChart3,
  Plus,
  Search
} from 'lucide-react'

// Smart Link component with preloading
interface SmartLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  activeClassName?: string
  preloadOnHover?: boolean
  preloadDelay?: number
}

export const SmartLink = ({ 
  href, 
  children, 
  className, 
  activeClassName,
  preloadOnHover = true,
  preloadDelay = 100
}: SmartLinkProps) => {
  const pathname = usePathname()
  const linkPreloading = useLinkPreloading()
  const [isHovered, setIsHovered] = useState(false)
  
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
  
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (preloadOnHover) {
      setTimeou"" => {
        linkPreloading.onMouseEnter(href)
      }, preloadDelay)
    }
  }
  
  const handleMouseLeave = () => {
    setIsHovered(false)
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
    >
      {children}
    </Link>
  )
}

// Smart Button component with modal preloading
interface SmartButtonProps {
  children: React.ReactNode
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
  const { preloadModalOnHover } = useButtonPreloading()
  
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
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    preloadTargets: ['/orders', '/finance', '/inventory']
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
    preloadTargets: ['/orders', '/finance']
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    preloadTargets: ['/ingredients', '/orders']
  },
  {
    title: 'Ingredients', 
    href: '/ingredients',
    icon: Utensils,
    preloadTargets: ['/inventory', '/resep']
  },
  {
    title: 'Recipes',
    href: '/resep',
    icon: BarChart3,
    preloadTargets: ['/ingredients', '/hpp']
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: DollarSign,
    preloadTargets: ['/orders', '/dashboard']
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    preloadTargets: ['/dashboard']
  }
]

// Smart Sidebar Navigation
export const SmartSidebar = () => {
  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <SmartLink
          key={item.href}
          href={item.href}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          activeClassName="bg-accent text-accent-foreground"
          preloadDelay={50} // Fast preload for sidebar
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
        </SmartLink>
      ))}
    </nav>
  )
}

// Smart Mobile Bottom Navigation
export const SmartBottomNav = () => {
  const mainItems = navigationItems.slice(0, 5) // First 5 items for mobile
  
  return (
    <nav className="flex justify-around items-center py-2 bg-background border-t">
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
    </nav>
  )
}

// Smart Action Buttons (for forms, modals, etc)
export const SmartActionButton = ({ 
  action, 
  children, 
  ...props 
}: { 
  action: 'add-order' | 'add-customer' | 'add-ingredient' | 'add-recipe' | 'add-finance'
  children: React.ReactNode 
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
  const { preloadTableOnHover } = useButtonPreloading()
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onMouseEnter={() => preloadTableOnHover()}
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

export const SmartBreadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <React.Fragment key={index}>
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
        </React.Fragment>
      ))}
    </nav>
  )
}

// Quick Actions Panel with Smart Buttons
export const SmartQuickActions = () => {
  return (
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
}
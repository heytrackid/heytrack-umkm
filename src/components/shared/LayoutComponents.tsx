'use client'

import * as React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
  Settings,
  User,
  Bell,
  Search,
  Filter,
  Grid,
  List,
  Table,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

interface PageLayoutProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

interface ContentGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

interface CardGridProps {
  children: React.ReactNode
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

interface SectionProps {
  title?: string
  subtitle?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'card' | 'bordered'
}

interface DataViewProps {
  title?: string
  viewMode?: 'grid' | 'list' | 'table'
  onViewModeChange?: (mode: 'grid' | 'list' | 'table') => void
  filterComponent?: React.ReactNode
  searchComponent?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  loading?: boolean
  emptyState?: React.ReactNode
  className?: string
}

/**
 * Shared Page Header Component
 */
export function PageHeader({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <PrefetchLink href={item.href} className="flex items-center gap-1">
                        {item.icon}
                        {item.label}
                      </PrefetchLink>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {item.icon}
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Shared Page Layout Component
 */
export function PageLayout({
  header,
  sidebar,
  footer,
  children,
  className = "",
  maxWidth = 'full'
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {header && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            {header}
          </div>
        </header>
      )}

      <div className="flex">
        {sidebar && (
          <aside className="hidden lg:block w-64 border-r bg-muted/10">
            <div className="p-4">
              {sidebar}
            </div>
          </aside>
        )}

        <main className="flex-1">
          <div className={cn("container mx-auto px-4 py-6", maxWidthClasses[maxWidth])}>
            {children}
          </div>
        </main>
      </div>

      {footer && (
        <footer className="border-t bg-muted/10 mt-auto">
          <div className="container mx-auto px-4 py-4">
            {footer}
          </div>
        </footer>
      )}
    </div>
  )
}

/**
 * Content Grid Layout Component
 */
export function ContentGrid({
  children,
  columns = 1,
  gap = 'md',
  className = ""
}: ContentGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  return (
    <div className={cn(
      "grid",
      `grid-cols-${columns}`,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Card Grid Layout Component
 */
export function CardGrid({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = ""
}: CardGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }

  const gridClasses = [
    `grid-cols-${columns.default}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ].filter(Boolean)

  return (
    <div className={cn(
      "grid",
      gridClasses,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Section Component with Header
 */
export function Section({
  title,
  subtitle,
  description,
  actions,
  children,
  className = "",
  variant = 'default'
}: SectionProps) {
  const variantClasses = {
    default: '',
    card: 'bg-card border rounded-lg p-6',
    bordered: 'border rounded-lg p-6'
  }

  return (
    <section className={cn("space-y-4", variantClasses[variant], className)}>
      {(title || subtitle || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {title && <Separator />}

      <div>
        {children}
      </div>
    </section>
  )
}

/**
 * Data View Component with View Mode Toggle
 */
export function DataView({
  title,
  viewMode = 'grid',
  onViewModeChange,
  filterComponent,
  searchComponent,
  actions,
  children,
  loading = false,
  emptyState,
  className = ""
}: DataViewProps) {
  const viewModeOptions = [
    { value: 'grid', icon: Grid, label: 'Grid' },
    { value: 'list', icon: List, label: 'List' },
    { value: 'table', icon: Table, label: 'Table' },
  ] as const

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title || searchComponent || filterComponent || actions) && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold">
                {title}
              </h3>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {searchComponent && (
              <div className="flex-1 min-w-64">
                {searchComponent}
              </div>
            )}

            {filterComponent && (
              <div className="flex items-center gap-2">
                {filterComponent}
              </div>
            )}

            {onViewModeChange && (
              <div className="flex items-center border rounded-md">
                {viewModeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.value}
                      variant={viewMode === option.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onViewModeChange(option.value)}
                      className="rounded-none first:rounded-l-md last:rounded-r-md"
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  )
                })}
              </div>
            )}

            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : children ? (
          children
        ) : (
          emptyState || (
            <div className="text-center py-12 text-muted-foreground">
              No data available
            </div>
          )
        )}
      </div>
    </div>
  )
}

/**
 * Responsive Container Component
 */
interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
}

export function Container({
  children,
  size = 'lg',
  padding = 'md',
  className = ""
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  }

  return (
    <div className={cn(
      "mx-auto w-full",
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

/**
 * Sidebar Navigation Component
 */
interface SidebarItem {
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: string | number
  children?: SidebarItem[]
}

interface SidebarProps {
  items: SidebarItem[]
  currentPath?: string
  onItemClick?: (item: SidebarItem) => void
  className?: string
}

export function Sidebar({
  items,
  currentPath,
  onItemClick,
  className = ""
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const renderItem = (item: SidebarItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.label)
    const isActive = currentPath === item.href

    return (
      <div key={item.label}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.label)
            } else if (item.href) {
              // Handle navigation
            } else if (onItemClick) {
              onItemClick(item)
            }
          }}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent",
            depth > 0 && "ml-4"
          )}
        >
          {item.icon && <span className="w-4 h-4">{item.icon}</span>}
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronRight
              className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={cn("space-y-1", className)}>
      {items.map(item => renderItem(item))}
    </nav>
  )
}

/**
 * Mobile Navigation Component
 */
interface MobileNavProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  className?: string
}

export function MobileNav({
  children,
  trigger,
  className = ""
}: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className={cn("w-80", className)}>
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full mt-6">
          {children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

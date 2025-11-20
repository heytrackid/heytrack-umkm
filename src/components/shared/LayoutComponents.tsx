'use client'

import {
  Menu,
  Grid,
  List,
  Table,
} from '@/components/icons'
import { Fragment, useState, type ReactNode } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/ui/loading-state'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface LayoutBreadcrumbItem {
  label: string
  href?: string
  icon?: ReactNode
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: LayoutBreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

interface PageLayoutProps {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
  maxWidth?: 'full' | 'lg' | 'md' | 'sm' | 'xl'
}

interface ContentGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'lg' | 'md' | 'sm' | 'xl'
  className?: string
}

interface CardGridProps {
  children: ReactNode
  columns?: {
    default: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'lg' | 'md' | 'sm'
  className?: string
}

interface SectionProps {
  title?: string
  subtitle?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  variant?: 'bordered' | 'card' | 'default'
}

interface DataViewProps {
  title?: string
  viewMode?: 'grid' | 'list' | 'table'
  onViewModeChange?: (mode: 'grid' | 'list' | 'table') => void
  filterComponent?: ReactNode
  searchComponent?: ReactNode
  actions?: ReactNode
  children: ReactNode
  loading?: boolean
  emptyState?: ReactNode
  className?: string
}

/**
 * Shared Page Header Component
 */
export const PageHeader = ({
  title,
  subtitle,
  description,
  breadcrumbs,
  actions,
  className = ""
}: PageHeaderProps) => (
  <div className={cn("space-y-4", className)}>
    {/* Breadcrumbs */}
    {breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={index}>
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
            </Fragment>
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

/**
 * Shared Page Layout Component
 */
export const PageLayout = ({
  header,
  footer,
  children,
  className = "",
  maxWidth = 'full'
}: PageLayoutProps) => {
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

      <main className="flex-1">
        <div className={cn("container mx-auto px-4 py-6", maxWidthClasses[maxWidth])}>
          {children}
        </div>
      </main>

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
export const ContentGrid = ({
  children,
  columns = 1,
  gap = 'md',
  className = ""
}: ContentGridProps) => {
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
export const CardGrid = ({
  children,
  columns = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
  className = ""
}: CardGridProps) => {
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
export const Section = ({
  title,
  subtitle,
  description,
  actions,
  children,
  className = "",
  variant = 'default'
}: SectionProps) => {
  const variantClasses = {
    default: '',
    card: 'bg-card border rounded-lg p-6',
    bordered: 'border rounded-lg p-6'
  }

  return (
    <section className={cn("space-y-4", variantClasses[variant], className)}>
      {(title ?? subtitle ?? description ?? actions) && (
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
export const DataView = ({
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
}: DataViewProps) => {
  const viewModeOptions = [
    { value: 'grid', icon: Grid, label: 'Grid' },
    { value: 'list', icon: List, label: 'List' },
    { value: 'table', icon: Table, label: 'Table' },
  ] as const

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {(title ?? searchComponent ?? filterComponent ?? actions) && (
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
          <LoadingState size="md" />
        ) : (children ?? emptyState ?? (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data tersedia
            </div>
          ))
        }
      </div>
    </div>
  )
}

/**
 * Responsive Container Component
 */
interface ContainerProps {
  children: ReactNode
  size?: 'full' | 'lg' | 'md' | 'sm' | 'xl'
  padding?: 'lg' | 'md' | 'none' | 'sm'
  className?: string
}

export const Container = ({
  children,
  size = 'lg',
  padding = 'md',
  className = ""
}: ContainerProps) => {
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
 * Mobile Navigation Component
 */
interface MobileNavProps {
  children: ReactNode
  trigger?: ReactNode
  className?: string
}

export const MobileNav = ({
  children,
  trigger,
  className = ""
}: MobileNavProps) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
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

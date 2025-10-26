/**
 * Shared Layout Components
 * Reusable layout patterns to reduce duplicate code
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageLayoutProps {
  title: string
  description?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  backHref?: string
}

/**
 * Standard page layout with header, breadcrumb, and content
 */
export function PageLayout({
  title,
  description,
  breadcrumb,
  actions,
  children,
  backHref
}: PageLayoutProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {breadcrumb}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backHref && (
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

interface DataGridProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'cards' | 'list'
}

/**
 * Responsive data grid layouts
 */
export function DataGrid({ children, className, variant = 'default' }: DataGridProps) {
  const gridClasses = {
    default: "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
    cards: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    list: "space-y-4"
  }

  return (
    <div className={`${gridClasses[variant]} ${className || ''}`}>
      {children}
    </div>
  )
}

interface ContentCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
  noPadding?: boolean
}

/**
 * Standardized content card with optional header
 */
export function ContentCard({
  title,
  description,
  children,
  className,
  headerActions,
  noPadding = false
}: ContentCardProps) {
  return (
    <Card className={className}>
      {(title || headerActions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={noPadding ? 'p-0' : ''}>
        {children}
      </CardContent>
    </Card>
  )
}

interface PageActionsProps {
  onAdd?: () => void
  addText?: string
  addIcon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
}

/**
 * Standardized page action buttons
 */
export function PageActions({
  onAdd,
  addText = "Tambah",
  addIcon: Icon = Plus,
  children
}: PageActionsProps) {
  return (
    <div className="flex gap-2">
      {onAdd && (
        <Button onClick={onAdd}>
          <Icon className="h-4 w-4 mr-2" />
          {addText}
        </Button>
      )}
      {children}
    </div>
  )
}

// Import React for types
import * as React from 'react'

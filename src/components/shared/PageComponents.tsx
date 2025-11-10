'use client'

import {
    AlertCircle,
    ArrowLeft,
    Edit,
    Eye,
    Plus,
    RefreshCw,
    Trash2
} from 'lucide-react'
import { Fragment, type ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { getStatusColor, getStatusText } from '@/lib/shared/utilities'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

interface StatsCard {
  title: string
  value: number | string
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
}

interface StatsCardsProps {
  stats: StatsCard[]
  className?: string
}

interface ErrorCardProps {
  error: Error | string
  onRetry?: () => void
  className?: string
}

interface DetailViewProps {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  onBack?: () => void
  actions?: ReactNode
  children: ReactNode
  className?: string
}

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onRefresh?: () => void
  onAdd?: () => void
  addLabel?: string
  viewLabel?: string
  editLabel?: string
  deleteLabel?: string
  refreshLabel?: string
  className?: string
  size?: 'lg' | 'md' | 'sm'
  variant?: 'dropdown' | 'horizontal' | 'vertical'
}

/**
 * Shared Page Header Component
 */
export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className = ""
}: PageHeaderProps) => (
  <div className={`space-y-6 ${className}`}>
    {/* Breadcrumbs */}
    {breadcrumbs && breadcrumbs.length > 0 && (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <Fragment key={index}>
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <PrefetchLink href={item.href}>
                      {item.label}
                    </PrefetchLink>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )}

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
  </div>
)

/**
 * Shared Stats Cards Component
 */
export const SharedStatsCards = ({
  stats,
  className = ""
}: StatsCardsProps) => (
  <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
    {stats.map((stat, index) => (
      <Card key={index}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl font-bold">
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
            </div>
            {stat.icon && (
              <div className="h-8 w-8 text-muted-foreground">
                {stat.icon}
              </div>
            )}
          </div>
          {stat.trend && (
            <div className="mt-4 flex items-center text-xs">
              <span
                className={`font-medium ${stat.trend.isPositive ? 'text-gray-600' : 'text-red-600'
                  }`}
              >
                {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
              </span>
              <span className="text-muted-foreground ml-1">
                {stat.trend.label}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
)

/**
 * Shared Error Card Component
 */
export const ErrorCard = ({
  error,
  onRetry,
  className = ""
}: ErrorCardProps) => {
  const errorMessage = error instanceof Error ? error.message : String(error)

  return (
    <Card className={`border-red-200 bg-red-50 dark:bg-red-950/10 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 dark:text-red-200 font-medium">
              Error
            </p>
            <p className="text-red-700 dark:text-red-300 text-sm mt-1">
              {errorMessage}
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Shared Detail View Component
 */
export const DetailView = ({
  title,
  subtitle,
  backHref,
  backLabel = "Kembali",
  onBack,
  actions,
  children,
  className = ""
}: DetailViewProps) => {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      window.history.back()
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  )
}

/**
 * Shared Action Buttons Component
 */
export const ActionButtons = ({
  onView,
  onEdit,
  onDelete,
  onRefresh,
  onAdd,
  addLabel = "Tambah",
  viewLabel = "Lihat",
  editLabel = "Edit",
  deleteLabel = "Hapus",
  refreshLabel = "Refresh",
  className = "",
  size = "sm",
  variant = "horizontal"
}: ActionButtonsProps) => {
  let buttonSize: 'default' | 'lg' | 'sm'
  let iconSize: string

  switch (size) {
    case 'sm':
      buttonSize = 'sm'
      iconSize = 'h-4 w-4'
      break
    case 'lg':
      buttonSize = 'lg'
      iconSize = 'h-5 w-5'
      break
    case 'md':
      buttonSize = 'default'
      iconSize = 'h-4 w-4'
      break
    default:
      buttonSize = 'default'
      iconSize = 'h-4 w-4'
  }

  if (variant === 'dropdown') {
    // Dropdown variant - implement later if needed
    return null
  }

  return (
    <div className={`flex gap-2 ${variant === 'vertical' ? 'flex-col' : ''} ${className}`}>
      {onRefresh && (
        <Button variant="outline" size={buttonSize} onClick={onRefresh}>
          <RefreshCw className={`${iconSize} mr-2`} />
          {refreshLabel}
        </Button>
      )}
      {onAdd && (
        <Button size={buttonSize} onClick={onAdd}>
          <Plus className={`${iconSize} mr-2`} />
          {addLabel}
        </Button>
      )}
      {onView && (
        <Button variant="outline" size={buttonSize} onClick={onView}>
          <Eye className={`${iconSize} mr-2`} />
          {viewLabel}
        </Button>
      )}
      {onEdit && (
        <Button variant="outline" size={buttonSize} onClick={onEdit}>
          <Edit className={`${iconSize} mr-2`} />
          {editLabel}
        </Button>
      )}
      {onDelete && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className={`${iconSize} mr-2`} />
          {deleteLabel}
        </Button>
      )}
    </div>
  )
}

/**
 * Status Badge Component
 */
interface StatusBadgeProps {
  status: string
  variant?: 'filled' | 'outline'
  size?: 'lg' | 'md' | 'sm'
  className?: string
}

export const StatusBadge = ({
  status,
  variant = 'filled',
  size = 'md',
  className = ""
}: StatusBadgeProps) => {
  const colorClass = getStatusColor(status)
  const text = getStatusText(status)

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  if (variant === 'outline') {
    return (
      <Badge
        variant="outline"
        className={`${colorClass} ${sizeClasses[size]} ${className}`}
      >
        {text}
      </Badge>
    )
  }

  return (
    <Badge className={`${colorClass} ${sizeClasses[size]} ${className}`}>
      {text}
    </Badge>
  )
}

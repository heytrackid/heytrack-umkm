import type { ComponentType, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * Shared Page Patterns
 * Common page layout patterns used across the application
 */


interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  actions?: ReactNode
}

/**
 * Standard page header with back button, title, description, and actions
 */
export const PageHeader = ({ title, description, backHref, actions }: PageHeaderProps) => {
  const router = useRouter()

  return (
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
  )
}

interface PageActionsProps {
  onAdd?: () => void
  addText?: string
  addIcon?: ComponentType<{ className?: string }>
  children?: ReactNode
}

/**
 * Standard page action buttons
 */
export const PageActions = ({
  onAdd,
  addText = "Tambah",
  addIcon: Icon = Plus,
  children
}: PageActionsProps) => (
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

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  message: string
  icon?: ComponentType<{ className?: string }>
}

/**
 * Standardized alert banners for pages
 */
export const AlertBanner = ({
  type = 'info',
  title,
  message,
  icon: Icon
}: AlertBannerProps) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }


  const defaultIcons = {
    // eslint-disable-next-line react/no-unstable-nested-components
    info: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    // eslint-disable-next-line react/no-unstable-nested-components
    warning: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    ),
    // eslint-disable-next-line react/no-unstable-nested-components
    error: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    // eslint-disable-next-line react/no-unstable-nested-components
    success: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  const DefaultIcon = Icon ?? defaultIcons[type]

  return (
    <div className={`p-4 border rounded-lg ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <DefaultIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          {title && (
            <h3 className="font-semibold text-sm mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  className?: string
}

/**
 * Standardized loading state component
 */
export const LoadingState = ({
  message = "Memuat...",
  className
}: LoadingStateProps) => (
  <div className={`flex items-center justify-center p-8 ${className ?? ''}`}>
    <div className="flex items-center gap-3">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
      <span className="text-gray-600">{message}</span>
    </div>
  </div>
)

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: ReactNode
  className?: string
}

/**
 * Standardized empty state component
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) => (
  <div className={`text-center p-8 ${className ?? ''}`}>
    {Icon && (
      <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    )}
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-4 max-w-md mx-auto">
      {description}
    </p>
    {action}
  </div>
)

// Import React for types
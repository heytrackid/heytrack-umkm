'use client'

import type { LucideIcon } from '@/components/icons'
import { AlertTriangle, CheckCircle, Info, XCircle } from '@/components/icons'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AlertVariant = 'info' | 'warning' | 'error' | 'success'

export interface AlertBannerProps {
  variant: AlertVariant
  title: string
  message: string | ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  icon?: LucideIcon
  className?: string
}

const variantConfig = {
  info: {
    container: 'border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300/90',
    button: 'bg-white/50 border-blue-200 hover:bg-white text-blue-700',
    defaultIcon: Info
  },
  warning: {
    container: 'border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-900/30',
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'text-orange-600 dark:text-orange-400',
    title: 'text-orange-900 dark:text-orange-200',
    message: 'text-orange-700 dark:text-orange-300/90',
    button: 'bg-white/50 border-orange-200 hover:bg-white text-orange-700',
    defaultIcon: AlertTriangle
  },
  error: {
    container: 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300/90',
    button: 'bg-white/50 border-red-200 hover:bg-white text-red-700',
    defaultIcon: XCircle
  },
  success: {
    container: 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-900/30',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-200',
    message: 'text-green-700 dark:text-green-300/90',
    button: 'bg-white/50 border-green-200 hover:bg-white text-green-700',
    defaultIcon: CheckCircle
  }
} as const

export const AlertBanner = ({
  variant,
  title,
  message,
  action,
  icon,
  className
}: AlertBannerProps): JSX.Element => {
  const config = variantConfig[variant]
  const Icon = icon ?? config.defaultIcon

  return (
    <div className={cn('rounded-xl border p-4', config.container, className)}>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className={cn('p-2 rounded-lg shrink-0', config.iconBg)}>
          <Icon className={cn('w-5 h-5', config.icon)} />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <h3 className={cn('font-semibold text-sm', config.title)}>{title}</h3>
          <div className={cn('text-sm leading-relaxed', config.message)}>
            {message}
          </div>
        </div>
        {action && (
          <Button
            size="sm"
            variant="outline"
            className={cn('shrink-0 w-full sm:w-auto', config.button)}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

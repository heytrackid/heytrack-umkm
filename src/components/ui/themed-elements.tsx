/**
 * Themed UI Elements
 * 
 * Pre-styled components yang menggunakan CSS variables untuk theming konsisten.
 * Gunakan components ini untuk memastikan styling yang konsisten di seluruh aplikasi.
 */

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ThemedCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

/**
 * Card dengan theming otomatis
 * Menggunakan bg-card, text-card-foreground, dan border-border
 */
export const ThemedCard = ({ children, className, hover = false }: ThemedCardProps) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground border border-border rounded-lg',
        hover && 'transition-colors hover:border-prominent',
        className
      )}
    >
      {children}
    </div>
  )
}

interface ThemedBadgeProps {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

/**
 * Badge dengan theming otomatis
 */
export const ThemedBadge = ({ children, variant = 'default', className }: ThemedBadgeProps) => {
  const variantClasses = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-destructive/10 text-destructive',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface ThemedSectionProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

/**
 * Section dengan header dan theming otomatis
 */
export const ThemedSection = ({ children, title, description, className }: ThemedSectionProps) => {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

interface ThemedDividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Divider dengan theming otomatis
 */
export const ThemedDivider = ({ className, orientation = 'horizontal' }: ThemedDividerProps) => {
  return (
    <div
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
    />
  )
}

interface ThemedAlertProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

/**
 * Alert dengan theming otomatis
 */
export const ThemedAlert = ({ children, variant = 'default', className }: ThemedAlertProps) => {
  const variantClasses = {
    default: 'bg-muted text-foreground border-border',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900',
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  )
}

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

/**
 * Input dengan theming otomatis
 */
export const ThemedInput = ({ error, className, ...props }: ThemedInputProps) => {
  return (
    <input
      className={cn(
        'w-full rounded-md border bg-input px-3 py-2 text-foreground',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive focus:ring-destructive' : 'border-border',
        className
      )}
      {...props}
    />
  )
}

interface ThemedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

/**
 * Textarea dengan theming otomatis
 */
export const ThemedTextarea = ({ error, className, ...props }: ThemedTextareaProps) => {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border bg-input px-3 py-2 text-foreground',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'min-h-[80px] resize-y',
        error ? 'border-destructive focus:ring-destructive' : 'border-border',
        className
      )}
      {...props}
    />
  )
}

interface ThemedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

/**
 * Select dengan theming otomatis
 */
export const ThemedSelect = ({ error, className, children, ...props }: ThemedSelectProps) => {
  return (
    <select
      className={cn(
        'w-full rounded-md border bg-input px-3 py-2 text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-destructive focus:ring-destructive' : 'border-border',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

interface ThemedLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

/**
 * Label dengan theming otomatis
 */
export const ThemedLabel = ({ required, className, children, ...props }: ThemedLabelProps) => {
  return (
    <label
      className={cn('block text-sm font-medium text-foreground mb-1.5', className)}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  )
}

interface ThemedHelperTextProps {
  children: ReactNode
  error?: boolean
  className?: string
}

/**
 * Helper text untuk form fields
 */
export const ThemedHelperText = ({ children, error, className }: ThemedHelperTextProps) => {
  return (
    <p
      className={cn(
        'mt-1.5 text-sm',
        error ? 'text-destructive' : 'text-muted-foreground',
        className
      )}
    >
      {children}
    </p>
  )
}

interface ThemedSkeletonProps {
  className?: string
}

/**
 * Skeleton loader dengan theming otomatis
 */
export const ThemedSkeleton = ({ className }: ThemedSkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  )
}

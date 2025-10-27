import type { ReactNode } from 'react'
/**
 * Shared Data Grid Layouts
 * Reusable grid layout components for consistent data display
 */

interface DataGridLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Standard responsive data grid for stats cards
 */
export const StatsGrid = ({ children, className }: DataGridLayoutProps) => (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className || ''}`}>
      {children}
    </div>
  )

/**
 * Grid for dashboard cards (3 columns on large screens)
 */
export const DashboardGrid = ({ children, className }: DataGridLayoutProps) => (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 ${className || ''}`}>
      {children}
    </div>
  )

/**
 * Grid for form fields (2 columns on medium screens)
 */
export const FormGrid = ({ children, className }: DataGridLayoutProps) => (
    <div className={`grid gap-4 md:grid-cols-2 ${className || ''}`}>
      {children}
    </div>
  )

/**
 * Single column layout (full width)
 */
export const SingleColumn = ({ children, className }: DataGridLayoutProps) => (
    <div className={`space-y-4 ${className || ''}`}>
      {children}
    </div>
  )

/**
 * Sidebar and content layout
 */
interface SidebarContentLayoutProps {
  sidebar: ReactNode
  content: ReactNode
  sidebarClassName?: string
  contentClassName?: string
  className?: string
}

export const SidebarContentLayout = ({
  sidebar,
  content,
  sidebarClassName,
  contentClassName,
  className
}: SidebarContentLayoutProps) => (
    <div className={`grid gap-6 lg:grid-cols-4 ${className || ''}`}>
      <div className={`lg:col-span-1 ${sidebarClassName || ''}`}>
        {sidebar}
      </div>
      <div className={`lg:col-span-3 ${contentClassName || ''}`}>
        {content}
      </div>
    </div>
  )

// Import React for types
import type React from 'react'
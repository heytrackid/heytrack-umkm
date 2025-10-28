'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { NavigationItem } from './useSidebarLogic'

interface SidebarItemProps {
  item: NavigationItem
  isActive: boolean
  onMouseEnter?: () => void
  variant?: 'default' | 'mobile'
}

const SidebarItem = ({
  item,
  isActive,
  onMouseEnter,
  variant = 'default'
}: SidebarItemProps) => {
  // Use consistent className for both variants to avoid hydration mismatch
  const baseClasses = cn(
    "group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg",
    "transition-colors",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )

  return (
    <Link
      href={item.href || '#'}
      onMouseEnter={onMouseEnter}
      className={baseClasses}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span className="font-medium truncate flex-1">{item.name}</span>

      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-secondary text-secondary-foreground flex-shrink-0">
          {item.badge}
        </span>
      )}
    </Link>
  )
}


export default SidebarItem

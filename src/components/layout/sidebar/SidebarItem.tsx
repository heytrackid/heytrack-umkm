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
  if (variant === 'mobile') {
    return (
      <Link
        href={item.href || '#'}
        onMouseEnter={onMouseEnter}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium truncate">{item.name}</span>
        {item.badge && (
          <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-secondary text-secondary-foreground ml-auto">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors relative",
        isActive
          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-900 dark:bg-white rounded-r" />
      )}

      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="font-medium truncate flex-1">{item.name}</span>

      {item.badge && (
        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {item.badge}
        </span>
      )}
    </Link>
  )
}


export default SidebarItem

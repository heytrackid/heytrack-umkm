'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import * as React from 'react'
import type { NavigationItem } from './useSidebarLogic'

interface SidebarItemProps {
  item: NavigationItem
  isActive: boolean
  onMouseEnter?: () => void
  variant?: 'default' | 'mobile'
}

function SidebarItem({
  item,
  isActive,
  onMouseEnter,
  variant = 'default'
}: SidebarItemProps) {
  if (variant === 'mobile') {
    return (
      <Link
        href={item.href || '#'}
        onMouseEnter={onMouseEnter}
        className={cn(
          "group flex items-start px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
          "hover:scale-[1.02]",
          isActive
            ? "bg-primary/10 text-primary border border-primary/20"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <div className="flex items-center justify-center mr-3 mt-0.5">
          <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{item.name}</span>

            {/* Badges */}
            <div className="flex items-center gap-1 ml-2">
              {item.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                  {item.badge}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="w-1 bg-primary rounded-full self-stretch ml-2" />
        )}
      </Link>
    )
  }

  return (
    <Link
      href={item.href || '#'}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group flex items-start px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
        "hover:scale-[1.02]",
        isActive
          ? "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
      )}
    >
      <div className="flex items-center justify-center mr-3 mt-0.5">
        <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium truncate flex-1">{item.name}</span>

          {/* Badges */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {item.badge && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {item.badge}
              </span>
            )}
            {item.isSimple && !item.badge && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full font-medium whitespace-nowrap">
                SIMPLE
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed break-words">
            {item.description}
          </p>
        )}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="w-1 bg-gray-700 dark:bg-gray-300 rounded-full self-stretch ml-2" />
      )}
    </Link>
  )
}


export default SidebarItem

'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'
import SidebarItem from './SidebarItem'
import { NavigationSection } from './useSidebarLogic'

interface SidebarSectionProps {
  section: NavigationSection
  isItemActive: (item: any) => boolean
  onItemMouseEnter?: (href: string) => void
  variant?: 'default' | 'mobile'
  isCollapsed?: boolean
  onToggle?: () => void
}

function SidebarSection({
  section,
  isItemActive,
  onItemMouseEnter,
  variant = 'default',
  isCollapsed = false,
  onToggle
}: SidebarSectionProps) {
  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        {/* Section Title */}
        <div
          className={cn(
            "px-3 py-2 rounded-lg",
            section.isWorkflow
              ? "bg-muted/50 border border-border"
              : "",
            section.isCollapsible && "cursor-pointer hover:bg-muted/70 transition-colors select-none"
          )}
          onClick={(e) => {
            if (section.isCollapsible && onToggle) {
              e.preventDefault()
              e.stopPropagation()
              onToggle()
            }
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                section.isWorkflow
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}>
                {section.title}
              </h3>
              {section.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {section.description}
                </p>
              )}
            </div>
            {section.isCollapsible && (
              <div className={cn(
                "ml-2 text-muted-foreground transition-transform duration-300",
                !isCollapsed && "rotate-180"
              )}>
                <ChevronDown className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Section Items */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
          )}
        >
          <div className="space-y-1 pt-1">
            {Array.isArray(section.items) && section.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={isItemActive(item)}
                onMouseEnter={() => onItemMouseEnter?.(item.href)}
                variant="mobile"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Section Title */}
      <div
        className={cn(
          "px-3 py-2 rounded-lg",
          section.isWorkflow
            ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            : "",
          section.isCollapsible && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors select-none"
        )}
        onClick={(e) => {
          if (section.isCollapsible && onToggle) {
            e.preventDefault()
            e.stopPropagation()
            onToggle()
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className={cn(
              "text-xs font-semibold uppercase tracking-wider",
              section.isWorkflow
                ? "text-gray-700 dark:text-gray-300"
                : "text-gray-400 dark:text-gray-500"
            )}>
              {section.title}
            </h3>
            {section.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {section.description}
              </p>
            )}
          </div>
          {section.isCollapsible && (
            <div className={cn(
              "ml-2 text-gray-400 dark:text-gray-500 transition-transform duration-300",
              !isCollapsed && "rotate-180"
            )}>
              <ChevronDown className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      {/* Section Items */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        )}
      >
        <div className="space-y-1 pt-1">
          {Array.isArray(section.items) && section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              isActive={isItemActive(item)}
              onMouseEnter={() => onItemMouseEnter?.(item.href)}
              variant="default"
            />
          ))}
        </div>
      </div>
    </div>
  )
}


export default SidebarSection

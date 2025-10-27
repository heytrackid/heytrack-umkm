'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import SidebarItem from './SidebarItem'
import type { NavigationSection } from './useSidebarLogic'

interface SidebarSectionProps {
  section: NavigationSection
  isItemActive: (item: any) => boolean
  onItemMouseEnter?: (href: string) => void
  variant?: 'default' | 'mobile'
  isCollapsed?: boolean
  onToggle?: () => void
}

const SidebarSection = ({
  section,
  isItemActive,
  onItemMouseEnter,
  variant = 'default',
  isCollapsed = false,
  onToggle
}: SidebarSectionProps) => {
  if (variant === 'mobile') {
    return (
      <div className="space-y-1">
        {/* Section Title */}
        <div
          className={cn(
            "px-3 py-1.5 flex items-center justify-between",
            section.isCollapsible && "cursor-pointer hover:text-foreground transition-colors select-none"
          )}
          onClick={(e) => {
            if (section.isCollapsible && onToggle) {
              e.preventDefault()
              e.stopPropagation()
              onToggle()
            }
          }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {section.title}
          </h3>
          {section.isCollapsible && (
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              !isCollapsed && "rotate-180"
            )} />
          )}
        </div>

        {/* Section Items */}
        <div
          className={cn(
            "space-y-0.5 overflow-hidden transition-all duration-200",
            isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
          )}
        >
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
    )
  }

  return (
    <div className="space-y-1">
      {/* Section Title */}
      <div
        className={cn(
          "px-3 py-1.5 flex items-center justify-between",
          section.isCollapsible && "cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors select-none"
        )}
        onClick={(e) => {
          if (section.isCollapsible && onToggle) {
            e.preventDefault()
            e.stopPropagation()
            onToggle()
          }
        }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {section.title}
        </h3>
        {section.isCollapsible && (
          <ChevronDown className={cn(
            "h-3.5 w-3.5 text-gray-400 transition-transform duration-200",
            !isCollapsed && "rotate-180"
          )} />
        )}
      </div>

      {/* Section Items */}
      <div
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-200",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"
        )}
      >
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
  )
}


export default SidebarSection

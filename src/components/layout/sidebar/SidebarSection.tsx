'use client'

import { cn } from '@/lib/utils'
import { NavigationSection } from './useSidebarLogic'
import SidebarItem from './SidebarItem'

interface SidebarSectionProps {
  section: NavigationSection
  isItemActive: (item: any) => boolean
  onItemMouseEnter?: (href: string) => void
  variant?: 'default' | 'mobile'
}

export default function SidebarSection({ 
  section, 
  isItemActive, 
  onItemMouseEnter,
  variant = 'default' 
}: SidebarSectionProps) {
  if (variant === 'mobile') {
    return (
      <div className="space-y-2">
        {/* Section Title */}
        <div className={cn(
          "px-3 py-2 rounded-lg",
          section.isWorkflow 
            ? "bg-muted/50 border border-border" 
            : ""
        )}>
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
        
        {/* Section Items */}
        <div className="space-y-1">
          {section.items.map((item) => (
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
    <div className="space-y-2">
      {/* Section Title */}
      <div className={cn(
        "px-3 py-2 rounded-lg",
        section.isWorkflow 
          ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700" 
          : ""
      )}>
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
      
      {/* Section Items */}
      <div className="space-y-1">
        {section.items.map((item) => (
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

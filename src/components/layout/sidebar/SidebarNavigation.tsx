'use client'

import SidebarSection from './SidebarSection'
import type { NavigationSection } from './useSidebarLogic'

interface SidebarNavigationProps {
  sections: NavigationSection[]
  isItemActive: (item: any) => boolean
  onItemMouseEnter?: (href: string) => void
  variant?: 'default' | 'mobile'
  isSectionCollapsed: (sectionTitle: string) => boolean
  onToggleSection: (sectionTitle: string) => void
}

const SidebarNavigation = ({
  sections,
  isItemActive,
  onItemMouseEnter,
  variant = 'default',
  isSectionCollapsed,
  onToggleSection
}: SidebarNavigationProps) => {
  const spacingClass = variant === 'mobile' ? 'space-y-5' : 'space-y-5'
  const paddingClass = variant === 'mobile' ? 'px-3 py-4' : 'px-3 py-4'

  // Safety check for sections array
  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return (
      <nav className={`flex-1 ${paddingClass} ${spacingClass} overflow-y-auto`}>
        <div className="text-sm text-muted-foreground">Loading navigation...</div>
      </nav>
    )
  }

  return (
    <nav className={`flex-1 ${paddingClass} ${spacingClass} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700`}>
      {sections.map((section) => (
        <SidebarSection
          key={section.title}
          section={section}
          isItemActive={isItemActive}
          onItemMouseEnter={onItemMouseEnter}
          variant={variant}
          isCollapsed={section.isCollapsible ? isSectionCollapsed(section.title) : false}
          onToggle={() => onToggleSection(section.title)}
        />
      ))}
    </nav>
  )
}


export default SidebarNavigation

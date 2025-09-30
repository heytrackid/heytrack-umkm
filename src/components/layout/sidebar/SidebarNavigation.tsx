'use client'

import { NavigationSection } from './useSidebarLogic'
import SidebarSection from './SidebarSection'

interface SidebarNavigationProps {
  sections: NavigationSection[]
  isItemActive: (item: any) => boolean
  onItemMouseEnter?: (href: string) => void
  variant?: 'default' | 'mobile'
}

export default function SidebarNavigation({ 
  sections, 
  isItemActive, 
  onItemMouseEnter,
  variant = 'default' 
}: SidebarNavigationProps) {
  const spacingClass = variant === 'mobile' ? 'space-y-4' : 'space-y-4 lg:space-y-6'
  const paddingClass = variant === 'mobile' ? 'px-4 py-4' : 'px-3 lg:px-4 py-4'

  return (
    <nav className={`flex-1 ${paddingClass} ${spacingClass} overflow-y-auto`}>
      {sections.map((section) => (
        <SidebarSection
          key={section.title}
          section={section}
          isItemActive={isItemActive}
          onItemMouseEnter={onItemMouseEnter}
          variant={variant}
        />
      ))}
    </nav>
  )
}

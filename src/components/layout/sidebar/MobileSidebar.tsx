'use client'

import { useSidebarLogic } from './useSidebarLogic'
import SidebarHeader from './SidebarHeader'
import SidebarNavigation from './SidebarNavigation'
import SidebarFooter from './SidebarFooter'

export default function MobileSidebar() {
  const { 
    navigationSections, 
    isItemActive, 
    prefetchRoute,
    isSectionCollapsed,
    toggleSection
  } = useSidebarLogic()

  return (
    <div className="h-full flex flex-col bg-background">
      <SidebarHeader variant="mobile" />
      
      <SidebarNavigation 
        sections={navigationSections}
        isItemActive={isItemActive}
        onItemMouseEnter={prefetchRoute}
        variant="mobile"
        isSectionCollapsed={isSectionCollapsed}
        onToggleSection={toggleSection}
      />

      <SidebarFooter variant="mobile" />
    </div>
  )
}

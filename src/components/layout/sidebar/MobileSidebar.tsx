'use client'

import * as React from 'react'
import SidebarFooter from './SidebarFooter'
import SidebarHeader from './SidebarHeader'
import SidebarNavigation from './SidebarNavigation'
import { useSidebarLogic } from './useSidebarLogic'

function MobileSidebar() {
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


export default MobileSidebar

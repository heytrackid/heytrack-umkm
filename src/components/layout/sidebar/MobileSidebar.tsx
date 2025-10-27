'use client'

import SidebarFooter from './SidebarFooter'
import ApplicationSidebarHeader from './ApplicationSidebarHeader'
import SidebarNavigation from './SidebarNavigation'
import { useSidebarLogic } from './useSidebarLogic'

const MobileSidebar = () => {
  const {
    navigationSections,
    isItemActive,
    prefetchRoute,
    isSectionCollapsed,
    toggleSection
  } = useSidebarLogic()

  return (
    <div className="h-full flex flex-col bg-background">
      <ApplicationSidebarHeader variant="mobile" />

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

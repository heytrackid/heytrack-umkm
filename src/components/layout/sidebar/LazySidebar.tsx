'use client'

import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import ApplicationSidebarHeader from './ApplicationSidebarHeader'
import SidebarNavigation from './SidebarNavigation'
import SidebarFooter from './SidebarFooter'
import MobileSidebar from './MobileSidebar'
import { useSidebarLogic } from './useSidebarLogic'

interface LazySidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

export default function LazySidebar({ isOpen, onToggle, isMobile }: LazySidebarProps) {
  const {
    navigationSections,
    isItemActive,
    prefetchRoute,
    isSectionCollapsed,
    toggleSection
  } = useSidebarLogic()

  // If it's mobile mode (used within Sheet), render simplified version
  if (isMobile) {
    return <MobileSidebar />
  }

  return (
    <>
      {/* Mobile overlay with smooth fade */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden",
          "transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onToggle}
      />

      {/* Sidebar with smooth slide animation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col",
        "bg-background",
        "border-r border-border",
        "transform transition-transform duration-300 ease-out",
        "lg:translate-x-0 lg:static lg:inset-0",
        "overflow-hidden",
        // Fixed width for consistency
        "w-80 lg:w-72",
        // Smooth animation
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <ApplicationSidebarHeader
          isMobile={Boolean(isOpen && onToggle)}
          onClose={onToggle}
        />

        {/* Navigation */}
        <SidebarNavigation
          sections={navigationSections}
          isItemActive={isItemActive}
          onItemMouseEnter={prefetchRoute}
          isSectionCollapsed={isSectionCollapsed}
          onToggleSection={toggleSection}
        />

        {/* Footer */}
        <SidebarFooter />
      </aside>

      {/* Mobile toggle button with smooth transitions */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className={cn(
            "fixed top-4 left-4 z-50 lg:hidden",
            "p-3 rounded-lg shadow-lg",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90",
            "transition-all duration-200 ease-out",
            "active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}
    </>
  )
}

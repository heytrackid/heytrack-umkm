'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy imports for sidebar components with webpack magic comments for better HMR
const ApplicationSidebarHeader = dynamic(
  () => import(/* webpackChunkName: "sidebar-header" */ './ApplicationSidebarHeader'),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    )
  }
)

const SidebarNavigation = dynamic(
  () => import(/* webpackChunkName: "sidebar-navigation" */ './SidebarNavigation'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 px-3 lg:px-4 py-4 space-y-6 overflow-y-auto">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32 mx-3" />
            <div className="space-y-1">
              {Array(3).fill(0).map((_, j) => (
                <div key={j} className="px-3 py-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-3/4 ml-8" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
)

const SidebarFooter = dynamic(
  () => import(/* webpackChunkName: "sidebar-footer" */ './SidebarFooter'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <Skeleton className="w-full h-8" />
        <div className="mt-2 text-center">
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      </div>
    )
  }
)

const MobileSidebar = dynamic(
  () => import(/* webpackChunkName: "sidebar-mobile" */ './MobileSidebar'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex flex-col bg-background">
        <div className="h-16 px-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24 mx-3" />
              <div className="space-y-1">
                {Array(2).fill(0).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)

// Hook imports
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
    return (
      <Suspense fallback={<div className="h-full bg-background" />}>
        <MobileSidebar />
      </Suspense>
    )
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
        <Suspense fallback={<div className="h-16 border-b border-border" />}>
          <ApplicationSidebarHeader
            isMobile={Boolean(isOpen && onToggle)}
            onClose={onToggle}
          />
        </Suspense>

        {/* Navigation */}
        <Suspense fallback={<div className="flex-1" />}>
          <SidebarNavigation
            sections={navigationSections}
            isItemActive={isItemActive}
            onItemMouseEnter={prefetchRoute}
            isSectionCollapsed={isSectionCollapsed}
            onToggleSection={toggleSection}
          />
        </Suspense>

        {/* Footer */}
        <Suspense fallback={<div className="flex-shrink-0 h-20 border-t border-border" />}>
          <SidebarFooter />
        </Suspense>
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

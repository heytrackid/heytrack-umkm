'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Lazy imports for sidebar components
const SidebarHeader = dynamic(() => impor"Placeholder", {
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
})

const SidebarNavigation = dynamic(() => impor"Placeholder", {
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
})

const SidebarFooter = dynamic(() => impor"Placeholder", {
  ssr: false,
  loading: () => (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
      <Skeleton className="w-full h-8" />
      <div className="mt-2 text-center">
        <Skeleton className="h-3 w-20 mx-auto" />
      </div>
    </div>
  )
})

const MobileSidebar = dynamic(() => impor"Placeholder", {
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
})

// Hook imports
import { useSidebarLogic } from './useSidebarLogic'

interface LazySidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

export default function LazySidebar({ isOpen, onToggle, isMobile }: LazySidebarProps) {
  const { navigationSections, isItemActive, prefetchRoute } = useSidebarLogic()

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
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col",
        "bg-white dark:bg-black",
        "border-r border-gray-200 dark:border-gray-800",
        "transform transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:inset-0",
        "overflow-hidden",
        // Fixed width for consistency
        "w-80 lg:w-72",
        // Animation
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <Suspense fallback={<div className="h-16 border-b border-gray-200 dark:border-gray-800" />}>
          <SidebarHeader 
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
          />
        </Suspense>
        
        {/* Footer */}
        <Suspense fallback={<div className="flex-shrink-0 h-20 border-t border-gray-200 dark:border-gray-800" />}>
          <SidebarFooter />
        </Suspense>
      </aside>

      {/* Mobile toggle button - Only show if not using mobile header */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className={cn(
            "fixed top-4 left-4 z-50 lg:hidden",
            "p-3 rounded-lg",
            "bg-gray-800 dark:bg-gray-600",
            "text-white",
            "hover:bg-gray-700 dark:hover:bg-gray-500",
            "transition-all duration-200",
            "hover:scale-105"
          )}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      )}
    </>
  )
}

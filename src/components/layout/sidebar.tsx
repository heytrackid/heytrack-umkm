'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Main skeleton for entire sidebar
const SidebarSkeleton = () => (
  <div className="fixed inset-y-0 left-0 z-50 flex flex-col w-80 lg:w-72 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 transform translate-x-0">
    {/* Header skeleton */}
    <div className="h-16 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>

    {/* Navigation skeleton */}
    <div className="flex-1 px-3 lg:px-4 py-4 space-y-6 overflow-y-auto">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40 mt-1" />
          </div>
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

    {/* Footer skeleton */}
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
      <Skeleton className="w-full h-8" />
      <div className="mt-2 text-center">
        <Skeleton className="h-3 w-20 mx-auto" />
      </div>
    </div>
  </div>
)

// Dynamically import the main sidebar component
const LazySidebar = dynamic(() => impor"Placeholder", {
  ssr: false,
  loading: () => <SidebarSkeleton />
})

interface SidebarProps {
  isOpen?: boolean
  onToggle?: () => void
  isMobile?: boolean
}

export default function Sidebar({ isOpen, onToggle, isMobile }: SidebarProps) {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <LazySidebar 
        isOpen={isOpen} 
        onToggle={onToggle} 
        isMobile={isMobile} 
      />
    </Suspense>
  )
}

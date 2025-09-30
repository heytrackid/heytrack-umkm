'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import ExcelExportButton to reduce bundle size
const ExcelExportButton = dynamic(() => impor"Placeholder", {
  ssr: false,
  loading: () => <Skeleton className="w-full h-8" />
})

interface SidebarFooterProps {
  variant?: 'default' | 'mobile'
}

export default function SidebarFooter({ variant = 'default' }: SidebarFooterProps) {
  // Mobile footer is simplified or hidden
  if (variant === 'mobile') {
    return (
      <div className="flex-shrink-0 p-4 border-t border-border">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 HeyTrack
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
      <Suspense fallback={<Skeleton className="w-full h-8" />}>
        <ExcelExportButton 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
        />
      </Suspense>
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 HeyTrack
        </p>
      </div>
    </div>
  )
}

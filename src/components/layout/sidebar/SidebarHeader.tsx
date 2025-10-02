'use client'

import { Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarHeaderProps {
  isMobile?: boolean
  onClose?: () => void
  variant?: 'default' | 'mobile'
}

export default function SidebarHeader({ 
  isMobile = false, 
  onClose,
  variant = 'default' 
}: SidebarHeaderProps) {
  if (variant === 'mobile') {
    return (
      <div className="flex items-center justify-between h-16 px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              HeyTrack
            </h1>
            <p className="text-xs text-muted-foreground">
              UMKM Kuliner HPP
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-800 dark:bg-gray-600 rounded-lg flex items-center justify-center">
          <Package className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            HeyTrack
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            UMKM Kuliner HPP
          </p>
        </div>
      </div>
      
      {/* Mobile close button */}
      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

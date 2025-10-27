'use client'

import { Package, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApplicationSidebarHeaderProps {
  isMobile?: boolean
  onClose?: () => void
  variant?: 'default' | 'mobile'
}

const ApplicationSidebarHeader = ({
  isMobile = false,
  onClose,
  variant = 'default'
}: ApplicationSidebarHeaderProps) => {
  const showCloseButton = (variant === 'mobile' || isMobile) && onClose

  return (
    <div className={cn(
      "flex items-center justify-between h-16 border-b border-border flex-shrink-0",
      variant === 'mobile' ? "px-4" : "px-4 lg:px-6"
    )}>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-colors">
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

      {/* Close button for mobile */}
      {showCloseButton && (
        <button
          onClick={onClose}
          className={cn(
            "p-2 rounded-md transition-all duration-200",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent",
            "active:scale-95",
            "lg:hidden"
          )}
          aria-label="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

ApplicationSidebarHeader.displayName = 'ApplicationSidebarHeader'

export default ApplicationSidebarHeader

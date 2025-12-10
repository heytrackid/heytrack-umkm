'use client'

import { RefreshCw, X } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useUpdateChecker } from '@/hooks/useUpdateChecker'
import { cn } from '@/lib/utils'
import { memo } from 'react'

interface UpdateBannerProps {
  /** Custom class name */
  className?: string
  /** Polling interval in ms (default: 60000 = 1 minute) */
  pollInterval?: number
}

export const UpdateBanner = memo(function UpdateBanner({ 
  className,
  pollInterval = 60000 
}: UpdateBannerProps) {
  const { hasUpdate, applyUpdate, dismissUpdate, isChecking } = useUpdateChecker({
    pollInterval,
    enabled: true
  })

  if (!hasUpdate) return null

  return (
    <div 
      className={cn(
        "fixed top-14 left-0 right-0 z-40 bg-primary text-primary-foreground px-4 py-2",
        "flex items-center justify-center gap-3 text-sm",
        "animate-slide-in-top",
        className
      )}
    >
      <span className="flex items-center gap-2">
        <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
        Versi baru tersedia!
      </span>
      <Button
        size="sm"
        variant="secondary"
        onClick={applyUpdate}
        className="h-7 px-3 text-xs font-medium"
      >
        Refresh Sekarang
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={dismissUpdate}
        className="h-7 w-7 p-0 hover:bg-primary-foreground/20"
        aria-label="Tutup"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
})

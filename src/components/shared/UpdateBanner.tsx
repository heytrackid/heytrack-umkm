'use client'

import { AlertCircle, Download, RefreshCw } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useUpdateChecker } from '@/hooks/useUpdateChecker'
import { memo } from 'react'

interface UpdateBannerProps {
  /** Custom class name */
  className?: string
  /** Polling interval in ms (default: 60000 = 1 minute) */
  pollInterval?: number
}

export const UpdateBanner = memo(function UpdateBanner({ 
  pollInterval = 60000 
}: UpdateBannerProps) {
  const { hasUpdate, applyUpdate, dismissUpdate, isChecking } = useUpdateChecker({
    pollInterval,
    enabled: true
  })

  return (
    <Dialog open={hasUpdate} onOpenChange={(open) => !open && dismissUpdate()}>
      <DialogContent className="w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Update Tersedia!
          </DialogTitle>
          <DialogDescription>
            Versi baru HeyTrack telah tersedia dengan fitur dan perbaikan terbaru.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-3 py-4">
          <AlertCircle className="h-8 w-8 text-amber-500 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">Rekomendasi: Update sekarang untuk pengalaman terbaik</p>
            <p className="text-muted-foreground mt-1">
              Aplikasi akan refresh otomatis untuk menginstall update.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={dismissUpdate}
            className="w-full sm:w-auto"
          >
            Nanti Saja
          </Button>
          <Button
            onClick={applyUpdate}
            disabled={isChecking}
            className="w-full sm:w-auto"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Memperbarui...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Update Sekarang
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

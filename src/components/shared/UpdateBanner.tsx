'use client'

import { Button } from '@/components/ui/button'
import { useUpdates } from '@/contexts/UpdateContext'
import { AlertCircle, RefreshCw, X } from 'lucide-react'

export function UpdateBanner() {
  const { updates, refreshData, dismissUpdate } = useUpdates()

  if (updates.length === 0) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 space-y-2 p-4 pointer-events-none">
      {updates.map(update => (
        <div
          key={update.id}
          className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-md animate-in slide-in-from-top pointer-events-auto"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-blue-900">{update.message}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="default"
              onClick={() => refreshData(update.id, update.queryKeys)}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <button
              onClick={() => dismissUpdate(update.id)}
              className="text-blue-600 hover:text-blue-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

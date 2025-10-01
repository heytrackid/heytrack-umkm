'use client'

import { sampleDataBanner } from '@/lib/sample-data'
import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'

export function DevModeBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!sampleDataBanner.show || !isVisible) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {sampleDataBanner.message}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                {sampleDataBanner.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
            aria-label="Tutup banner"
          >
            <X className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'


// import { Badge } from '@/components/ui/badge'

interface UnsavedChangesPromptProps {
  isUnsavedChanges: boolean
  onReset: () => void
  onSave: () => void
  isSaving: boolean
}

/**
 * Unsaved changes prompt component
 */
export const UnsavedChangesPrompt = ({ isUnsavedChanges, onReset, onSave, isSaving }: UnsavedChangesPromptProps) => {
  if (!isUnsavedChanges) {return null}

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 sticky bottom-4 z-20 ">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <p className="font-medium text-orange-600 text-sm sm:text-base">
              Ada perubahan yang belum disimpan
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={onReset} size="sm" className="flex-1 sm:flex-none">
              Batal
            </Button>
            <Button onClick={onSave} disabled={isSaving} size="sm" className="flex-1 sm:flex-none">
              {isSaving ? 'Menyimpan...' : 'Simpan Sekarang'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

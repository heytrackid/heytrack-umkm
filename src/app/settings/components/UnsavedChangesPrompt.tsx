'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface UnsavedChangesPromptProps {
  isUnsavedChanges: boolean
  onReset: () => void
  onSave: () => void
  isSaving: boolean
}

/**
 * Unsaved changes prompt component
 */
export function UnsavedChangesPrompt({ isUnsavedChanges, onReset, onSave, isSaving }: UnsavedChangesPromptProps) {
  if (!isUnsavedChanges) return null

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="font-medium text-orange-600">
              Ada perubahan yang belum disimpan
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReset}>
              Batal
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Sekarang'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

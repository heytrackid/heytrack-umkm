'use client'

import { AlertTriangle, Trash2 } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



/**
 * Danger zone component for destructive actions
 */
export const DangerZone = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="h-5 w-5" />
          Zona Bahaya
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-medium text-muted-foreground mb-2">Hapus Semua Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Tindakan ini akan menghapus semua data aplikasi dan tidak dapat dibatalkan.
          </p>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Semua Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )

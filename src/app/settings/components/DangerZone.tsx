'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'

/**
 * Danger zone component for destructive actions
 */
export function DangerZone() {
  const { t } = useI18n()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <AlertTriangle className="h-5 w-5" />
          {t('settings.dangerZone.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">{t('settings.dangerZone.resetApp.title')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('settings.dangerZone.resetApp.description')}
          </p>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            {t('settings.dangerZone.resetApp.button')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Database, Download, Upload } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'

interface BackupSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Backup and data settings component
 */
export function BackupSettings({ settings, onSettingChange }: BackupSettingsProps) {
  const { t } = useI18n()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          {t('settings.backup.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('settings.backup.autoBackup.title')}</p>
            <p className="text-sm text-muted-foreground">{t('settings.backup.autoBackup.description')}</p>
          </div>
          <Switch
            checked={settings.system.autoBackup}
            onCheckedChange={(checked) => onSettingChange('system', 'autoBackup', checked)}
          />
        </div>
        <div>
          <Label htmlFor="backupFrequency">{t('settings.backup.frequency.title')}</Label>
          <select
            id="backupFrequency"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.system.backupFrequency}
            onChange={(e) => onSettingChange('system', 'backupFrequency', e.target.value)}
          >
            <option value="daily">{t('settings.backup.frequency.daily')}</option>
            <option value="weekly">{t('settings.backup.frequency.weekly')}</option>
            <option value="monthly">{t('settings.backup.frequency.monthly')}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="dataRetention">{t('settings.backup.dataRetention.title')}</Label>
          <Input
            id="dataRetention"
            type="number"
            value={settings.system.dataRetention}
            onChange={(e) => onSettingChange('system', 'dataRetention', e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            {t('settings.backup.dataRetention.description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('settings.backup.actions.backupNow')}
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {t('settings.backup.actions.restoreData')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

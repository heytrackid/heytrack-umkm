'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Database, Download, Upload } from 'lucide-react'

interface BackupSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * Backup and data settings component
 */
export function BackupSettings({ settings, onSettingChange }: BackupSettingsProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Informasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Informasi</p>
            <p className="text-sm text-muted-foreground">Informasi</p>
          </div>
          <Switch
            checked={settings.system.autoBackup}
            onCheckedChange={(checked) => onSettingChange('system', 'autoBackup', checked)}
          />
        </div>
        <div>
          <Label htmlFor="backupFrequency">Informasi</Label>
          <select
            id="backupFrequency"
            className="w-full p-2 border border-input rounded-md bg-background"
            value={settings.system.backupFrequency}
            onChange={(e) => onSettingChange('system', 'backupFrequency', e.target.value)}
          >
            <option value="daily">Informasi</option>
            <option value="weekly">Informasi</option>
            <option value="monthly">Informasi</option>
          </select>
        </div>
        <div>
          <Label htmlFor="dataRetention">Informasi</Label>
          <Input
            id="dataRetention"
            type="number"
            value={settings.system.dataRetention}
            onChange={(e) => onSettingChange('system', 'dataRetention', e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Informasi
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Informasi
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Informasi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

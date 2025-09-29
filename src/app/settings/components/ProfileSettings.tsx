'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Upload } from 'lucide-react'

interface ProfileSettingsProps {
  settings: any
  onSettingChange: (category: string, key: string, value: any) => void
}

/**
 * User profile settings component
 */
export function ProfileSettings({ settings, onSettingChange }: ProfileSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profil Pengguna
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Foto
            </Button>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG max 2MB
            </p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              id="fullName"
              value={settings.user.fullName}
              onChange={(e) => onSettingChange('user', 'fullName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Jabatan</Label>
            <select
              className="w-full p-2 border border-input rounded-md bg-background"
              value={settings.user.role}
              onChange={(e) => onSettingChange('user', 'role', e.target.value)}
            >
              <option value="Owner">Owner</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="userEmail">Email</Label>
            <Input
              id="userEmail"
              type="email"
              value={settings.user.email}
              onChange={(e) => onSettingChange('user', 'email', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="userPhone">Telepon</Label>
            <Input
              id="userPhone"
              value={settings.user.phone}
              onChange={(e) => onSettingChange('user', 'phone', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

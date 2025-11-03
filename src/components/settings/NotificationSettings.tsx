'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Volume2, Mail, Monitor, Smartphone } from 'lucide-react'
import type { NotificationPreferences, NotificationType } from '@/lib/notifications/notification-types'
import { NOTIFICATION_CONFIGS } from '@/lib/notifications/notification-types'

interface NotificationSettingsProps {
  preferences: NotificationPreferences
  onUpdate: (updates: Partial<NotificationPreferences>) => void
}

export function NotificationSettings({ preferences, onUpdate }: NotificationSettingsProps) {
  const notificationTypes: { type: NotificationType; label: string; description: string }[] = [
    { type: 'stock_low', label: 'Stok Menipis', description: 'Bahan baku mencapai batas minimum' },
    { type: 'stock_out', label: 'Stok Habis', description: 'Bahan baku habis' },
    { type: 'stock_critical', label: 'Stok Kritis', description: 'Bahan baku sangat menipis' },
    { type: 'order_pending', label: 'Pesanan Tertunda', description: 'Pesanan belum diproses' },
    { type: 'order_overdue', label: 'Pesanan Terlambat', description: 'Pesanan melewati batas waktu' },
    { type: 'ingredient_expiring', label: 'Bahan Kadaluarsa', description: 'Bahan baku mendekati kadaluarsa' },
    { type: 'cost_increase', label: 'Kenaikan Harga', description: 'Harga bahan baku naik signifikan' },
    { type: 'profit_margin_low', label: 'Margin Rendah', description: 'Margin keuntungan di bawah target' },
    { type: 'daily_summary', label: 'Ringkasan Harian', description: 'Laporan harian otomatis' }
  ]

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi Smart
              </CardTitle>
              <CardDescription>
                Dapatkan alert otomatis untuk kondisi penting
              </CardDescription>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) => onUpdate({ enabled: checked })}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Jenis Notifikasi</CardTitle>
          <CardDescription>
            Pilih notifikasi mana yang ingin Anda terima
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ type, label, description }) => {
            const config = NOTIFICATION_CONFIGS[type]
            
            return (
              <div
                key={type}
                className="flex items-center justify-between py-3 border-b last:border-b-0"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl mt-1">{config.icon}</span>
                  <div className="space-y-1">
                    <Label htmlFor={`notif-${type}`} className="font-medium cursor-pointer">
                      {label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <Badge variant="outline" className="text-xs">
                      {config.defaultPriority}
                    </Badge>
                  </div>
                </div>
                <Switch
                  id={`notif-${type}`}
                  checked={preferences.types[type]}
                  onCheckedChange={(checked) => 
                    onUpdate({ 
                      types: { ...preferences.types, [type]: checked } 
                    })
                  }
                  disabled={!preferences.enabled}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Priority Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Prioritas Minimum</CardTitle>
          <CardDescription>
            Hanya tampilkan notifikasi dengan prioritas ini atau lebih tinggi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.minPriority}
            onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
              onUpdate({ minPriority: value })
            }
            disabled={!preferences.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low - Tampilkan semua</SelectItem>
              <SelectItem value="medium">Medium - Hanya penting</SelectItem>
              <SelectItem value="high">High - Sangat penting</SelectItem>
              <SelectItem value="critical">Critical - Hanya kritis</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Delivery Options */}
      <Card>
        <CardHeader>
          <CardTitle>Metode Pengiriman</CardTitle>
          <CardDescription>
            Pilih cara menerima notifikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="sound" className="font-medium cursor-pointer">
                  Suara Notifikasi
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mainkan suara untuk notifikasi penting
                </p>
              </div>
            </div>
            <Switch
              id="sound"
              checked={preferences.soundEnabled}
              onCheckedChange={(checked) => onUpdate({ soundEnabled: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          {/* Desktop Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="desktop" className="font-medium cursor-pointer">
                  Notifikasi Desktop
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tampilkan notifikasi sistem (browser)
                </p>
                <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
              </div>
            </div>
            <Switch
              id="desktop"
              checked={preferences.desktopNotifications}
              onCheckedChange={(checked) => onUpdate({ desktopNotifications: checked })}
              disabled={true}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email" className="font-medium cursor-pointer">
                  Email Notifikasi
                </Label>
                <p className="text-sm text-muted-foreground">
                  Kirim notifikasi ke email Anda
                </p>
                <Badge variant="secondary" className="text-xs mt-1">Coming Soon</Badge>
              </div>
            </div>
            <Switch
              id="email"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => onUpdate({ emailNotifications: checked })}
              disabled={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Check Interval */}
      <Card>
        <CardHeader>
          <CardTitle>Frekuensi Pengecekan</CardTitle>
          <CardDescription>
            Seberapa sering sistem memeriksa kondisi baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.checkInterval.toString()}
            onValueChange={(value) => onUpdate({ checkInterval: parseInt(value) })}
            disabled={!preferences.enabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Setiap 5 menit (Real-time)</SelectItem>
              <SelectItem value="15">Setiap 15 menit (Cepat)</SelectItem>
              <SelectItem value="30">Setiap 30 menit (Normal)</SelectItem>
              <SelectItem value="60">Setiap 1 jam (Hemat)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Interval lebih pendek = notifikasi lebih cepat, tapi konsumsi data lebih banyak
          </p>
        </CardContent>
      </Card>

      {/* Test Notification */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifikasi</CardTitle>
          <CardDescription>
            Coba notifikasi untuk melihat bagaimana tampilannya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              // This would trigger test notification
              alert('Test notification feature coming soon!')
            }}
            disabled={!preferences.enabled}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Kirim Test Notifikasi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

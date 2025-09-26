'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Settings,
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Database,
  Wifi,
  Printer,
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  Percent,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [isUnsavedChanges, setIsUnsavedChanges] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      businessName: 'Toko Kue Bahagia',
      businessType: 'bakery',
      address: 'Jl. Raya Mawar No. 123, Jakarta Selatan',
      phone: '021-12345678',
      email: 'info@tokekuebahagia.com',
      website: 'www.tokekuebahagia.com',
      taxNumber: '12.345.678.9-012.000',
      currency: 'IDR',
      timezone: 'Asia/Jakarta'
    },
    
    // User Profile
    user: {
      fullName: 'Budi Santoso',
      email: 'budi@tokekuebahagia.com',
      phone: '08123456789',
      role: 'Owner',
      avatar: null
    },
    
    // Notifications
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      lowStockAlert: true,
      orderUpdates: true,
      dailyReports: true,
      weeklyReports: false,
      monthlyReports: true
    },
    
    // System Preferences
    system: {
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: '365',
      defaultTax: '11',
      lowStockThreshold: '10'
    },
    
    // UI Preferences
    ui: {
      theme: 'system',
      language: 'id',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'IDR',
      numberFormat: '1.234.567,89'
    }
  })

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
    setIsUnsavedChanges(true)
  }

  const handleSave = () => {
    // Here you would normally save to your backend
    console.log('Saving settings:', settings)
    setIsUnsavedChanges(false)
    // Show success message
  }

  const handleReset = () => {
    // Reset to default values
    setIsUnsavedChanges(false)
    // Show reset confirmation
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
            <p className="text-muted-foreground">Kelola preferensi aplikasi dan pengaturan bisnis</p>
          </div>
          <div className="flex gap-2">
            {isUnsavedChanges && (
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                Belum Tersimpan
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Umum</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
            <TabsTrigger value="system">Sistem</TabsTrigger>
            <TabsTrigger value="ui">Tampilan</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informasi Bisnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Nama Bisnis</Label>
                    <Input
                      id="businessName"
                      value={settings.general.businessName}
                      onChange={(e) => handleSettingChange('general', 'businessName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Jenis Bisnis</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={settings.general.businessType}
                      onChange={(e) => handleSettingChange('general', 'businessType', e.target.value)}
                    >
                      <option value="bakery">Bakery</option>
                      <option value="cafe">Cafe</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="food-truck">Food Truck</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={settings.general.address}
                    onChange={(e) => handleSettingChange('general', 'address', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                      id="phone"
                      value={settings.general.phone}
                      onChange={(e) => handleSettingChange('general', 'phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.general.email}
                      onChange={(e) => handleSettingChange('general', 'email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={settings.general.website}
                      onChange={(e) => handleSettingChange('general', 'website', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxNumber">NPWP</Label>
                    <Input
                      id="taxNumber"
                      value={settings.general.taxNumber}
                      onChange={(e) => handleSettingChange('general', 'taxNumber', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pengaturan Regional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Mata Uang</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={settings.general.currency}
                      onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                    >
                      <option value="IDR">Indonesian Rupiah (IDR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Zona Waktu</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={settings.general.timezone}
                      onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    >
                      <option value="Asia/Jakarta">Jakarta (UTC+7)</option>
                      <option value="Asia/Makassar">Makassar (UTC+8)</option>
                      <option value="Asia/Jayapura">Jayapura (UTC+9)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
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
                      onChange={(e) => handleSettingChange('user', 'fullName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Jabatan</Label>
                    <select 
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={settings.user.role}
                      onChange={(e) => handleSettingChange('user', 'role', e.target.value)}
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
                      onChange={(e) => handleSettingChange('user', 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPhone">Telepon</Label>
                    <Input
                      id="userPhone"
                      value={settings.user.phone}
                      onChange={(e) => handleSettingChange('user', 'phone', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password saat ini"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Masukkan password baru"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
                <Button>
                  <Shield className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pengaturan Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Notifikasi push di browser</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'pushNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Peringatan Stok Rendah</p>
                    <p className="text-sm text-muted-foreground">Notifikasi ketika stok hampir habis</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.lowStockAlert}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'lowStockAlert', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Update Pesanan</p>
                    <p className="text-sm text-muted-foreground">Notifikasi perubahan status pesanan</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.orderUpdates}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'orderUpdates', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Laporan Harian</p>
                    <p className="text-sm text-muted-foreground">Ringkasan penjualan harian</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.dailyReports}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'dailyReports', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Laporan Mingguan</p>
                    <p className="text-sm text-muted-foreground">Ringkasan penjualan mingguan</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReports', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Laporan Bulanan</p>
                    <p className="text-sm text-muted-foreground">Ringkasan penjualan bulanan</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.monthlyReports}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'monthlyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Backup</p>
                    <p className="text-sm text-muted-foreground">Backup otomatis data aplikasi</p>
                  </div>
                  <Switch 
                    checked={settings.system.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('system', 'autoBackup', checked)}
                  />
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                  <select 
                    id="backupFrequency"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.system.backupFrequency}
                    onChange={(e) => handleSettingChange('system', 'backupFrequency', e.target.value)}
                  >
                    <option value="daily">Harian</option>
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="dataRetention">Retensi Data (hari)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={settings.system.dataRetention}
                    onChange={(e) => handleSettingChange('system', 'dataRetention', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Data akan disimpan selama periode ini sebelum dihapus otomatis
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Backup Sekarang
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pengaturan Bisnis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="defaultTax">Pajak Default (%)</Label>
                  <Input
                    id="defaultTax"
                    type="number"
                    value={settings.system.defaultTax}
                    onChange={(e) => handleSettingChange('system', 'defaultTax', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold">Threshold Stok Rendah</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.system.lowStockThreshold}
                    onChange={(e) => handleSettingChange('system', 'lowStockThreshold', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Alert akan muncul ketika stok di bawah angka ini
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h3 className="font-medium text-red-600 mb-2">Reset Aplikasi</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Menghapus semua data dan mengembalikan ke pengaturan awal.
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset Aplikasi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UI Settings */}
          <TabsContent value="ui" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Tampilan & Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <select 
                    id="theme"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.ui.theme}
                    onChange={(e) => handleSettingChange('ui', 'theme', e.target.value)}
                  >
                    <option value="light">Terang</option>
                    <option value="dark">Gelap</option>
                    <option value="system">Mengikuti Sistem</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">Bahasa</Label>
                  <select 
                    id="language"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.ui.language}
                    onChange={(e) => handleSettingChange('ui', 'language', e.target.value)}
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Format Tanggal & Waktu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dateFormat">Format Tanggal</Label>
                  <select 
                    id="dateFormat"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.ui.dateFormat}
                    onChange={(e) => handleSettingChange('ui', 'dateFormat', e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="timeFormat">Format Waktu</Label>
                  <select 
                    id="timeFormat"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.ui.timeFormat}
                    onChange={(e) => handleSettingChange('ui', 'timeFormat', e.target.value)}
                  >
                    <option value="24h">24 Jam</option>
                    <option value="12h">12 Jam (AM/PM)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Format Angka & Mata Uang
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numberFormat">Format Angka</Label>
                  <select 
                    id="numberFormat"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.ui.numberFormat}
                    onChange={(e) => handleSettingChange('ui', 'numberFormat', e.target.value)}
                  >
                    <option value="1.234.567,89">1.234.567,89 (Indonesia)</option>
                    <option value="1,234,567.89">1,234,567.89 (US)</option>
                    <option value="1 234 567,89">1 234 567,89 (Europe)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="uiCurrency">Mata Uang Display</Label>
                  <select 
                    id="uiCurrency"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={settings.ui.currency}
                    onChange={(e) => handleSettingChange('ui', 'currency', e.target.value)}
                  >
                    <option value="IDR">Rp (Rupiah)</option>
                    <option value="USD">$ (Dollar)</option>
                    <option value="EUR">€ (Euro)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Prompt */}
        {isUnsavedChanges && (
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
                  <Button variant="outline" onClick={handleReset}>
                    Batal
                  </Button>
                  <Button onClick={handleSave}>
                    Simpan Sekarang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
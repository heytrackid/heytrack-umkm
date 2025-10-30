'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Volume2, Bell, Clock, Layers } from 'lucide-react'
import type { NotificationPreferences } from '@/types/domain/notification-preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/domain/notification-preferences'
import { testNotificationSound, testUrgentSound } from '@/lib/notifications/sound'

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchPreferences()
    }, [])

    const fetchPreferences = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/notifications/preferences')
            if (response.ok) {
                const data = await response.json()
                setPreferences(data)
            }
        } catch (error) {
            console.error('Failed to fetch preferences:', error)
            toast.error('Gagal memuat pengaturan')
        } finally {
            setIsLoading(false)
        }
    }

    const savePreferences = async () => {
        if (!preferences) return

        try {
            setIsSaving(true)
            const response = await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences),
            })

            if (response.ok) {
                toast.success('Pengaturan berhasil disimpan')
            } else {
                toast.error('Gagal menyimpan pengaturan')
            }
        } catch (error) {
            console.error('Failed to save preferences:', error)
            toast.error('Gagal menyimpan pengaturan')
        } finally {
            setIsSaving(false)
        }
    }

    const updatePreference = <K extends keyof NotificationPreferences>(
        key: K,
        value: NotificationPreferences[K]
    ) => {
        if (!preferences) return
        setPreferences({ ...preferences, [key]: value })
    }

    if (isLoading) {
        return (
            <div className="container max-w-4xl py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-1/3" />
                    <div className="h-64 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (!preferences) {
        return (
            <div className="container max-w-4xl py-8">
                <p className="text-muted-foreground">Gagal memuat pengaturan</p>
            </div>
        )
    }

    return (
        <div className="container max-w-4xl py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Pengaturan Notifikasi</h1>
                <p className="text-muted-foreground mt-2">
                    Atur preferensi notifikasi sesuai kebutuhan Anda
                </p>
            </div>

            {/* Category Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Kategori Notifikasi
                    </CardTitle>
                    <CardDescription>
                        Pilih kategori notifikasi yang ingin Anda terima
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="inventory">📦 Inventory (Stok Bahan)</Label>
                            <p className="text-sm text-muted-foreground">
                                Stok menipis, reorder reminder, dll
                            </p>
                        </div>
                        <Switch
                            id="inventory"
                            checked={preferences.inventory_enabled}
                            onCheckedChange={(checked) => updatePreference('inventory_enabled', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="orders">🛒 Orders (Pesanan)</Label>
                            <p className="text-sm text-muted-foreground">
                                Pesanan baru, status berubah, dll
                            </p>
                        </div>
                        <Switch
                            id="orders"
                            checked={preferences.orders_enabled}
                            onCheckedChange={(checked) => updatePreference('orders_enabled', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="production">🏭 Production (Produksi)</Label>
                            <p className="text-sm text-muted-foreground">
                                Produksi selesai, delay, dll
                            </p>
                        </div>
                        <Switch
                            id="production"
                            checked={preferences.production_enabled}
                            onCheckedChange={(checked) => updatePreference('production_enabled', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="finance">💰 Finance (Keuangan)</Label>
                            <p className="text-sm text-muted-foreground">
                                HPP naik, margin rendah, dll
                            </p>
                        </div>
                        <Switch
                            id="finance"
                            checked={preferences.finance_enabled}
                            onCheckedChange={(checked) => updatePreference('finance_enabled', checked)}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="system">⚙️ System (Sistem)</Label>
                            <p className="text-sm text-muted-foreground">
                                Update fitur, maintenance, dll
                            </p>
                        </div>
                        <Switch
                            id="system"
                            checked={preferences.system_enabled}
                            onCheckedChange={(checked) => updatePreference('system_enabled', checked)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Sound Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5" />
                        Suara Notifikasi
                    </CardTitle>
                    <CardDescription>
                        Atur suara untuk notifikasi baru
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="sound">Aktifkan Suara</Label>
                            <p className="text-sm text-muted-foreground">
                                Mainkan suara saat notifikasi baru masuk
                            </p>
                        </div>
                        <Switch
                            id="sound"
                            checked={preferences.sound_enabled}
                            onCheckedChange={(checked) => updatePreference('sound_enabled', checked)}
                        />
                    </div>

                    {preferences.sound_enabled && (
                        <>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Volume Suara</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round((preferences.sound_volume || 0.5) * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    value={[(preferences.sound_volume || 0.5) * 100]}
                                    onValueChange={([value]) => updatePreference('sound_volume', value / 100)}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => testNotificationSound(preferences.sound_volume)}
                                    >
                                        Test Suara Normal
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => testUrgentSound(preferences.sound_volume)}
                                    >
                                        Test Suara Urgent
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="urgent-only">Hanya Notifikasi Urgent</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Mainkan suara hanya untuk notifikasi urgent
                                    </p>
                                </div>
                                <Switch
                                    id="urgent-only"
                                    checked={preferences.sound_for_urgent_only}
                                    onCheckedChange={(checked) => updatePreference('sound_for_urgent_only', checked)}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Grouping Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Pengelompokan Notifikasi
                    </CardTitle>
                    <CardDescription>
                        Kelompokkan notifikasi sejenis untuk mengurangi spam
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="grouping">Aktifkan Pengelompokan</Label>
                            <p className="text-sm text-muted-foreground">
                                Gabungkan notifikasi sejenis dalam waktu tertentu
                            </p>
                        </div>
                        <Switch
                            id="grouping"
                            checked={preferences.group_similar_enabled}
                            onCheckedChange={(checked) => updatePreference('group_similar_enabled', checked)}
                        />
                    </div>

                    {preferences.group_similar_enabled && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <Label>Jendela Waktu Pengelompokan</Label>
                                <Select
                                    value={preferences.group_time_window?.toString()}
                                    onValueChange={(value) => updatePreference('group_time_window', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="60">1 menit</SelectItem>
                                        <SelectItem value="300">5 menit</SelectItem>
                                        <SelectItem value="600">10 menit</SelectItem>
                                        <SelectItem value="1800">30 menit</SelectItem>
                                        <SelectItem value="3600">1 jam</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Notifikasi sejenis dalam jendela waktu ini akan digabungkan
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Jam Tenang
                    </CardTitle>
                    <CardDescription>
                        Nonaktifkan notifikasi pada jam tertentu
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="quiet">Aktifkan Jam Tenang</Label>
                            <p className="text-sm text-muted-foreground">
                                Tidak ada notifikasi pada jam yang ditentukan
                            </p>
                        </div>
                        <Switch
                            id="quiet"
                            checked={preferences.quiet_hours_enabled}
                            onCheckedChange={(checked) => updatePreference('quiet_hours_enabled', checked)}
                        />
                    </div>

                    {preferences.quiet_hours_enabled && (
                        <>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mulai</Label>
                                    <input
                                        type="time"
                                        value={preferences.quiet_hours_start?.substring(0, 5) || '22:00'}
                                        onChange={(e) => updatePreference('quiet_hours_start', `${e.target.value}:00`)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Selesai</Label>
                                    <input
                                        type="time"
                                        value={preferences.quiet_hours_end?.substring(0, 5) || '07:00'}
                                        onChange={(e) => updatePreference('quiet_hours_end', `${e.target.value}:00`)}
                                        className="w-full px-3 py-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={() => setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, user_id: preferences.user_id, id: preferences.id, created_at: preferences.created_at, updated_at: preferences.updated_at } as NotificationPreferences)}
                >
                    Reset ke Default
                </Button>
                <Button onClick={savePreferences} disabled={isSaving}>
                    {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
            </div>
        </div>
    )
}

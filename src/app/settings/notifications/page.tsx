'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { toast } from 'sonner'
import { Volume2, Bell, Clock, Layers } from 'lucide-react'
import type { NotificationPreferences } from '@/types/domain/notification-preferences'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/domain/notification-preferences'
import { testNotificationSound, testUrgentSound } from '@/lib/notifications/sound'
import AppLayout from '@/components/layout/app-layout'

export default function NotificationSettingsPage() {
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Helper to convert null to undefined for React components
    const toBool = (value: boolean | null | undefined): boolean => {
        return value === true
    }

    const toNumber = (value: number | null | undefined): number => {
        return value ?? 0.5
    }

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
            <AppLayout>
                <div className="container max-w-4xl py-4 md:py-8 space-y-4 md:space-y-6 px-4 md:px-6">
                    {/* Header skeleton */}
                    <div className="space-y-2">
                        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                    </div>

                    {/* Cards skeleton - Match actual layout */}
                    {[1, 2, 3, 4, 5].map(i => (
                        <Card key={`skeleton-${i}`}>
                            <CardHeader>
                                <div className="space-y-2">
                                    <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
                                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(j => (
                                        <div key={`item-${j}`} className="flex justify-between items-center">
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                                                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                                            </div>
                                            <div className="h-6 w-11 bg-muted rounded-full animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Save button skeleton */}
                    <div className="flex justify-end gap-3">
                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
                    </div>
                </div>
            </AppLayout>
        )
    }

    if (!preferences) {
        return (
            <AppLayout>
                <div className="container max-w-4xl py-4 md:py-8 px-4 md:px-6">
                    <p className="text-muted-foreground">Gagal memuat pengaturan</p>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="container max-w-4xl py-4 md:py-8 space-y-4 md:space-y-6 px-4 md:px-6">
                {/* Breadcrumb */}
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <PrefetchLink href="/">Dashboard</PrefetchLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <PrefetchLink href="/settings">Pengaturan</PrefetchLink>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Notifikasi</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                {/* Header */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-wrap-mobile">Pengaturan Notifikasi</h1>
                    <p className="text-muted-foreground mt-2 text-sm md:text-base text-wrap-mobile">
                        Atur preferensi notifikasi sesuai kebutuhan Anda
                    </p>
                </div>

                {/* Category Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-wrap-mobile">
                            <Bell className="h-5 w-5 flex-shrink-0" />
                            Kategori Notifikasi
                        </CardTitle>
                        <CardDescription className="text-wrap-mobile">
                            Pilih kategori notifikasi yang ingin Anda terima
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="inventory" className="text-wrap-mobile">📦 Inventory (Stok Bahan)</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Stok menipis, reorder reminder, dll
                                </p>
                            </div>
                            <Switch
                                id="inventory"
                                checked={toBool(preferences.inventory_enabled)}
                                onCheckedChange={(checked) => updatePreference('inventory_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        <Separator />

                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="orders" className="text-wrap-mobile">🛒 Orders (Pesanan)</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Pesanan baru, status berubah, dll
                                </p>
                            </div>
                            <Switch
                                id="orders"
                                checked={toBool(preferences.orders_enabled)}
                                onCheckedChange={(checked) => updatePreference('orders_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        <Separator />

                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="production" className="text-wrap-mobile">🏭 Production (Produksi)</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Produksi selesai, delay, dll
                                </p>
                            </div>
                            <Switch
                                id="production"
                                checked={toBool(preferences.production_enabled)}
                                onCheckedChange={(checked) => updatePreference('production_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        <Separator />

                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="finance" className="text-wrap-mobile">💰 Finance (Keuangan)</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    HPP naik, margin rendah, dll
                                </p>
                            </div>
                            <Switch
                                id="finance"
                                checked={toBool(preferences.finance_enabled)}
                                onCheckedChange={(checked) => updatePreference('finance_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        <Separator />

                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="system" className="text-wrap-mobile">⚙️ System (Sistem)</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Update fitur, maintenance, dll
                                </p>
                            </div>
                            <Switch
                                id="system"
                                checked={toBool(preferences.system_enabled)}
                                onCheckedChange={(checked) => updatePreference('system_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Sound Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-wrap-mobile">
                            <Volume2 className="h-5 w-5 flex-shrink-0" />
                            Suara Notifikasi
                        </CardTitle>
                        <CardDescription className="text-wrap-mobile">
                            Atur suara untuk notifikasi baru
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="sound" className="text-wrap-mobile">Aktifkan Suara</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Mainkan suara saat notifikasi baru masuk
                                </p>
                            </div>
                            <Switch
                                id="sound"
                                checked={toBool(preferences.sound_enabled)}
                                onCheckedChange={(checked) => updatePreference('sound_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        {toBool(preferences.sound_enabled) && (
                            <>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-wrap-mobile">Volume Suara</Label>
                                        <span className="text-sm text-muted-foreground flex-shrink-0">
                                            {Math.round(toNumber(preferences.sound_volume) * 100)}%
                                        </span>
                                    </div>
                                    <Slider
                                        value={[toNumber(preferences.sound_volume) * 100]}
                                        onValueChange={([value]) => updatePreference('sound_volume', value / 100)}
                                        max={100}
                                        step={5}
                                        className="w-full"
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => testNotificationSound(toNumber(preferences.sound_volume))}
                                            className="w-full sm:w-auto"
                                        >
                                            Test Suara Normal
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => testUrgentSound(toNumber(preferences.sound_volume))}
                                            className="w-full sm:w-auto"
                                        >
                                            Test Suara Urgent
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start sm:items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <Label htmlFor="urgent-only" className="text-wrap-mobile">Hanya Notifikasi Urgent</Label>
                                        <p className="text-sm text-muted-foreground text-wrap-mobile">
                                            Mainkan suara hanya untuk notifikasi urgent
                                        </p>
                                    </div>
                                    <Switch
                                        id="urgent-only"
                                        checked={toBool(preferences.sound_for_urgent_only)}
                                        onCheckedChange={(checked) => updatePreference('sound_for_urgent_only', checked)}
                                        className="flex-shrink-0"
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Grouping Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-wrap-mobile">
                            <Layers className="h-5 w-5 flex-shrink-0" />
                            Pengelompokan Notifikasi
                        </CardTitle>
                        <CardDescription className="text-wrap-mobile">
                            Kelompokkan notifikasi sejenis untuk mengurangi spam
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="grouping" className="text-wrap-mobile">Aktifkan Pengelompokan</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Gabungkan notifikasi sejenis dalam waktu tertentu
                                </p>
                            </div>
                            <Switch
                                id="grouping"
                                checked={toBool(preferences.group_similar_enabled)}
                                onCheckedChange={(checked) => updatePreference('group_similar_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        {toBool(preferences.group_similar_enabled) && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <Label className="text-wrap-mobile">Jendela Waktu Pengelompokan</Label>
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
                                    <p className="text-sm text-muted-foreground text-wrap-mobile">
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
                        <CardTitle className="flex items-center gap-2 text-wrap-mobile">
                            <Clock className="h-5 w-5 flex-shrink-0" />
                            Jam Tenang
                        </CardTitle>
                        <CardDescription className="text-wrap-mobile">
                            Nonaktifkan notifikasi pada jam tertentu
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <Label htmlFor="quiet" className="text-wrap-mobile">Aktifkan Jam Tenang</Label>
                                <p className="text-sm text-muted-foreground text-wrap-mobile">
                                    Tidak ada notifikasi pada jam yang ditentukan
                                </p>
                            </div>
                            <Switch
                                id="quiet"
                                checked={toBool(preferences.quiet_hours_enabled)}
                                onCheckedChange={(checked) => updatePreference('quiet_hours_enabled', checked)}
                                className="flex-shrink-0"
                            />
                        </div>

                        {toBool(preferences.quiet_hours_enabled) && (
                            <>
                                <Separator />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-wrap-mobile">Mulai</Label>
                                        <input
                                            type="time"
                                            value={preferences.quiet_hours_start?.substring(0, 5) || '22:00'}
                                            onChange={(e) => updatePreference('quiet_hours_start', `${e.target.value}:00`)}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-background dark:border-border"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-wrap-mobile">Selesai</Label>
                                        <input
                                            type="time"
                                            value={preferences.quiet_hours_end?.substring(0, 5) || '07:00'}
                                            onChange={(e) => updatePreference('quiet_hours_end', `${e.target.value}:00`)}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-background dark:border-border"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setPreferences({ ...DEFAULT_NOTIFICATION_PREFERENCES, user_id: preferences.user_id, id: preferences.id, created_at: preferences.created_at, updated_at: preferences.updated_at } as NotificationPreferences)}
                        className="w-full sm:w-auto"
                    >
                        Reset ke Default
                    </Button>
                    <Button onClick={savePreferences} disabled={isSaving} className="w-full sm:w-auto">
                        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                </div>
            </div>
        </AppLayout>
    )
}

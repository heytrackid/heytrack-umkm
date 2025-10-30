'use client'

import Link from 'next/link'
import { Bell, Volume2, Layers } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * Quick links component for settings shortcuts
 */
export const SettingsQuickLinks = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Lanjutan</CardTitle>
        <CardDescription>
          Akses pengaturan tambahan untuk pengalaman yang lebih personal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/settings/notifications">
            <Button variant="outline" className="w-full h-auto flex-col items-start p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <span className="font-semibold">Notifikasi</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Atur kategori, suara, dan pengelompokan notifikasi
              </p>
            </Button>
          </Link>

          <div className="opacity-50 cursor-not-allowed">
            <Button variant="outline" className="w-full h-auto flex-col items-start p-4 space-y-2" disabled>
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <span className="font-semibold">Suara & Tema</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Kustomisasi tampilan dan suara aplikasi
              </p>
            </Button>
          </div>

          <div className="opacity-50 cursor-not-allowed">
            <Button variant="outline" className="w-full h-auto flex-col items-start p-4 space-y-2" disabled>
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <span className="font-semibold">Integrasi</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                Hubungkan dengan WhatsApp, Email, dan lainnya
              </p>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Volume2 } from '@/components/icons'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'



/**
 * Quick links component for settings shortcuts
 */
export const SettingsQuickLinks = () => (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Lanjutan</CardTitle>
        <CardDescription>
          Akses pengaturan tambahan untuk pengalaman yang lebih personal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 grid-cols-1 sm:grid-cols-2">


          <Link href="/settings/notifications" className="block">
            <Button variant="outline" className="w-full h-auto flex-col items-start p-4 space-y-2 hover:bg-accent transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Volume2 className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold text-wrap-mobile">Suara</span>
              </div>
              <p className="text-sm text-muted-foreground text-left text-wrap-mobile">
                Kustomisasi suara notifikasi dan volume
              </p>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

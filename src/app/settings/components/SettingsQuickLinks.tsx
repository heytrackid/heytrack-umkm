'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Printer, Mail, Database } from 'lucide-react'

/**
 * Quick links component showing coming soon features
 */
export function SettingsQuickLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card className="opacity-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Printer className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-medium text-sm mb-1">Print Settings</h3>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="opacity-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-medium text-sm mb-1">Email Settings</h3>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="opacity-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-medium text-sm mb-1">Integrations</h3>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

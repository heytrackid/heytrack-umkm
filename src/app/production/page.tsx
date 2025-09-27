'use client'

import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, AlertTriangle } from 'lucide-react'

export default function Page() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Production Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Production management system is currently under maintenance. 
              Please use the main dashboard for core functionality.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              AI-powered features are available in the AI Hub.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

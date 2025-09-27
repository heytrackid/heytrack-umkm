'use client'

import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function IntegrationPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Integration Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Integration dashboard is currently under maintenance. 
              Please check back later.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Core AI functionality is available in the AI Hub.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

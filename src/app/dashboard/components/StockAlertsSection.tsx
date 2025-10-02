'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function StockAlertsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Peringatan Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>Monitoring stok aktif</p>
          <p className="text-sm">Peringatan akan muncul jika ada stok menipis</p>
        </div>
        <Button variant="outline" className="w-full">
          <Package className="h-4 w-4 mr-2" />
          Kelola Inventory
        </Button>
      </CardContent>
    </Card>
  )
}
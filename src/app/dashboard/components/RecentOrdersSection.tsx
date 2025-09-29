'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RecentOrdersSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Pesanan Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
          <p>Belum ada pesanan terbaru</p>
          <p className="text-sm">Pesanan akan muncul di sini ketika ada data</p>
        </div>
        <Button variant="outline" className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Lihat Semua Pesanan
        </Button>
      </CardContent>
    </Card>
  )
}
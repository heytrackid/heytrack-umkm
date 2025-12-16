'use client'

import { AlertCircle, Package } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LowStockItem {
  id: string
  name: string
  currentStock: number
  reorderPoint: number
}

interface StockAlertsSectionProps {
  lowStockItems?: LowStockItem[]
}

const StockAlertsSection = ({ lowStockItems }: StockAlertsSectionProps): JSX.Element => {
  // Show skeleton if data is undefined
  if (lowStockItems === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Peringatan Stok
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Peringatan Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lowStockItems && lowStockItems.length > 0 ? (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div
                key={item['id']}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate-desktop-only">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Stok: {item.currentStock} (Min: {item.reorderPoint})
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 text-xs rounded-full bg-destructive text-destructive-foreground">
                    Menipis
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Monitoring stok aktif</p>
            <p className="text-sm">Peringatan akan muncul jika ada stok menipis</p>
          </div>
        )}
        <Button variant="outline" className="w-full">
          <Package className="h-4 w-4 mr-2" />
          Kelola Inventory
        </Button>
      </CardContent>
    </Card>
  )
}

StockAlertsSection.displayName = 'StockAlertsSection'

export default StockAlertsSection
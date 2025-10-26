// Inventory Report Component
// Handles inventory data filtering, calculations, and display

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/supabase'

interface InventoryReportProps {
  dateRange: {
    start: string
    end: string
  }
}

export default function InventoryReport({ dateRange }: InventoryReportProps) {
  const { formatCurrency } = useCurrency()
  const { data: ingredients } = useSupabaseCRUD('ingredients')

  // Calculate inventory report
  const inventoryStats = {
    totalItems: ingredients?.length || 0,
    lowStock: ingredients?.filter((i: any) => (i.current_stock || 0) <= (i.min_stock || 0)).length || 0,
    totalValue: ingredients?.reduce((sum: number, i: any) =>
      sum + ((i.current_stock || 0) * (i.price_per_unit || 0)), 0
    ) || 0,
    outOfStock: ingredients?.filter((i: any) => (i.current_stock || 0) === 0).length || 0
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Item
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stok Rendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Habis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

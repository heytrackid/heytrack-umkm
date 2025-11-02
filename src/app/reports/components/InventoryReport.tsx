import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/supabase/useSupabaseCRUD'

// Inventory Report Component
// Handles inventory data filtering, calculations, and display


interface InventoryReportProps {
  dateRange: {
    start: string
    end: string
  }
}

interface InventoryStats {
  totalValue: number
  lowStock: number
  outOfStock: number
}

const InventoryReport = ({ dateRange: _dateRange }: InventoryReportProps) => {
  const { formatCurrency } = useCurrency()
  const { data: ingredients } = useSupabaseCRUD<'ingredients'>('ingredients')

  // Calculate inventory report
  const ingredientList = ingredients ?? []

  const inventoryStats = ingredientList.reduce<InventoryStats>(
    (stats, ingredient) => {
      const currentStock = ingredient.current_stock ?? 0
      const minimumStock = ingredient.min_stock ?? 0

      if (currentStock <= minimumStock) {
        stats.lowStock += 1
      }

      if (currentStock === 0) {
        stats.outOfStock += 1
      }

      stats.totalValue += currentStock * ingredient.price_per_unit
      return stats
    },
    { totalValue: 0, lowStock: 0, outOfStock: 0 }
  )

  const totalItems = ingredientList.length

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
            <p className="text-2xl font-bold">{totalItems}</p>
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

export default InventoryReport

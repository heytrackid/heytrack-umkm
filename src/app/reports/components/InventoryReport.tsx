import { Package, PackageCheck, AlertTriangle, ShoppingCart } from '@/components/icons'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useIngredientsList } from '@/hooks/useIngredients'
import { useCurrency } from '@/hooks/useCurrency'

// Inventory Report Component
// Handles inventory data filtering, calculations, and display


interface InventoryReportProps {
  dateRange?: {
    start: string | undefined
    end: string | undefined
  }
}

interface InventoryStats {
  totalValue: number
  lowStock: number
  outOfStock: number
}

export const InventoryReport = ({ dateRange: _dateRange }: InventoryReportProps = {}) => {
  const { formatCurrency } = useCurrency()
  const { data: ingredients } = useIngredientsList()

  // Calculate inventory report
  const ingredientList = ingredients ?? []

    const inventoryStats = ingredientList.reduce<InventoryStats>(
      (stats, ingredient) => {
      const currentStock = ingredient.current_stock ?? 0
      const minimumStock = ingredient.min_stock ?? 0

      if (currentStock <= minimumStock && currentStock > 0) {
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
  const adequateStock = totalItems - inventoryStats.lowStock - inventoryStats.outOfStock

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Item
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Jumlah bahan dalam inventaris</p>
          </CardContent>
        </Card>
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nilai Inventory
            </CardTitle>
            <PackageCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">Nilai total semua stok</p>
          </CardContent>
        </Card>
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Stok Rendah
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inventoryStats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Perlu restock segera</p>
          </CardContent>
        </Card>
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Habis
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">Perlu pengadaan segera</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 ">
          <CardHeader>
            <CardTitle>Status Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Adekuat</span>
                  <span>{adequateStock} item</span>
                </div>
                 <Progress
                   value={(adequateStock / totalItems) * 100 || 0}
                   className="h-2.5"
                   aria-label={`Adequate stock: ${adequateStock} items`}
                 />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600">Stok Rendah</span>
                  <span>{inventoryStats.lowStock} item</span>
                </div>
                 <Progress
                   value={(inventoryStats.lowStock / totalItems) * 100 || 0}
                   className="h-2.5"
                   aria-label={`Low stock: ${inventoryStats.lowStock} items`}
                 />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Habis</span>
                  <span>{inventoryStats.outOfStock} item</span>
                </div>
                 <Progress
                   value={(inventoryStats.outOfStock / totalItems) * 100 || 0}
                   className="h-2.5"
                   aria-label={`Out of stock: ${inventoryStats.outOfStock} items`}
                 />
              </div>
            </div>
            
             <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
               <p className="text-sm">
                 {(() => {
                   if (inventoryStats.outOfStock > 0) {
                     return 'Perhatian: Ada bahan yang habis. Segera lakukan pengadaan untuk menjaga operasional.'
                   }
                   if (inventoryStats.lowStock > 0) {
                     return 'Sebagian bahan stoknya rendah. Rencanakan restock untuk mencegah kehabisan.'
                   }
                   return 'Semua bahan dalam stok yang cukup. Status inventaris optimal.'
                 })()}
               </p>
             </div>
          </CardContent>
        </Card>

        <Card className="border-0 ">
          <CardHeader>
            <CardTitle>Rekomendasi Tindakan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryStats.outOfStock > 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Kehabisan Stok</p>
                    <p className="text-sm">Ada {inventoryStats.outOfStock} bahan yang habis. Prioritaskan pengadaan.</p>
                  </div>
                </div>
              )}
              
              {inventoryStats.lowStock > 0 && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Stok Rendah</p>
                    <p className="text-sm">Ada {inventoryStats.lowStock} bahan yang perlu restock segera.</p>
                  </div>
                </div>
              )}
              
              {inventoryStats.lowStock === 0 && inventoryStats.outOfStock === 0 && (
                <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <PackageCheck className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Status Stok Baik</p>
                    <p className="text-sm">Tidak ada bahan dengan stok rendah atau habis.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
import { DollarSign, Package, ShoppingCart, TrendingUp, type LucideIcon } from '@/components/icons'

import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah } from '@/lib/currency'

import type { IngredientPurchase, StatsItem } from '@/app/ingredients/purchases/components/types'

// Purchase Stats Component - Lazy Loaded
// Displays purchase statistics and metrics cards


interface PurchaseStatsProps {
  purchases: IngredientPurchase[]
}

const PurchaseStatsCard = ({ purchases }: PurchaseStatsProps): JSX.Element => {
  // Calculate stats
  const thisMonth = purchases.filter((p) => {
    if (!p.purchase_date) return false
    const purchaseDate = new Date(p.purchase_date)
    const now = new Date()
    return purchaseDate.getMonth() === now.getMonth() &&
      purchaseDate.getFullYear() === now.getFullYear()
  })

  const uniqueSuppliers = new Set(purchases.filter((p) => p.supplier).map((p) => p.supplier))

  const stats: Array<StatsItem & { icon: LucideIcon }> = [
    {
      title: 'Pembelian (Bulan Ini)',
      value: thisMonth.length,
      icon: ShoppingCart,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      description: `Total ${purchases.length} pembelian`
    },
    {
      title: 'Pengeluaran (Bulan Ini)',
      value: formatRupiah(thisMonth.reduce((sum, p) => sum + (p.total_price || 0), 0)),
      icon: DollarSign,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      description: 'Auto-recorded ke expense'
    },
    {
      title: 'Supplier Aktif',
      value: uniqueSuppliers.size,
      icon: Package,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      description: `${new Set(purchases.map((p) => p.ingredient_id)).size} item dibeli`
    },
    {
      title: 'Rata-rata Pembelian',
      value: purchases.length > 0
        ? formatRupiah(Math.round(purchases.reduce((sum, p) => sum + (p.total_price || 0), 0) / purchases.length))
        : 'Rp 0',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Per transaksi'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export { PurchaseStatsCard as PurchaseStats }

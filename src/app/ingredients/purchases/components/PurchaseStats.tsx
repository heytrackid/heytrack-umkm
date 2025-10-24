// Purchase Stats Component - Lazy Loaded
// Displays purchase statistics and metrics cards

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import type { IngredientPurchase, PurchaseStats } from './types'

interface PurchaseStatsProps {
  purchases: IngredientPurchase[]
}

export default function PurchaseStats({ purchases }: PurchaseStatsProps) {
  // Calculate stats
  const thisMonth = purchases.filter((p) => {
    const purchaseDate = new Date(p.purchase_date)
    const now = new Date()
    return purchaseDate.getMonth() === now.getMonth() &&
           purchaseDate.getFullYear() === now.getFullYear()
  })

  const uniqueSuppliers = new Set(purchases.filter((p) => p.supplier).map((p) => p.supplier))

  const stats: PurchaseStats[] = [
    {
      title: 'Pembelian (Bulan Ini)',
      value: thisMonth.length,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: `Total ${purchases.length} pembelian`
    },
    {
      title: 'Pengeluaran (Bulan Ini)',
      value: `Rp ${thisMonth.reduce((sum, p) => sum + (p.total_price || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Auto-recorded ke expense'
    },
    {
      title: 'Supplier Aktif',
      value: uniqueSuppliers.size,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${new Set(purchases.map((p) => p.ingredient_id)).size} item dibeli`
    },
    {
      title: 'Rata-rata Pembelian',
      value: purchases.length > 0
        ? `Rp ${Math.round(purchases.reduce((sum, p) => sum + (p.total_price || 0), 0) / purchases.length).toLocaleString()}`
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

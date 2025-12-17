import { DollarSign, Package, ShoppingCart, TrendingUp, type LucideIcon } from '@/components/icons'

import { StatsCards, type StatCardData } from '@/components/ui/stats-cards'
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

  const cards: StatCardData[] = stats.map((stat) => ({
    title: stat.title,
    value: stat.value,
    description: stat.description,
    icon: stat.icon,
    iconWrapperClassName: `shrink-0 p-2 rounded-lg ${stat.bgColor}`,
    iconClassName: stat.color,
  }))

  return (
    <StatsCards stats={cards} gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
  )
}

export { PurchaseStatsCard as PurchaseStats }

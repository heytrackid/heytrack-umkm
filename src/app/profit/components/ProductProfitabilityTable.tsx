'use client'

import { TrendingDown, TrendingUp } from '@/components/icons'
import { useMemo } from 'react'

import { SharedDataTable, type Column } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'

import type { ProfitData } from '@/app/profit/components/types'

type ProductProfit = ProfitData['products'][number]

interface ProductProfitabilityTableProps {
  products: ProfitData['products']
  formatCurrency: (amount: number) => string
  loading?: boolean
}

export const ProductProfitabilityTable = ({
  products,
  formatCurrency,
  loading = false
}: ProductProfitabilityTableProps) => {
  // Function to determine badge variant based on margin
  const getMarginBadgeVariant = (margin: number) => {
    if (margin >= 30) return 'default'
    if (margin >= 15) return 'secondary'
    return 'destructive'
  }

  // Function to get profit trend indicator
  const getProfitTrend = (margin: number) => {
    if (margin >= 30) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (margin >= 15) return <TrendingUp className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const columns = useMemo((): Column<ProductProfit & Record<string, unknown>>[] => [
    {
      key: 'product_name',
      header: 'Produk',
      sortable: true,
      render: (_, item) => (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {getProfitTrend(item.profit_margin)}
          <span className="font-medium">{item.product_name}</span>
        </div>
      )
    },
    {
      key: 'quantity_sold',
      header: 'Terjual',
      sortable: true,
      className: 'text-right',
      render: (value) => <div className="text-right">{Number(value)}</div>
    },
    {
      key: 'revenue',
      header: 'Pendapatan',
      sortable: true,
      className: 'text-right',
      render: (value) => <div className="text-right">{formatCurrency(Number(value))}</div>
    },
    {
      key: 'cogs',
      header: 'HPP',
      sortable: true,
      className: 'text-right',
      render: (value) => (
        <div className="text-right text-orange-600">{formatCurrency(Number(value))}</div>
      )
    },
    {
      key: 'profit',
      header: 'Laba',
      sortable: true,
      className: 'text-right',
      render: (value) => {
        const profit = Number(value)
        return (
          <div className={`text-right font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(profit)}
          </div>
        )
      }
    },
    {
      key: 'profit_margin',
      header: 'Margin',
      sortable: true,
      className: 'text-right',
      render: (value) => {
        const margin = Number(value)
        return (
          <div className="text-right">
            <Badge variant={getMarginBadgeVariant(margin)}>
              {margin.toFixed(1)}%
            </Badge>
          </div>
        )
      }
    }
  ], [formatCurrency])

  return (
    <SharedDataTable<ProductProfit & Record<string, unknown>>
      data={(products || []) as (ProductProfit & Record<string, unknown>)[]}
      columns={columns}
      title="Detail Profitabilitas Produk"
      description="Analisis keuntungan per produk menggunakan WAC"
      loading={loading}
      emptyMessage="Belum ada data profitabilitas"
      emptyDescription="Data profitabilitas produk akan muncul setelah ada penjualan"
      searchPlaceholder="Cari produk..."
      enablePagination
      pageSizeOptions={[10, 25, 50]}
      initialPageSize={10}
      exportable
      headerActions={
        <Badge variant="outline" className="text-xs">
          {products.length} produk
        </Badge>
      }
    />
  )
}

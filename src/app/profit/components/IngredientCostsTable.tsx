'use client'

import { SharedDataTable, type Column } from '@/components/shared/SharedDataTable'
import { useMemo } from 'react'

import type { ProfitData } from '@/app/profit/components/types'

type IngredientCost = ProfitData['ingredients'][number]

interface IngredientCostsTableProps {
  ingredients: ProfitData['ingredients']
  formatCurrency: (amount: number) => string
  loading?: boolean
}

export const IngredientCostsTable = ({
  ingredients,
  formatCurrency,
  loading = false
}: IngredientCostsTableProps) => {
  const columns = useMemo((): Column<IngredientCost & Record<string, unknown>>[] => [
    {
      key: 'ingredient_name',
      header: 'Bahan Baku',
      sortable: true,
      render: (value) => <span className="font-medium">{String(value)}</span>
    },
    {
      key: 'quantity_used',
      header: 'Jumlah Terpakai',
      sortable: true,
      className: 'text-right',
      render: (value) => (
        <div className="text-right">{Number(value).toFixed(2)}</div>
      )
    },
    {
      key: 'wac_cost',
      header: 'Harga WAC',
      sortable: true,
      className: 'text-right',
      render: (value) => (
        <div className="text-right">{formatCurrency(Number(value))}</div>
      )
    },
    {
      key: 'total_cost',
      header: 'Total Biaya',
      sortable: true,
      className: 'text-right',
      render: (value) => (
        <div className="text-right font-medium">{formatCurrency(Number(value))}</div>
      )
    }
  ], [formatCurrency])

  return (
    <SharedDataTable<IngredientCost & Record<string, unknown>>
      data={(ingredients || []) as (IngredientCost & Record<string, unknown>)[]}
      columns={columns}
      title="Biaya Bahan Baku (WAC)"
      description="Rincian biaya bahan baku dengan metode Weighted Average Cost"
      loading={loading}
      emptyMessage="Belum ada data biaya bahan baku"
      emptyDescription="Data biaya bahan baku akan muncul setelah ada transaksi"
      searchPlaceholder="Cari bahan baku..."
      enablePagination
      pageSizeOptions={[10, 25, 50]}
      initialPageSize={10}
      exportable
      compact
    />
  )
}

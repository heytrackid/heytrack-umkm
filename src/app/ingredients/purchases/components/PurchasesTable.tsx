import { SharedDataTable } from '@/components/shared/SharedDataTable'
import { formatRupiah } from '@/lib/currency'

import type { IngredientPurchase } from '@/app/ingredients/purchases/components/types'

// Purchases Table Component - Lazy Loaded
// Displays ingredient purchase history in a table using SharedDataTable


interface PurchasesTableProps {
  purchases: IngredientPurchase[]
  isLoading?: boolean
  onRefresh?: () => void
  onEdit?: (purchase: IngredientPurchase) => void
  onDelete?: (purchase: IngredientPurchase) => void
  onBulkDelete?: (purchases: IngredientPurchase[]) => void
}

const PurchasesTable = ({ 
  purchases, 
  isLoading = false, 
  onRefresh,
  onEdit,
  onDelete,
  onBulkDelete
}: PurchasesTableProps): JSX.Element => {
  const tableProps = {
    data: purchases as unknown as Record<string, unknown>[],
    columns: [
        {
          key: 'purchase_date',
          header: 'Tanggal',
          render: (value: unknown) => {
            if (!value) return '-'
            return new Date(value as string).toLocaleDateString('id-ID')
          },
          sortable: true,
        },
        {
          key: 'ingredient.name',
          header: 'Bahan Baku',
          render: (_: unknown, item: Record<string, unknown>) => {
            const purchase = item as unknown as IngredientPurchase
            return (
              <div>
                <div className="font-medium">{purchase.ingredient?.name ?? '-'}</div>
                {purchase.notes && (
                  <div className="text-xs text-muted-foreground">{purchase.notes}</div>
                )}
              </div>
            )
          },
          sortable: true,
        },
        {
          key: 'supplier',
          header: 'Supplier',
          render: (value: unknown) => {
            if (!value) return '-'
            return typeof value === 'string' ? value : (value as { name?: string }).name ?? '-'
          },
          sortable: true,
        },
        {
          key: 'quantity',
          header: 'Jumlah',
          render: (value: unknown, item: Record<string, unknown>) => {
            const purchase = item as unknown as IngredientPurchase
            return (
              <div className="text-right">
                {String(value)} {purchase.ingredient?.unit}
              </div>
            )
          },
          sortable: true,
          className: 'text-right',
        },
        {
          key: 'unit_price',
          header: 'Harga Satuan',
          render: (value: unknown) => (
            <div className="text-right">
              {formatRupiah((value as number) ?? 0)}
            </div>
          ),
          sortable: true,
          className: 'text-right',
        },
        {
          key: 'total_price',
          header: 'Total',
          render: (value: unknown) => (
            <div className="text-right font-medium">
              {formatRupiah((value as number) ?? 0)}
            </div>
          ),
          sortable: true,
          className: 'text-right',
        },
      ],
      title: "Riwayat Pembelian",
      loading: isLoading,
      emptyMessage: "Belum ada data pembelian",
      emptyDescription: "Data pembelian bahan baku akan muncul di sini",
      searchPlaceholder: "Cari bahan baku atau supplier...",
      exportable: true,
      refreshable: !!onRefresh,
      ...(onRefresh && { onRefresh }),
      ...(onEdit && { onEdit: (item: Record<string, unknown>) => onEdit(item as unknown as IngredientPurchase) }),
      ...(onDelete && { onDelete: (item: Record<string, unknown>) => onDelete(item as unknown as IngredientPurchase) }),
      ...(onBulkDelete && { 
        onBulkDelete: (items: Record<string, unknown>[]) => onBulkDelete(items as unknown as IngredientPurchase[]),
        enableBulkActions: true
      }),
      enablePagination: true,
      pageSizeOptions: [10, 25, 50, 100],
      initialPageSize: 10,
  }

  return <SharedDataTable {...tableProps} />
}

export { PurchasesTable }

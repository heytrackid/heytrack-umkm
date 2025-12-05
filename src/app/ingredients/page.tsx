'use client'

import { AlertTriangle, ShoppingCart, Upload } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { generateIngredientsTemplate, parseIngredientsCSV } from '@/components/import/csv-helpers'
import { ImportDialog } from '@/components/import/ImportDialog'
import { IngredientsList } from '@/components/ingredients/IngredientsList'
import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { StatCardPatterns, StatsCards } from '@/components/ui/index'

import { useCostChangeAlerts } from '@/hooks/useCostAlerts'
import { useImportIngredients, useIngredientsList } from '@/hooks/useIngredients'
import type { Row } from '@/types/database'

const IngredientsPage = (): JSX.Element => {
  const { data: ingredients } = useIngredientsList()
  const router = useRouter()
  const { hasSignificantChanges } = useCostChangeAlerts()
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const importIngredientsMutation = useImportIngredients()

  const templateUrl = useMemo(() => {
    const template = generateIngredientsTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    return URL.createObjectURL(blob)
  }, [])

  // Calculate stats
  const totalIngredients = ingredients?.length ?? 0
  const lowStockCount = ingredients?.filter((i: Row<'ingredients'>) =>
    (i.current_stock ?? 0) <= (i.min_stock ?? 0) && (i.current_stock ?? 0) > 0
  ).length ?? 0
  const totalValue = ingredients?.reduce((sum: number, i: Row<'ingredients'>) =>
    sum + ((i.current_stock ?? 0) * (i.price_per_unit ?? 0)), 0
  ) ?? 0
  const outOfStockCount = ingredients?.filter((i: Row<'ingredients'>) => (i.current_stock ?? 0) <= 0).length ?? 0

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Bahan Baku"
          description="Kelola stok dan harga bahan baku"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button variant="outline" onClick={() => router.push('/ingredients/purchases')} className="w-full sm:w-auto">
                <ShoppingCart className="h-4 w-4 mr-2" />Pembelian
              </Button>
              <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />Import
              </Button>
            </div>
          }
        />

        <StatsCards stats={StatCardPatterns.ingredients({
          total: totalIngredients,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          totalValue: totalValue as number
        })} />

        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 dark:bg-orange-900/10 dark:border-orange-900/30">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-200 text-sm">Perhatian Diperlukan</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300/90 leading-relaxed">
                  {outOfStockCount > 0 && <span className="font-medium">{outOfStockCount} bahan habis</span>}
                  {outOfStockCount > 0 && lowStockCount > 0 && ' dan '}
                  {lowStockCount > 0 && <span className="font-medium">{lowStockCount} bahan stok menipis</span>}
                  . Segera lakukan pemesanan untuk menjaga ketersediaan stok.
                </p>
              </div>
              <Button size="sm" variant="outline" className="bg-white/50 border-orange-200 hover:bg-white text-orange-700" onClick={() => router.push('/ingredients/purchases/new')}>
                Buat Pesanan
              </Button>
            </div>
          </div>
        )}

        {hasSignificantChanges && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-900/10 dark:border-blue-900/30">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 text-sm">Perubahan Harga Bahan</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300/90 leading-relaxed">
                  Terdeteksi perubahan harga signifikan pada beberapa bahan baku. Mohon periksa resep yang terpengaruh untuk memastikan HPP tetap akurat.
                </p>
              </div>
              <Button size="sm" variant="outline" className="bg-white/50 border-blue-200 hover:bg-white text-blue-700" onClick={() => router.push('/hpp')}>
                Cek HPP
              </Button>
            </div>
          </div>
        )}

        <IngredientsList />

        <ImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          title="Import Bahan Baku"
          description="Upload file CSV untuk import data bahan baku secara massal"
          templateUrl={templateUrl}
          templateFilename="template-bahan-baku.csv"
          parseCSV={parseIngredientsCSV}
          onImport={async (data: unknown) => {
            try {
              await importIngredientsMutation.mutateAsync(data as unknown[])
              return { success: true, count: Array.isArray(data) ? data.length : 0 }
            } catch (error: unknown) {
              return { success: false, error: error instanceof Error ? error.message : 'Terjadi kesalahan saat import' }
            }
          }}
        />
      </div>
    </AppLayout>
  )
}

export default IngredientsPage

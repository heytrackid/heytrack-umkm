'use client'

import { AlertTriangle, Plus, ShoppingCart, Upload } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { generateIngredientsTemplate, parseIngredientsCSV } from '@/components/import/csv-helpers'
import { ImportDialog } from '@/components/import/ImportDialog'
import { IngredientFormDialog } from '@/components/ingredients/IngredientFormDialog'
import { IngredientsList } from '@/components/ingredients/IngredientsList'
import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCardPatterns, StatsCards } from '@/components/ui/index'
import { ListSkeleton, StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton-loader'
import { handleError } from '@/lib/error-handling'
import { useSettings } from '@/contexts/settings-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { useCostChangeAlerts } from '@/hooks/useCostAlerts'
import { useIngredientPurchases } from '@/hooks/useIngredientPurchases'
import { useImportIngredients, useIngredients } from '@/hooks/useIngredients'
import type { Row } from '@/types/database'
import { useQueryClient } from '@tanstack/react-query'

const IngredientsPage = () => {
  const { data: ingredients, isLoading: loading, error } = useIngredients();
  const { formatCurrency } = useSettings();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasSignificantChanges } = useCostChangeAlerts();
  const isMobile = useIsMobile();

  // Fetch recent purchases
  const { data: allPurchases } = useIngredientPurchases()
  const purchases = allPurchases?.slice(0, 10)
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const importIngredientsMutation = useImportIngredients();

  // Generate template URL
  const templateUrl = useMemo(() => {
    const template = generateIngredientsTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    return URL.createObjectURL(blob)
  }, [])

  // Handle auth errors
  useEffect(() => {
    if (error) {
      handleError(error, 'Load ingredients', true, 'Gagal memuat data bahan baku')
      if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string' && error.message.includes('401')) {
        router.push('/auth/login')
      }
    }
  }, [error, router]);

  // Calculate stats
  const totalIngredients = ingredients?.length ?? 0;
  const lowStockCount = ingredients?.filter((i: Row<'ingredients'>) =>
    (i.current_stock ?? 0) <= (i.min_stock ?? 0) && (i.current_stock ?? 0) > 0
  ).length ?? 0;
  const totalValue = ingredients?.reduce((sum: number, i: Row<'ingredients'>) =>
    sum + ((i.current_stock ?? 0) * (i.price_per_unit ?? 0)), 0
  ) ?? 0;
  const outOfStockCount = ingredients?.filter((i: Row<'ingredients'>) => (i.current_stock ?? 0) <= 0).length ?? 0;

  // Show loading state
  if (loading && !ingredients) {
    return (
      <AppLayout>
        <div className="space-y-6 p-6">

          {/* Header - Always visible */}
          <PageHeader
            title="Bahan Baku"
            description="Kelola stok dan harga bahan baku"
            actions={
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button variant="outline" disabled className="w-full sm:w-auto">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" disabled className="w-full sm:w-auto">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Pembelian
                </Button>
                <Button disabled className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah
                </Button>
              </div>
            }
          />

          {/* Stats skeleton */}
          <StatsSkeleton count={4} />

          {/* Table skeleton */}
          <div className="border rounded-lg p-6">
            {isMobile ? <ListSkeleton items={5} /> : <TableSkeleton rows={5} columns={5} />}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">

        {/* Header */}
        <PageHeader
          title="Bahan Baku"
          description="Kelola stok dan harga bahan baku"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setImportDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/ingredients/purchases')}
                  className="w-full sm:w-auto"
                >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Pembelian
              </Button>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="w-full sm:w-auto"
                >
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <StatsCards stats={StatCardPatterns.ingredients({
          total: totalIngredients,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          totalValue: totalValue as number
        })} />

        {/* Alert for Low Stock */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 text-sm mb-1">
                  Peringatan Stok
                </h3>
                <p className="text-sm text-orange-700">
                  {outOfStockCount > 0 && `${outOfStockCount} bahan habis`}
                  {outOfStockCount > 0 && lowStockCount > 0 && ', '}
                  {lowStockCount > 0 && `${lowStockCount} bahan stok rendah`}
                  . Segera lakukan pemesanan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alert for Cost Changes */}
        {hasSignificantChanges && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 text-sm mb-1">
                  Perubahan Harga Bahan
                </h3>
                <p className="text-sm text-blue-700">
                  Beberapa bahan mengalami perubahan harga signifikan. Periksa resep yang terpengaruh untuk update HPP.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading && !ingredients ? (
          <div className="border rounded-lg p-6">
            {isMobile ? <ListSkeleton items={5} /> : <TableSkeleton rows={5} columns={5} />}
          </div>
        ) : (
          <IngredientsList onAdd={() => setShowAddDialog(true)} />
        )}

        {/* Recent Purchases */}
        {purchases && purchases.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Pembelian Terbaru</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push('/ingredients/purchases')}>
                  Lihat Semua
                </Button>
              </div>
            </CardHeader>
            <CardContent>
               <div className="space-y-3">
                 {(purchases || []).slice(0, 5).map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {typeof purchase.supplier === 'string' 
                          ? purchase.supplier 
                          : purchase.supplier?.name || 'Supplier'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('id-ID') : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(purchase.total_price || 0)}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Dialog */}
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
              return {
                success: true,
                count: Array.isArray(data) ? data.length : 0
              }
            } catch (error: unknown) {
              return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat import'
              }
            }
          }}
        />

        {/* Add/Edit Dialog */}
        <IngredientFormDialog
           open={showAddDialog}
           onOpenChange={setShowAddDialog}
           onSuccess={() => queryClient.invalidateQueries({ queryKey: ['ingredients'] })}
         />
      </div>
    </AppLayout>
  );
}

export default IngredientsPage

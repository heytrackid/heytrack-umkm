'use client'

import { AlertTriangle, Plus, ShoppingCart, Upload } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

import { generateIngredientsTemplate, parseIngredientsCSV } from '@/components/import/csv-helpers'
import AppLayout from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { BreadcrumbPatterns, PageBreadcrumb, StatCardPatterns, StatsCards } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks'
import { useToast } from '@/hooks/use-toast'
import { useIngredients } from '@/hooks/useIngredients'

import type { Row } from '@/types/database'


// Lazy load heavy components
const IngredientsCRUDSkeleton = () => (
  <div className="border rounded-lg p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`row-${i}`} className="h-16 bg-muted rounded" />
      ))}
    </div>
  </div>
)

const IngredientsCRUD = dynamic(() => import('@/components/ingredients/EnhancedIngredientsPage').then(mod => ({ default: mod.EnhancedIngredientsPage })), {
  loading: () => <IngredientsCRUDSkeleton />,
  ssr: false
})

const IngredientFormDialog = dynamic(() => import('@/components/ingredients/IngredientFormDialog').then(mod => ({ default: mod.IngredientFormDialog })), {
  loading: () => null,
  ssr: false
})

const ImportDialog = dynamic(() => import('@/components/import/ImportDialog').then(mod => ({ default: mod.ImportDialog })), {
  loading: () => null,
  ssr: false
})

const IngredientsPage = () => {
  const { data: ingredients, isLoading: loading, error } = useIngredients();
  const { isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Generate template URL
  const templateUrl = useMemo(() => {
    const template = generateIngredientsTemplate()
    const blob = new Blob([template], { type: 'text/csv' })
    return URL.createObjectURL(blob)
  }, [])

  // Handle auth errors
  useEffect(() => {
    if (error && typeof error === 'object' && (error).message?.includes('401')) {
      toast({
        title: 'Sesi berakhir',
        description: typeof error === 'string' ? error : (error).message || 'Terjadi kesalahan autentikasi',
        variant: 'destructive',
      });
      router.push('/auth/login');
    } else if (error) {
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal memuat data bahan baku. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  }, [error, router, toast]);

  // Calculate stats
  const totalIngredients = ingredients?.length ?? 0;
  const lowStockCount = ingredients?.filter((i: Row<'ingredients'>) =>
    (i.current_stock ?? 0) <= (i.min_stock ?? 0) && (i.current_stock ?? 0) > 0
  ).length ?? 0;
  const totalValue = ingredients?.reduce((sum: number, i: Row<'ingredients'>) =>
    sum + ((i.current_stock ?? 0) * (i.price_per_unit ?? 0)), 0
  ) ?? 0;
  const outOfStockCount = ingredients?.filter((i: Row<'ingredients'>) => (i.current_stock ?? 0) <= 0).length ?? 0;

  // ✅ FIX: Combine loading states
  const isLoading = isAuthLoading || loading

  // Show loading state
  if (isLoading && !ingredients) {
    return (
      <AppLayout>
        <div className="space-y-6 p-6">
          <PageBreadcrumb items={BreadcrumbPatterns.ingredients} />

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={`skeleton-${i}`} className="p-6 bg-card rounded-lg border">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-8 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div className="border rounded-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-muted rounded" />
              {[1, 2, 3, 4, 5].map(i => (
                <div key={`row-${i}`} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredients} />

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
                 hapticFeedback
               >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
               <Button
                 variant="outline"
                 onClick={() => router.push('/ingredients/purchases')}
                 className="w-full sm:w-auto"
                 hapticFeedback
               >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Pembelian
              </Button>
               <Button
                 onClick={() => setShowAddDialog(true)}
                 className="w-full sm:w-auto"
                 hapticFeedback
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
          totalValue
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

        {/* Main Content */}
        <Suspense fallback={<IngredientsCRUDSkeleton />}>
          <IngredientsCRUD onAdd={() => setShowAddDialog(true)} />
        </Suspense>

        {/* Import Dialog */}
        <Suspense fallback={null}>
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
                const response = await fetch('/api/ingredients/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ingredients: data })
                })

                const result = await response.json() as { error?: string; details?: unknown[]; count?: number }

                if (!response.ok) {
                  return {
                    success: false,
                    error: result.error ?? 'Import gagal',
                    details: result.details
                  }
                }

                // Refresh data
                router.refresh()

                return {
                  success: true,
                  count: result.count
                }
              } catch (_error) {
                return {
                  success: false,
                  error: 'Terjadi kesalahan saat import'
                }
              }
            }}
          />
        </Suspense>

        {/* Add/Edit Dialog */}
        <Suspense fallback={null}>
          <IngredientFormDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onSuccess={() => router.refresh()}
          />
        </Suspense>
      </div>
    </AppLayout>
  );
}

export default IngredientsPage

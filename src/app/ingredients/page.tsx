'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedIngredientsPage as IngredientsCRUD } from '@/components/ingredients/EnhancedIngredientsPage';
import AppLayout from '@/components/layout/app-layout';
import { StatsCards, StatCardPatterns, PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui'
import { useIngredients } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Package,
  Plus,
  ShoppingCart
} from 'lucide-react';

export default function IngredientsPage() {
  const { data: ingredients, loading, error } = useIngredients({ realtime: true });
  const { isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Handle auth errors
  useEffect(() => {
    if (error && typeof error === 'object' && (error as Error).message?.includes('401')) {
      toast({
        title: 'Sesi berakhir',
        description: typeof error === 'string' ? error : (error as Error).message || 'Terjadi kesalahan autentikasi',
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
  const totalIngredients = ingredients?.length || 0;
  const lowStockCount = ingredients?.filter(i =>
    (i.current_stock || 0) <= (i.min_stock || 0) && (i.current_stock || 0) > 0
  ).length || 0;
  const totalValue = ingredients?.reduce((sum, i) =>
    sum + ((i.current_stock || 0) * (i.price_per_unit || 0)), 0
  ) || 0;
  const outOfStockCount = ingredients?.filter(i => (i.current_stock || 0) <= 0).length || 0;

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-6">
          <PageBreadcrumb items={BreadcrumbPatterns.ingredients} />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Package className="h-7 w-7 sm:h-8 sm:w-8" />
                Bahan Baku
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola stok dan harga bahan baku
              </p>
            </div>
          </div>
          <StatsCards stats={StatCardPatterns.ingredients({ total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 })} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredients} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Package className="h-7 w-7 sm:h-8 sm:w-8" />
              Bahan Baku
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola stok dan harga bahan baku
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/ingredients/purchases')}
              className="flex-1 sm:flex-none"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pembelian
            </Button>
            <Button
              onClick={() => router.push('/ingredients/new')}
              className="flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && (
          <StatsCards stats={StatCardPatterns.ingredients({
            total: totalIngredients,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            totalValue
          })} />
        )}

        {/* Alert for Low Stock */}
        {!loading && (lowStockCount > 0 || outOfStockCount > 0) && (
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
        <IngredientsCRUD />
      </div>
    </AppLayout>
  );
}

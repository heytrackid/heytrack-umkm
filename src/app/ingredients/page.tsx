'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedIngredientsPage as IngredientsCRUD } from '@/components/ingredients/EnhancedIngredientsPage';
import AppLayout from '@/components/layout/app-layout';
import { StatsCards, StatCardPatterns, PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui'
import { useIngredients } from '@/hooks';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
    (i.current_stock || 0) <= (i.min_stock || 0)
  ).length || 0;
  const totalValue = ingredients?.reduce((sum, i) =>
    sum + ((i.current_stock || 0) * (i.price_per_unit || 0)), 0
  ) || 0;
  const outOfStockCount = ingredients?.filter(i => (i.current_stock || 0) <= 0).length || 0;

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <PageBreadcrumb items={BreadcrumbPatterns.ingredients} />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Package className="h-8 w-8" />
                Bahan Baku
              </h1>
              <p className="text-muted-foreground">
                Kelola stok dan harga bahan baku untuk produksi
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
      <div className="space-y-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredients} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Bahan Baku
            </h1>
            <p className="text-muted-foreground">
              Kelola stok dan harga bahan baku untuk produksi
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/ingredients/purchases')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pembelian
            </button>
            <button
              onClick={() => router.push('/ingredients/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan Baku
            </button>
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
        {!loading && lowStockCount > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900 text-sm mb-1">
                  Peringatan Stok Rendah
                </h3>
                <p className="text-sm text-orange-700">
                  {lowStockCount} bahan baku mencapai atau di bawah stok minimum. Segera lakukan pemesanan untuk menghindari kehabisan stok.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg border">
          <IngredientsCRUD />
        </div>
      </div>
    </AppLayout>
  );
}

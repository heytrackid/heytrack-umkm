'use client';

import { IngredientsCRUD } from '@/components/crud/ingredients-crud';
import { Package, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { useIngredients } from '@/hooks/useSupabaseCRUD';
import { useSettings } from '@/contexts/settings-context';

export default function IngredientsPage() {
  const { data: ingredients, loading } = useIngredients({ refetchOnMount: true });
  const { formatCurrency } = useSettings();

  // Calculate stats
  const totalIngredients = ingredients?.length || 0;
  const lowStockCount = ingredients?.filter(i => 
    i.current_stock <= (i.minimum_stock || 0)
  ).length || 0;
  const totalValue = ingredients?.reduce((sum, i) => 
    sum + (i.current_stock * i.price_per_unit), 0
  ) || 0;
  const outOfStockCount = ingredients?.filter(i => i.current_stock <= 0).length || 0;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          📦 Bahan Baku
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Kelola stok dan harga bahan baku untuk produksi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {loading ? '...' : totalIngredients}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Total Bahan
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {loading ? '...' : lowStockCount}
          </p>
          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
            Stok Rendah
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            {loading ? '...' : outOfStockCount}
          </p>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            Habis
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg md:text-xl font-bold text-green-900 dark:text-green-100 truncate">
            {loading ? '...' : formatCurrency(totalValue)}
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Nilai Total
          </p>
        </div>
      </div>

      {/* Alert for Low Stock */}
      {!loading && lowStockCount > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-100 text-sm">
                ⚠️ Peringatan Stok Rendah
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {lowStockCount} bahan baku mencapai atau di bawah stok minimum. Segera lakukan pemesanan untuk menghindari kehabisan stok.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <IngredientsCRUD />
      </div>
    </div>
  );
}

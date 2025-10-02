'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { IngredientsCRUD } from '@/components/crud/ingredients-crud';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIngredients } from '@/hooks/useSupabaseCRUD';
import { useSettings } from '@/contexts/settings-context';
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading';
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Plus
} from 'lucide-react';

export default function IngredientsPage() {
  // Share single useIngredients hook call - IngredientsCRUD will use this
  const { data: ingredients, loading } = useIngredients({ refetchOnMount: false });
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
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Bahan Baku</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

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
          <Button onClick={() => window.location.href = '/ingredients/new'}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan Baku
          </Button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bahan
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalIngredients}</div>
                <p className="text-xs text-muted-foreground">
                  Jenis bahan baku terdaftar
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stok Rendah
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Perlu segera dipesan
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stok Habis
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{outOfStockCount}</div>
                <p className="text-xs text-muted-foreground">
                  Bahan tidak tersedia
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Nilai Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Total nilai inventori
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alert for Low Stock */}
        {!loading && lowStockCount > 0 && (
          <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 text-sm mb-1">
                    Peringatan Stok Rendah
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {lowStockCount} bahan baku mencapai atau di bawah stok minimum. Segera lakukan pemesanan untuk menghindari kehabisan stok.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            <IngredientsCRUD />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

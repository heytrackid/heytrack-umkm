'use client'

import { useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import PrefetchLink from '@/components/ui/prefetch-link'
import { ShoppingCart } from 'lucide-react'
import { apiLogger as _apiLogger } from '@/lib/logger'
import { useAuth } from '@/hooks'
import { useToast } from '@/hooks/use-toast'
import { useIngredients } from '@/hooks/useIngredients'
import { useIngredientPurchases, useCreateIngredientPurchase } from '@/hooks/useIngredientPurchases'
import PurchaseStats from './PurchaseStats'
import PurchaseForm from './PurchaseForm'
import PurchasesTable from './PurchasesTable'
import type { IngredientPurchase as _IngredientPurchase, AvailableIngredient as _AvailableIngredient } from './types'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'


const IngredientPurchasesLayout = () => {
  const { data: purchases = [], isLoading: _purchasesLoading } = useIngredientPurchases()
  const { data: ingredients = [], isLoading: _ingredientsLoading } = useIngredients()
  const createPurchase = useCreateIngredientPurchase()
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
    }
  }, [isAuthLoading, isAuthenticated, toast])

  const handlePurchaseSubmit = async (formData: {
    ingredient_id: string;
    quantity: number;
    unit_price: number;
    supplier?: string;
    purchase_date?: string;
    notes?: string;
  }) => {
    const totalPrice = formData.quantity * formData.unit_price;

    // Note: user_id will be handled by the API route authentication
    await createPurchase.mutateAsync({
      ...formData,
      total_price: totalPrice,
      user_id: 'temp' // Will be overridden by API
    } as typeof formData & { total_price: number; user_id: string })
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/ingredients">Bahan Baku</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pembelian</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Pembelian Bahan Baku</h1>
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/ingredients">Bahan Baku</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pembelian</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Pembelian Bahan Baku
            </h1>
            <p className="text-muted-foreground">
              Kelola riwayat pembelian bahan baku
            </p>
          </div>

          {/* Purchase Form - Lazy Loaded */}
          <PurchaseForm
            ingredients={ingredients}
            onSubmit={handlePurchaseSubmit}
            onSuccess={() => { }}
          />
        </div>

        {/* Purchase Stats - Lazy Loaded */}
        <PurchaseStats purchases={purchases} />

        {/* Purchases Table - Lazy Loaded */}
        <PurchasesTable purchases={purchases} />
      </div>
    </AppLayout>
  )
}

export default IngredientPurchasesLayout

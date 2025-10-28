// Ingredient Purchases Layout - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded purchase management components

'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import PrefetchLink from '@/components/ui/prefetch-link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { ShoppingCart } from 'lucide-react'
import { apiLogger } from '@/lib/logger'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

// Lazy load components
import dynamic from 'next/dynamic'

const PurchaseStats = dynamic(
  () => import(/* webpackChunkName: "purchase-stats" */ './PurchaseStats'),
  {
    loading: () => <div>Loading stats...</div>
  }
)

const PurchaseForm = dynamic(
  () => import(/* webpackChunkName: "purchase-form" */ './PurchaseForm'),
  {
    loading: () => <div>Loading form...</div>
  }
)

const PurchasesTable = dynamic(
  () => import(/* webpackChunkName: "purchases-table" */ './PurchasesTable'),
  {
    loading: () => <div>Loading table...</div>
  }
)

import type { IngredientPurchase, AvailableIngredient } from './types'

export default function IngredientPurchasesLayout() {
  const [purchases, setPurchases] = useState<IngredientPurchase[]>([])
  const [ingredients, setIngredients] = useState<AvailableIngredient[]>([])
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

  // ✅ OPTIMIZED: Use TanStack Query hooks (to be implemented)
  // For now, keep existing fetch but add TODO comment
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      void fetchPurchases()
      void fetchIngredients()
    }
  }, [isAuthLoading, isAuthenticated])

  // TODO: Replace with useIngredientPurchases() hook
  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/ingredient-purchases')
      if (response.ok) {
        const data = await response.json()
        void setPurchases(data)
      }
    } catch (err: unknown) {
      apiLogger.error({ err }, 'Error fetching purchases:')
    }
  }

  // TODO: Replace with useIngredients() hook
  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (response.ok) {
        const data = await response.json()
        void setIngredients(data.ingredients || [])
      }
    } catch (err: unknown) {
      apiLogger.error({ err }, 'Error fetching ingredients:')
    }
  }

  const handlePurchaseSubmit = async (formData: {
    ingredient_id: string;
    quantity: number;
    unit_price: number;
    supplier?: string;
    purchase_date?: string;
    notes?: string;
  }) => {
    const totalPrice = formData.quantity * formData.unit_price;

    const response = await fetch('/api/ingredient-purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        total_price: totalPrice
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create purchase')
    }

    await fetchPurchases()
    await fetchIngredients() // Refresh untuk update WAC
    alert('Pembelian berhasil ditambahkan! Stock dan WAC telah diperbarui.')
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

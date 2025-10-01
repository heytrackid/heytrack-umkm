'use client'

import React from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import {
  ArrowLeft,
  ShoppingCart,
  User,
  CreditCard,
  Truck,
  Package,
  AlertCircle
} from 'lucide-react'

// Import hooks and lazy components
import { useOrderLogic } from './hooks/useOrderLogic'
import { 
  LazyOrderCustomer,
  LazyOrderItems,
  LazyOrderDelivery,
  LazyOrderPayment,
  LazyOrderSummary,
  preloadOrderComponents
} from './components/LazyOrderComponents'
import { AuthFormSkeleton } from '@/components/ui/skeletons/form-skeletons'

export default function NewOrderPage() {
  const {
    // State
    formData,
    orderItems,
    availableRecipes,
    customers,
    isSubmitting,
    error,
    activeTab,
    loading, // Add loading state
    
    // Calculated values
    subtotal,
    taxAmount,
    totalAmount,
    
    // Handlers
    handleInputChange,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    selectCustomer,
    handleSubmit,
    setActiveTab,
    setError,
    
    // Navigation
    router
  } = useOrderLogic()

  // Preload components on tab hover
  const handleTabHover = (tabValue: string) => {
    const preloader = preloadOrderComponents[tabValue as keyof typeof preloadOrderComponents]
    if (preloader) {
      preloader().catch(() => {})
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>

          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-9 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <AuthFormSkeleton />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <LazyOrderComponents activeTab={activeTab} />
      
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/orders">Pesanan</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pesanan Baru</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-8 w-8" />
                Buat Pesanan Baru
              </h1>
              <p className="text-muted-foreground">
                Tambahkan pesanan baru dari pelanggan
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger 
                        value="customer" 
                        className="flex items-center gap-2"
                        onMouseEnter={() => handleTabHover('customer')}
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Pelanggan</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="items" 
                        className="flex items-center gap-2"
                        onMouseEnter={() => handleTabHover('items')}
                      >
                        <Package className="h-4 w-4" />
                        <span className="hidden sm:inline">Items</span>
                        {orderItems.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {orderItems.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="delivery" 
                        className="flex items-center gap-2"
                        onMouseEnter={() => handleTabHover('delivery')}
                      >
                        <Truck className="h-4 w-4" />
                        <span className="hidden sm:inline">Pengiriman</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="payment" 
                        className="flex items-center gap-2"
                        onMouseEnter={() => handleTabHover('payment')}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Pembayaran</span>
                      </TabsTrigger>
                    </TabsList>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </div>
                    )}

                    <TabsContent value="customer" className="mt-6">
                      <LazyOrderCustomer
                        formData={formData}
                        customers={customers}
                        onInputChange={handleInputChange}
                        onSelectCustomer={selectCustomer}
                      />
                    </TabsContent>

                    <TabsContent value="items" className="mt-6">
                      <LazyOrderItems
                        orderItems={orderItems}
                        availableRecipes={availableRecipes}
                        subtotal={subtotal}
                        onAddItem={addOrderItem}
                        onUpdateItem={updateOrderItem}
                        onRemoveItem={removeOrderItem}
                      />
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6">
                      <LazyOrderDelivery
                        formData={formData}
                        onInputChange={handleInputChange}
                      />
                    </TabsContent>

                    <TabsContent value="payment" className="mt-6">
                      <LazyOrderPayment
                        formData={formData}
                        onInputChange={handleInputChange}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <LazyOrderSummary
                  formData={formData}
                  orderItems={orderItems}
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  totalAmount={totalAmount}
                  isSubmitting={isSubmitting}
                  onSubmit={(e: React.FormEvent) => handleSubmit(e)}
                  onCancel={() => router.back()}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import PrefetchLink from '@/components/ui/prefetch-link'
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
import { StepSkeleton } from '@/components/ui/StepSkeleton'
import { OrderFormSkeleton } from '@/components/ui/skeletons/form-skeletons'

// Import hooks
import { useOrderLogic } from './hooks/useOrderLogic'

// ============= DYNAMIC IMPORTS (CODE SPLITTING) =============
const OrderCustomerStep = dynamic(
  () => import('./_components/OrderCustomerStep'),
  { 
    loading: () => <StepSkeleton />,
    ssr: false
  }
)

const OrderItemsStep = dynamic(
  () => import('./_components/OrderItemsStep'),
  { 
    loading: () => <StepSkeleton />,
    ssr: false
  }
)

const OrderDeliveryStep = dynamic(
  () => import('./_components/OrderDeliveryStep'),
  { 
    loading: () => <StepSkeleton />,
    ssr: false
  }
)

const OrderPaymentStep = dynamic(
  () => import('./_components/OrderPaymentStep'),
  { 
    loading: () => <OrderFormSkeleton />,
    ssr: false
  }
)

const OrderSummary = dynamic(
  () => import('./_components/OrderSummary'),
  { 
    loading: () => <OrderFormSkeleton />,
    ssr: false
  }
)

// ============= MAIN PAGE COMPONENT =============

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
    loading,
    
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

  if (loading) {
    return (
      <AppLayout>
        <OrderFormSkeleton />
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
                <PrefetchLink href="/orders">Pesanan</PrefetchLink>
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
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Pelanggan</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="items" 
                        className="flex items-center gap-2"
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
                      >
                        <Truck className="h-4 w-4" />
                        <span className="hidden sm:inline">Pengiriman</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="payment" 
                        className="flex items-center gap-2"
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
                      <OrderCustomerStep
                        formData={formData}
                        customers={customers}
                        onInputChange={handleInputChange}
                        onSelectCustomer={selectCustomer}
                      />
                    </TabsContent>

                    <TabsContent value="items" className="mt-6">
                      <OrderItemsStep
                        orderItems={orderItems}
                        availableRecipes={availableRecipes}
                        subtotal={subtotal}
                        onAddItem={addOrderItem}
                        onUpdateItem={updateOrderItem}
                        onRemoveItem={removeOrderItem}
                      />
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-6">
                      <OrderDeliveryStep
                        formData={formData}
                        onInputChange={handleInputChange}
                      />
                    </TabsContent>

                    <TabsContent value="payment" className="mt-6">
                      <OrderPaymentStep
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
                <OrderSummary
                  formData={formData}
                  orderItems={orderItems}
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  totalAmount={totalAmount}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
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

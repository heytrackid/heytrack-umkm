'use client'

import PrefetchLink from '@/components/ui/prefetch-link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { Badge } from '@/components/ui/badge'
import { OrderFormSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { useOrderLogic } from './hooks/useOrderLogic'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { ArrowLeft, ShoppingCart, User, CreditCard, Truck, Package, AlertCircle } from 'lucide-react'

// Lazy load wizard step components
const OrderCustomerStep = dynamic(() => import('./_components/OrderCustomerStep'), {
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="h-32 bg-muted animate-pulse rounded" />
    </div>
  )
})

const OrderItemsStep = dynamic(() => import('./_components/OrderItemsStep'), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-12 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
})

const OrderDeliveryStep = dynamic(() => import('./_components/OrderDeliveryStep'), {
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
})

const OrderPaymentStep = dynamic(() => import('./_components/OrderPaymentStep'), {
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
})

const OrderSummary = dynamic(() => import('./_components/OrderSummary'), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-32 bg-muted animate-pulse rounded" />
      <div className="flex gap-2">
        <div className="h-10 bg-muted animate-pulse rounded flex-1" />
        <div className="h-10 bg-muted animate-pulse rounded w-20" />
      </div>
    </div>
  )
}) 

const NewOrderPage = () => {
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
    reorderOrderItems,
    selectCustomer,
    handleSubmit,
    setActiveTab,
    // setError, // Not used in this component

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
          <div className="space-y-6">
            {/* Main Form */}
            <Card>
              <CardContent className="p-6">
                <SwipeableTabs value={activeTab} onValueChange={setActiveTab}>
                  <SwipeableTabsList className="grid w-full grid-cols-4">
                    <SwipeableTabsTrigger
                      value="customer"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Pelanggan</span>
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger
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
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger
                      value="delivery"
                      className="flex items-center gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      <span className="hidden sm:inline">Pengiriman</span>
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger
                      value="payment"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline">Pembayaran</span>
                    </SwipeableTabsTrigger>
                  </SwipeableTabsList>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                   <SwipeableTabsContent value="customer" className="mt-6">
                     <Suspense fallback={
                       <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[...Array(4)].map((_, i) => (
                             <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                           ))}
                         </div>
                         <div className="h-32 bg-muted animate-pulse rounded" />
                       </div>
                     }>
                       <OrderCustomerStep
                         formData={formData}
                         customers={customers}
                         onInputChange={handleInputChange}
                         onSelectCustomer={selectCustomer}
                       />
                     </Suspense>
                   </SwipeableTabsContent>

                   <SwipeableTabsContent value="items" className="mt-6">
                     <Suspense fallback={
                       <div className="space-y-4">
                         <div className="h-12 bg-muted animate-pulse rounded" />
                         <div className="space-y-3">
                           {[...Array(3)].map((_, i) => (
                             <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                           ))}
                         </div>
                       </div>
                     }>
                       <OrderItemsStep
                         orderItems={orderItems}
                         availableRecipes={availableRecipes}
                         subtotal={subtotal}
                         onAddItem={addOrderItem}
                         onUpdateItem={updateOrderItem}
                         onRemoveItem={removeOrderItem}
                         onReorderItems={reorderOrderItems}
                       />
                     </Suspense>
                   </SwipeableTabsContent>

                   <SwipeableTabsContent value="delivery" className="mt-6">
                     <Suspense fallback={
                       <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[...Array(6)].map((_, i) => (
                             <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                           ))}
                         </div>
                       </div>
                     }>
                       <OrderDeliveryStep
                         formData={formData}
                         onInputChange={handleInputChange}
                       />
                     </Suspense>
                   </SwipeableTabsContent>

                   <SwipeableTabsContent value="payment" className="mt-6">
                     <Suspense fallback={
                       <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[...Array(4)].map((_, i) => (
                             <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                           ))}
                         </div>
                       </div>
                     }>
                       <OrderPaymentStep
                         formData={formData}
                         onInputChange={handleInputChange}
                       />
                     </Suspense>
                   </SwipeableTabsContent>
                </SwipeableTabs>
              </CardContent>
            </Card>

            {/* Order Summary - No longer sidebar */}
            <Card>
              <CardContent className="p-6">
                <Suspense fallback={
                  <div className="space-y-4">
                    <div className="h-32 bg-muted animate-pulse rounded" />
                    <div className="flex gap-2">
                      <div className="h-10 bg-muted animate-pulse rounded flex-1" />
                      <div className="h-10 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </div>
                }>
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
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

export default NewOrderPage

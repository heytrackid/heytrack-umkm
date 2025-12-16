'use client'

import { ArrowLeft, User, CreditCard, Truck, Package, AlertCircle } from '@/components/icons'

import { useOrderLogic } from '@/app/orders/new/hooks/useOrderLogic'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { OrderFormSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { OrderCustomerStep } from './_components/OrderCustomerStep'
import { OrderItemsStep } from './_components/OrderItemsStep'
import { OrderDeliveryStep } from './_components/OrderDeliveryStep'
import { OrderPaymentStep } from './_components/OrderPaymentStep'
import { OrderSummary } from './_components/OrderSummary'

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

  if (isSubmitting) {
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

        <PageHeader
          title="Buat Pesanan Baru"
          description="Tambahkan pesanan baru dari pelanggan"
          breadcrumbs={[
            { label: 'Pesanan', href: '/orders' },
            { label: 'Pesanan Baru' }
          ]}
          action={
            <Button
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          }
        />

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
                      className="flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">Pelanggan</span>
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger
                      value="items"
                      className="flex flex-col sm:flex-row sm:items-center gap-2"
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
                      className="flex flex-col sm:flex-row sm:items-center gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      <span className="hidden sm:inline">Pengiriman</span>
                    </SwipeableTabsTrigger>
                    <SwipeableTabsTrigger
                      value="payment"
                      className="flex flex-col sm:flex-row sm:items-center gap-2"
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
                      <OrderCustomerStep
                        formData={formData}
                        customers={customers}
                        onInputChange={handleInputChange}
                        onSelectCustomer={selectCustomer}
                      />
                   </SwipeableTabsContent>

                    <SwipeableTabsContent value="items" className="mt-6">
                      <OrderItemsStep
                        orderItems={orderItems}
                        availableRecipes={availableRecipes}
                        subtotal={subtotal}
                        onAddItem={addOrderItem}
                        onUpdateItem={updateOrderItem}
                        onRemoveItem={removeOrderItem}
                        onReorderItems={reorderOrderItems}
                      />
                   </SwipeableTabsContent>

                    <SwipeableTabsContent value="delivery" className="mt-6">
                      <OrderDeliveryStep
                        formData={formData}
                        onInputChange={handleInputChange}
                      />
                   </SwipeableTabsContent>

                     <SwipeableTabsContent value="payment" className="mt-6">
                      <OrderPaymentStep
                        formData={formData}
                        onInputChange={handleInputChange}
                      />
                   </SwipeableTabsContent>
                </SwipeableTabs>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

export default NewOrderPage
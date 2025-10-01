'use client'

import React from 'react'
import dynamic from 'next/dynamic'
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
import { Skeleton } from '@/components/ui/skeleton'

// Import hooks
import { useOrderLogic } from './hooks/useOrderLogic'
import { AuthFormSkeleton } from '@/components/ui/skeletons/form-skeletons'

// ============= LOADING SKELETONS =============
const StepSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
)

const SummarySkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
)

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
    loading: () => <StepSkeleton />,
    ssr: false
  }
)

const OrderSummary = dynamic(
  () => import('./_components/OrderSummary'),
  { 
    loading: () => <SummarySkeleton />,
    ssr: false
  }
)

// Customer Step Component
function OrderCustomerStep({
  formData,
  customers,
  onInputChange,
  onSelectCustomer
}: {
  formData: OrderFormData
  customers: any[]
  onInputChange: (field: keyof OrderFormData, value: any) => void
  onSelectCustomer: (customer: any) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Informasi Pelanggan</h3>
        {customers.length > 0 && (
          <Select onValueChange={(value) => {
            const customer = customers.find(c => c.id === value)
            if (customer) onSelectCustomer(customer)
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_name">Nama Pelanggan *</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => onInputChange('customer_name', e.target.value)}
            placeholder="Nama lengkap pelanggan"
            required
          />
        </div>
        <div>
          <Label htmlFor="customer_phone">No. Telepon</Label>
          <Input
            id="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => onInputChange('customer_phone', e.target.value)}
            placeholder="08123456789"
          />
        </div>
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={(e) => onInputChange('customer_email', e.target.value)}
            placeholder="customer@email.com"
          />
        </div>
        <div>
          <Label htmlFor="order_date">Tanggal Pesan *</Label>
          <Input
            id="order_date"
            type="date"
            value={formData.order_date}
            onChange={(e) => onInputChange('order_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customer_address">Alamat Pelanggan</Label>
        <Textarea
          id="customer_address"
          value={formData.customer_address}
          onChange={(e) => onInputChange('customer_address', e.target.value)}
          placeholder="Alamat lengkap pelanggan..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Prioritas</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => onInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Rendah</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}
            placeholder="Catatan tambahan..."
          />
        </div>
      </div>
    </div>
  )
}

// Items Step Component
function OrderItemsStep({
  orderItems,
  availableRecipes,
  subtotal,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}: {
  orderItems: OrderItem[]
  availableRecipes: any[]
  subtotal: number
  onAddItem: () => void
  onUpdateItem: (index: number, field: keyof OrderItem, value: any) => void
  onRemoveItem: (index: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Item Pesanan</h3>
        <Button type="button" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Item
        </Button>
      </div>

      {orderItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada item ditambahkan</p>
          <p className="text-sm">Klik "Tambah Item" untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <div>
                  <Label className="text-xs">Produk</Label>
                  <Select
                    value={item.recipe_id}
                    onValueChange={(value) => onUpdateItem(index, 'recipe_id', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRecipes.map(recipe => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Jumlah</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateItem(index, 'quantity', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Harga Satuan</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => onUpdateItem(index, 'unit_price', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Total</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium">
                    Rp {item.total_price.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <Label className="text-xs">Permintaan Khusus</Label>
                <Input
                  value={item.special_requests || ''}
                  onChange={(e) => onUpdateItem(index, 'special_requests', e.target.value)}
                  placeholder="Permintaan khusus untuk item ini..."
                  className="mt-1"
                />
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="text-right text-lg font-semibold">
              Subtotal: Rp {subtotal.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Delivery Step Component
function OrderDeliveryStep({
  formData,
  onInputChange
}: {
  formData: OrderFormData
  onInputChange: (field: keyof OrderFormData, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pengiriman & Jadwal</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delivery_method">Metode Pengiriman</Label>
          <Select 
            value={formData.delivery_method} 
            onValueChange={(value) => onInputChange('delivery_method', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Ambil di Toko</SelectItem>
              <SelectItem value="delivery">Diantar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.delivery_method === 'delivery' && (
          <div>
            <Label htmlFor="delivery_fee">Biaya Pengiriman</Label>
            <Input
              id="delivery_fee"
              type="number"
              min="0"
              value={formData.delivery_fee}
              onChange={(e) => onInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
              placeholder="15000"
            />
          </div>
        )}

        <div>
          <Label htmlFor="delivery_date">Tanggal Pengiriman</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={(e) => onInputChange('delivery_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="delivery_time">Waktu Pengiriman</Label>
          <Input
            id="delivery_time"
            type="time"
            value={formData.delivery_time}
            onChange={(e) => onInputChange('delivery_time', e.target.value)}
          />
        </div>
      </div>

      {formData.delivery_method === 'delivery' && (
        <div>
          <Label htmlFor="delivery_address">Alamat Pengiriman</Label>
          <Textarea
            id="delivery_address"
            value={formData.delivery_address}
            onChange={(e) => onInputChange('delivery_address', e.target.value)}
            placeholder="Alamat lengkap untuk pengiriman..."
            rows={3}
          />
        </div>
      )}

      <div>
        <Label htmlFor="special_instructions">Instruksi Khusus</Label>
        <Textarea
          id="special_instructions"
          value={formData.special_instructions}
          onChange={(e) => onInputChange('special_instructions', e.target.value)}
          placeholder="Instruksi khusus untuk produksi atau pengiriman..."
          rows={3}
        />
      </div>
    </div>
  )
}

// Payment Step Component
function OrderPaymentStep({
  formData,
  onInputChange
}: {
  formData: OrderFormData
  onInputChange: (field: keyof OrderFormData, value: any) => void
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pembayaran</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_method">Metode Pembayaran</Label>
          <Select 
            value={formData.payment_method} 
            onValueChange={(value) => onInputChange('payment_method', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="transfer">Transfer Bank</SelectItem>
              <SelectItem value="credit_card">Kartu Kredit</SelectItem>
              <SelectItem value="digital_wallet">E-Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="discount_amount">Diskon</Label>
          <Input
            id="discount_amount"
            type="number"
            min="0"
            value={formData.discount_amount}
            onChange={(e) => onInputChange('discount_amount', parseFloat(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="tax_rate">Pajak (%)</Label>
          <Input
            id="tax_rate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.tax_rate}
            onChange={(e) => onInputChange('tax_rate', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  )
}

// Order Summary Component
function OrderSummary({
  formData,
  orderItems,
  subtotal,
  taxAmount,
  totalAmount,
  isSubmitting,
  onSubmit,
  onCancel
}: {
  formData: OrderFormData
  orderItems: OrderItem[]
  subtotal: number
  taxAmount: number
  totalAmount: number
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}) {
  const { formatCurrency } = useCurrency()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span>- {formatCurrency(formData.discount_amount)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Pajak ({formData.tax_rate}%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          
          {formData.delivery_method === 'delivery' && (
            <div className="flex justify-between">
              <span>Biaya Kirim:</span>
              <span>{formatCurrency(formData.delivery_fee)}</span>
            </div>
          )}
          
          <hr className="my-2" />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{orderItems.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Qty Total:</span>
              <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status Awal:</span>
              <Badge variant="outline">PENDING</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || orderItems.length === 0}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <>Menyimpan...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Pesanan
              </>
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={onCancel}
          >
            Batal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

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

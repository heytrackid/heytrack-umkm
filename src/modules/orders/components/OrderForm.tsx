 
'use client'

import { useRecipes } from '@/hooks/useRecipes'
import { useCustomersList } from '@/hooks/useCustomers'
import { AlertCircle, Package, Plus, Trash2 } from '@/components/icons'
import { memo, useCallback, useMemo, useState, type FormEvent } from 'react'

import type { Order, OrderFormProps, OrderItemWithRecipe, PaymentMethod } from '@/app/orders/types/orders-db.types'
import { useOrderItemsController } from '@/components/orders/hooks/useOrderItemsController'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingButton } from '@/components/ui/loading-button'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { Textarea } from '@/components/ui/textarea'
import { warningToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { ORDER_CONFIG, ORDER_PRIORITIES } from '@/lib/constants/index'
import { safeNumber } from '@/lib/type-guards'
import { calculateOrderTotals, generateOrderNo } from '@/modules/orders/utils/helpers'

import type { Row } from '@/types/database'


type Customer = Row<'customers'>

interface FormState {
  customer_name: string
  customer_phone: string
  customer_address: string
  order_date: string
  delivery_date: string
  delivery_time: string
  delivery_fee: number
  discount: number
  tax_amount: number
  payment_method: PaymentMethod
  paid_amount: number
  priority: Order['priority']
  notes: string
  special_instructions: string
}

// Removed: parseNumberInput - now using safeNumber from type-guards

export const OrderForm = memo(({ order, onSubmit, onCancel, loading = false, error }: OrderFormProps) => {
  const { formatCurrency } = useCurrency()
  const [customerSearch, setCustomerSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)

  const [formData, setFormData] = useState<FormState>({
    customer_name: order?.customer_name ?? '',
    customer_phone: order?.customer_phone ?? '',
    customer_address: order?.customer_address ?? '',
    order_date: order?.order_date ?? (new Date().toISOString().split('T')[0] ?? ''),
    delivery_date: order?.delivery_date ?? '',
    delivery_time: order?.delivery_date?.includes('T')
      ? order.delivery_date.split('T')[1]?.slice(0, 5) ?? ''
      : '',
    delivery_fee: order?.delivery_fee ?? ORDER_CONFIG.DEFAULT_DELIVERY_FEE,
    discount: order?.discount ?? 0,
    tax_amount: order?.tax_amount ?? ORDER_CONFIG.DEFAULT_TAX_RATE,
    payment_method: 'CASH',
    paid_amount: order?.paid_amount ?? 0,
    priority: order?.priority ?? ORDER_CONFIG.DEFAULT_PRIORITY,
    notes: order?.notes ?? '',
    special_instructions: order?.special_instructions ?? ''
  })

  const [orderItems, setOrderItems] = useState<OrderItemWithRecipe[]>(order?.items ?? [])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { subtotal, taxAmount, totalAmount } = calculateOrderTotals(
    orderItems,
    formData.discount,
    formData.tax_amount,
    formData.delivery_fee
  )

  // Fetch data
  // ✅ Use standardized recipes hook
  const { data: recipesData = [] } = useRecipes()

  // ✅ Use standardized customers hook
  const { data: customersData = [] } = useCustomersList()

  // Use data directly from query (no need for local state)
  const availableRecipes = useMemo(() => recipesData || [], [recipesData])
  const availableCustomers = useMemo(() => customersData || [], [customersData])

  const createEmptyOrderItem = useCallback((): OrderItemWithRecipe => {
    const firstRecipe = availableRecipes[0]
    const unitPrice = firstRecipe?.selling_price ?? 0
    const cost = firstRecipe?.cost_per_unit ?? 0

    return {
      id: `temp-${Date.now()}`,
      order_id: order?.id ?? '',
      recipe_id: firstRecipe?.['id'] ?? '',
      product_name: firstRecipe?.name ?? null,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
      special_requests: null,
      hpp_at_order: cost,
      profit_amount: unitPrice - cost,
      profit_margin: unitPrice > 0 ? (((unitPrice - cost) / unitPrice) * 100) : 0,
      updated_at: null,
      user_id: order?.user_id ?? '',
      ...(firstRecipe && {
        recipe: {
          id: firstRecipe['id'],
          name: firstRecipe.name,
          price: unitPrice,
          category: firstRecipe.category ?? 'Unknown',
          servings: firstRecipe.batch_size ?? 1,
          ...(firstRecipe.description && { description: firstRecipe.description })
        }
      })
    }
  }, [availableRecipes, order?.id, order?.user_id])

  const {
    addItem: pushOrderItem,
    updateItem: applyOrderItemUpdate,
    removeItem: removeOrderItem,
    selectRecipe: handleRecipeSelect
  } = useOrderItemsController<OrderItemWithRecipe>({
    items: orderItems,
    onItemsChange: setOrderItems,
    createEmptyItem: createEmptyOrderItem,
    availableRecipes,
    onRecipeSelected: (recipe, currentItem) => {
      const unitPrice = recipe.selling_price ?? currentItem.unit_price
      const cost = recipe.cost_per_unit ?? currentItem.hpp_at_order ?? 0

      return {
        ...currentItem,
        recipe_id: recipe['id'],
        product_name: recipe.name,
        recipe: {
          id: recipe['id'],
          name: recipe.name,
          price: unitPrice,
          category: recipe.category ?? 'Uncategorized',
          servings: recipe.servings ?? 0,
          ...(recipe.description && { description: recipe.description })
        },
        unit_price: unitPrice,
        total_price: unitPrice * currentItem.quantity,
        hpp_at_order: cost,
        profit_amount: unitPrice - cost,
        profit_margin: unitPrice > 0 ? (((unitPrice - cost) / unitPrice) * 100) : 0
      }
    },
    deriveItemTotals: (item) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unit_price) || 0
      const cost = Number(item.hpp_at_order ?? 0)
      const total = quantity * unitPrice
      const profit = unitPrice - cost

      return {
        ...item,
        total_price: total,
        profit_amount: profit,
        profit_margin: unitPrice > 0 ? ((profit / unitPrice) * 100) : 0
      }
    }
  })

  let submitButtonLabel = 'Simpan Pesanan'
  if (order) {
    submitButtonLabel = 'Update Pesanan'
  }
  if (loading) {
    submitButtonLabel = 'Menyimpan...'
  }

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectCustomer = (customer: Customer | undefined) => {
    if (!customer) { return }
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone ?? '',
      customer_address: customer.address ?? ''
    }))
    setCustomerSearch('')
  }

  const addOrderItem = () => {
    if (availableRecipes.length === 0) {
      warningToast('Resep tidak tersedia', 'Tambahkan resep baru sebelum membuat item pesanan')
      return
    }
    pushOrderItem()
  }

  const updateOrderItem = <K extends keyof OrderItemWithRecipe>(
    index: number,
    field: K,
    value: OrderItemWithRecipe[K] | string
  ) => {
    if (field === 'recipe_id') {
      handleRecipeSelect(index, value as string)
      return
    }

    let nextValue = value

    if (typeof value === 'string' && (field === 'quantity' || field === 'unit_price')) {
      nextValue = Number(value) as OrderItemWithRecipe[K]
    }

    applyOrderItemUpdate(index, field, nextValue as OrderItemWithRecipe[K])
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors: Record<string, string> = {}

    if (!formData['customer_name'].trim()) {
      errors['customer_name'] = 'Nama pelanggan wajib diisi'
    }

    if (orderItems.length === 0) {
      errors['items'] = 'Minimal harus ada 1 item pesanan'
    }

    if (formData.paid_amount > totalAmount) {
      errors['paid_amount'] = 'Jumlah dibayar tidak boleh lebih dari total tagihan'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      warningToast('Data belum lengkap', 'Periksa kembali form yang ditandai merah')
      return
    }

    setFieldErrors({})

    const orderData = {
      order_no: order?.order_no ?? generateOrderNo(),
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      status: order?.status ?? 'PENDING',
      order_date: formData.order_date,
      delivery_date: formData.delivery_date,
      delivery_time: formData.delivery_time,
      delivery_fee: formData.delivery_fee,
      discount_amount: formData.discount,
      tax_rate: formData.tax_amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: formData.paid_amount,
      payment_method: formData.payment_method,
      priority: formData.priority ?? 'NORMAL',
      notes: formData.notes,
      special_instructions: formData.special_instructions,
      items: orderItems.map(item => ({
        recipe_id: item.recipe_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        notes: item.special_requests ?? ''
      }))
    }

    await onSubmit(orderData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <SwipeableTabs defaultValue="customer" className="w-full">
        <SwipeableTabsList>
          <SwipeableTabsTrigger value="customer" className="text-xs sm:text-sm">Pelanggan</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="items" className="text-xs sm:text-sm">Item ({orderItems.length})</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="delivery" className="text-xs sm:text-sm">Pengiriman</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="payment" className="text-xs sm:text-sm">Pembayaran</SwipeableTabsTrigger>
        </SwipeableTabsList>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <SwipeableTabsContent value="customer" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <h3 className="text-lg font-medium">Data Pelanggan</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewCustomer(!showNewCustomer)}
              className="self-end sm:self-auto"
            >
              {showNewCustomer ? "Batalkan" : "Pelanggan Baru"}
            </Button>
          </div>

          {!showNewCustomer && (
            <div>
              <Label className="text-sm font-medium">Cari Pelanggan</Label>
              <div className="relative">
                <Input
                  placeholder="Ketik nama atau nomor telepon..."
                  value={customerSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearch(e.target.value)}
                  className="mt-1"
                />
                {customerSearch && (
                  <div className="absolute z-10 w-full bg-background border rounded-md mt-1 max-h-40 overflow-y-auto">
                    {availableCustomers
                      .filter(customer =>
                        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        (customer.phone?.includes(customerSearch))
                      )
                      .map(customer => (
                        <div
                          key={customer['id']}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectCustomer(customer)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              selectCustomer(customer)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium">Nama Pelanggan *</Label>
              <Input
                id="customerName"
                placeholder="Contoh: Ibu Siti"
                value={formData['customer_name']}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputChange('customer_name', e.target.value)
                  if (fieldErrors['customer_name']) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors['customer_name']
                      return newErrors
                    })
                  }
                }}
                required
                className={`mt-1 ${fieldErrors['customer_name'] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                aria-invalid={Boolean(fieldErrors['customer_name'])}
              />
              {fieldErrors['customer_name'] && (
                <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors['customer_name']}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-sm font-medium">No. Telepon</Label>
              <Input
                id="customerPhone"
                placeholder="Contoh: 08123456789"
                value={formData.customer_phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('customer_phone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerAddress" className="text-sm font-medium">Alamat Lengkap</Label>
            <Textarea
              id="customerAddress"
              placeholder="Contoh: Jl. Merdeka No. 123, Jakarta Pusat"
              value={formData.customer_address}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('customer_address', e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="orderDate" className="text-sm font-medium">Tanggal Pesanan *</Label>
              <Input
                id="orderDate"
                type="date"
                value={formData.order_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('order_date', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium">Prioritas</Label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.priority ?? 'normal'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('priority', e.target.value as Order['priority'])}
              >
                {Object.entries(ORDER_PRIORITIES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
        </SwipeableTabsContent>

        <SwipeableTabsContent value="items" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Item Pesanan ({orderItems.length})</h3>
              {fieldErrors['items'] && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors['items']}</span>
                </div>
              )}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                addOrderItem()
                if (fieldErrors['items']) {
                  setFieldErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors['items']
                    return newErrors
                  })
                }
              }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Item Pesanan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tambahkan produk yang dipesan oleh pelanggan
              </p>
              <Button type="button" onClick={addOrderItem} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item, index: number) => {
                const itemKey = item['id'] ?? `${item.recipe_id ?? 'recipe'}-${item.product_name ?? 'product'}-${item.total_price ?? '0'}-${item.special_requests ?? 'none'}`
                return (
                  <div key={itemKey} className="border rounded-lg overflow-hidden">
                    <div className="block sm:hidden">
                      <div className="p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                            <select
                              className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                              value={item.recipe_id}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRecipeSelect(index, e.target.value)}
                            >
                              {availableRecipes.map(recipe => (
                                <option key={recipe['id']} value={recipe['id']}>
                                  {recipe.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive ml-2 mt-4"
                            onClick={() => removeOrderItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Jumlah</Label>
                            <Input
                              type="number"
                              className="text-sm mt-1"
                              value={item.quantity}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrderItem(index, 'quantity', e.target.value)}
                              min="1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                            <Input
                              className="text-sm font-medium mt-1 bg-muted"
                              value={formatCurrency(item.total_price)}
                              readOnly
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Harga Satuan (Rp)</Label>
                          <Input
                            type="number"
                            className="text-sm mt-1"
                            value={item.unit_price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrderItem(index, 'unit_price', e.target.value)}
                            min="0"
                            step="500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex sm:items-center gap-3 p-4">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                          <select
                            className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                              value={item.recipe_id}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRecipeSelect(index, e.target.value)}
                            >
                            {availableRecipes.map(recipe => (
                              <option key={recipe['id']} value={recipe['id']}>
                                {recipe.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Jumlah</Label>
                          <Input
                            type="number"
                            className="text-sm mt-1"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrderItem(index, 'quantity', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Harga Satuan (Rp)</Label>
                          <Input
                            type="number"
                            className="text-sm mt-1"
                            value={item.unit_price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOrderItem(index, 'unit_price', e.target.value)}
                            min="0"
                            step="500"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                          <Input
                            className="text-sm font-medium mt-1 bg-muted"
                            value={formatCurrency(item.total_price)}
                            readOnly
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeOrderItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          )}
        </SwipeableTabsContent>

        <SwipeableTabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="deliveryDate" className="text-sm font-medium">Tanggal Pengiriman</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.delivery_date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('delivery_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime" className="text-sm font-medium">Jam Pengiriman</Label>
              <Input
                id="deliveryTime"
                type="time"
                value={formData.delivery_time}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('delivery_time', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="deliveryFee" className="text-sm font-medium">Biaya Ongkir (Rp)</Label>
              <Input
                id="deliveryFee"
                type="number"
                placeholder="0"
                value={formData.delivery_fee}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('delivery_fee', safeNumber(e.target.value, 0))}
                min="0"
                step="1000"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Catatan Pesanan</Label>
            <Textarea
              id="notes"
              placeholder="Contoh: Pesanan untuk acara ulang tahun"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="specialInstructions" className="text-sm font-medium">Permintaan Khusus</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Contoh: Tolong dikemas dengan box premium"
              value={formData.special_instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('special_instructions', e.target.value)}
              className="mt-1"
            />
          </div>
        </SwipeableTabsContent>

        <SwipeableTabsContent value="payment" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium">Metode Pembayaran</Label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.payment_method}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('payment_method', e.target.value as PaymentMethod)}
              >
                <option value="CASH">Tunai</option>
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="CREDIT_CARD">Kartu Debit/Kredit</option>
                <option value="DIGITAL_WALLET">E-Wallet (GoPay, OVO, dll)</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount" className="text-sm font-medium">Diskon (Rp)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="0"
                value={formData.discount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('discount', safeNumber(e.target.value, 0))}
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tax" className="text-sm font-medium">Pajak (%)</Label>
              <Input
                id="tax"
                type="number"
                placeholder="0"
                value={formData.tax_amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tax_amount', safeNumber(e.target.value, 0))}
                min="0"
                max="100"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="paidAmount" className="text-sm font-medium">Jumlah Dibayar (Rp)</Label>
              <Input
                id="paidAmount"
                type="number"
                placeholder="0"
                value={formData.paid_amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleInputChange('paid_amount', safeNumber(e.target.value, 0))
                  if (fieldErrors['paid_amount']) {
                    setFieldErrors(prev => {
                      const newErrors = { ...prev }
                      delete newErrors['paid_amount']
                      return newErrors
                    })
                  }
                }}
                min="0"
                step="1000"
                className={`mt-1 ${fieldErrors['paid_amount'] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                aria-invalid={Boolean(fieldErrors['paid_amount'])}
              />
              {fieldErrors['paid_amount'] && (
                <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors['paid_amount']}
                </div>
              )}
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Ringkasan Pembayaran</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon:</span>
                <span>- {formatCurrency(formData.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak ({formData.tax_amount}%):</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir:</span>
                <span>{formatCurrency(formData.delivery_fee)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium text-base">
                <span>Total Tagihan:</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Dibayar:</span>
                <span>{formatCurrency(formData.paid_amount)}</span>
              </div>
              {totalAmount > formData.paid_amount && (
                <div className="flex justify-between text-foreground font-medium">
                  <span>Sisa Belum Dibayar:</span>
                  <span>{formatCurrency(totalAmount - formData.paid_amount)}</span>
                </div>
              )}
            </div>
          </div>
        </SwipeableTabsContent>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} className="order-2 sm:order-1">
            Batalkan
          </Button>
          <LoadingButton type="submit" loading={loading} hapticFeedback className="order-1 sm:order-2">
            {submitButtonLabel}
          </LoadingButton>
        </div>
      </SwipeableTabs>
    </form>
  )
})

OrderForm.displayName = 'OrderForm'

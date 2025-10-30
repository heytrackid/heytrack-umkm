'use client'
import type { Database } from '@/types/supabase-generated'
type Customer = Database['public']['Tables']['customers']['Row']
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCurrency } from '@/hooks/useCurrency'
import { AlertCircle, Package, Plus, Trash2 } from 'lucide-react'
import { memo, useEffect, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ORDER_CONFIG, ORDER_PRIORITIES } from '@/lib/constants'
import type { Order, OrderFormProps, OrderItemWithRecipe, PaymentMethod } from '@/app/orders/types/orders-db.types'
import { calculateOrderTotals, generateOrderNo } from '../utils/helpers'
import { warningToast } from '@/hooks/use-toast'
import type { RecipesTable } from '@/types/recipes'
import { safeNumber } from '@/lib/type-guards'

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
  const [availableRecipes, setAvailableRecipes] = useState<Array<RecipesTable['Row']>>([])
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)

  const [formData, setFormData] = useState<FormState>({
    customer_name: order?.customer_name ?? '',
    customer_phone: order?.customer_phone ?? '',
    customer_address: order?.customer_address ?? '',
    order_date: order?.order_date ?? new Date().toISOString().split('T')[0],
    delivery_date: order?.delivery_date ?? '',
    delivery_time: order?.delivery_date?.includes('T')
      ? order.delivery_date.split('T')[1]?.slice(0, 5) ?? ''
      : '',
    delivery_fee: order?.delivery_fee ?? ORDER_CONFIG.DEFAULT_DELIVERY_FEE,
    discount: order?.discount ?? 0,
    tax_amount: order?.tax_amount ?? ORDER_CONFIG.DEFAULT_TAX_RATE,
    payment_method: 'cash',
    paid_amount: order?.paid_amount ?? 0,
    priority: order?.priority ?? ORDER_CONFIG.DEFAULT_PRIORITY,
    notes: order?.notes ?? '',
    special_instructions: order?.special_instructions ?? ''
  })

  const [orderItems, setOrderItems] = useState<OrderItemWithRecipe[]>(order?.items || [])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { subtotal, taxAmount, totalAmount } = calculateOrderTotals(
    orderItems,
    formData.discount,
    formData.tax_amount,
    formData.delivery_fee
  )

  // Fetch data
  // ✅ Use TanStack Query for recipes
  const { data: recipesData = [] } = useQuery({
    queryKey: ['recipes', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/recipes')
      if (!response.ok) { throw new Error('Failed to fetch recipes') }
      const data: Array<RecipesTable['Row']> = await response.json()
      return data.filter(recipe => recipe.is_active)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // ✅ Use TanStack Query for customers
  const { data: customersData = [] } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/customers')
      if (!response.ok) { throw new Error('Failed to fetch customers') }
      return response.json() as Promise<Customer[]>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update local state when data changes
  useEffect(() => {
    setAvailableRecipes(recipesData)
  }, [recipesData])

  useEffect(() => {
    setAvailableCustomers(customersData)
  }, [customersData])

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectCustomer = (customer: Customer | undefined) => {
    if (!customer) { return }
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_address: customer.address || ''
    }))
    void setCustomerSearch('')
  }

  const addOrderItem = () => {
    if (availableRecipes.length === 0) {
      warningToast('Resep tidak tersedia', 'Tambahkan resep baru sebelum membuat item pesanan')
      return
    }

    const firstRecipe = availableRecipes[0]
    if (!firstRecipe) { return }

    const newItem: OrderItemWithRecipe = {
      id: `temp-${Date.now()}`,
      order_id: '',
      recipe_id: firstRecipe.id,
      product_name: firstRecipe.name,
      quantity: 1,
      unit_price: firstRecipe.selling_price ?? 0,
      total_price: firstRecipe.selling_price ?? 0,
      special_requests: null,
      updated_at: null,
      user_id: '',
      recipe: {
        id: firstRecipe.id,
        name: firstRecipe.name,
        price: firstRecipe.selling_price ?? 0,
        category: firstRecipe.category ?? 'Uncategorized',
        servings: firstRecipe.servings ?? 0,
        description: firstRecipe.description ?? undefined
      }
    }
    void setOrderItems(prev => [...prev, newItem])
  }

  const updateOrderItem = <K extends keyof OrderItemWithRecipe>(
    index: number,
    field: K,
    value: OrderItemWithRecipe[K] | string
  ) => {
    setOrderItems(prev => {
      const updated = [...prev]
      const currentItem = updated[index]
      if (!currentItem) { return updated }

      if (field === 'recipe_id') {
        const selectedRecipe = availableRecipes.find(recipe => recipe.id === value)
        if (selectedRecipe) {
          updated[index] = {
            ...currentItem,
            recipe_id: value as string,
            product_name: selectedRecipe.name,
            recipe: {
              id: selectedRecipe.id,
              name: selectedRecipe.name,
              price: selectedRecipe.selling_price ?? currentItem.unit_price,
              category: selectedRecipe.category ?? 'Uncategorized',
              servings: selectedRecipe.servings ?? 0,
              description: selectedRecipe.description ?? undefined
            },
            unit_price: selectedRecipe.selling_price ?? currentItem.unit_price,
            total_price: (selectedRecipe.selling_price ?? currentItem.unit_price) * currentItem.quantity
          }
        }
      } else if (field === 'quantity') {
        const qty = Number.parseInt(value as string, 10) || 0
        updated[index] = {
          ...currentItem,
          quantity: qty,
          total_price: currentItem.unit_price * qty
        }
      } else if (field === 'unit_price') {
        const price = Number.parseFloat(value as string) || 0
        updated[index] = {
          ...currentItem,
          unit_price: price,
          total_price: price * currentItem.quantity
        }
      } else {
        updated[index] = { ...currentItem, [field]: value }
      }
      return updated
    })
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors: Record<string, string> = {}

    if (!formData.customer_name.trim()) {
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
      status: order?.status ?? 'pending',
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
      priority: formData.priority ?? 'normal',
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
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
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
                  onChange={(e) => setCustomerSearch(e.target.value)}
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
                          key={customer.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectCustomer(customer)}
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
                value={formData.customer_name}
                onChange={(e) => {
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
                className={`mt-1 ${fieldErrors['customer_name'] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                aria-invalid={!!fieldErrors['customer_name']}
              />
              {fieldErrors['customer_name'] && (
                <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
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
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
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
              onChange={(e) => handleInputChange('customer_address', e.target.value)}
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
                onChange={(e) => handleInputChange('order_date', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium">Prioritas</Label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.priority ?? 'normal'}
                onChange={(e) => handleInputChange('priority', e.target.value as Order['priority'])}
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
                <div className="flex items-center gap-1 text-sm text-red-600">
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
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
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
              {orderItems.map((item, index: number) => (
                <div key={item.id || index} className="border rounded-lg overflow-hidden">
                  <div className="block sm:hidden">
                    <div className="p-3 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                          <select
                            className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                            value={item.recipe_id}
                            onChange={(e) => updateOrderItem(index, 'recipe_id', e.target.value)}
                          >
                            {availableRecipes.map(recipe => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 dark:text-gray-400 hover:text-red-700 ml-2 mt-4"
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
                            onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                          <Input
                            className="text-sm font-medium mt-1 bg-gray-50"
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
                          onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
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
                          onChange={(e) => updateOrderItem(index, 'recipe_id', e.target.value)}
                        >
                          {availableRecipes.map(recipe => (
                            <option key={recipe.id} value={recipe.id}>
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
                          onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                          min="1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Harga Satuan (Rp)</Label>
                        <Input
                          type="number"
                          className="text-sm mt-1"
                          value={item.unit_price}
                          onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                          min="0"
                          step="500"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                        <Input
                          className="text-sm font-medium mt-1 bg-gray-50"
                          value={formatCurrency(item.total_price)}
                          readOnly
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-gray-600 dark:text-gray-400 hover:text-red-700"
                      onClick={() => removeOrderItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

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
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime" className="text-sm font-medium">Jam Pengiriman</Label>
              <Input
                id="deliveryTime"
                type="time"
                value={formData.delivery_time}
                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
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
                onChange={(e) => handleInputChange('delivery_fee', safeNumber(e.target.value, 0))}
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
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="specialInstructions" className="text-sm font-medium">Permintaan Khusus</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Contoh: Tolong dikemas dengan box premium"
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
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
                onChange={(e) => handleInputChange('payment_method', e.target.value as PaymentMethod)}
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
                <option value="card">Kartu Debit/Kredit</option>
                <option value="ewallet">E-Wallet (GoPay, OVO, dll)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount" className="text-sm font-medium">Diskon (Rp)</Label>
              <Input
                id="discount"
                type="number"
                placeholder="0"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', safeNumber(e.target.value, 0))}
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
                onChange={(e) => handleInputChange('tax_amount', safeNumber(e.target.value, 0))}
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
                onChange={(e) => {
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
                className={`mt-1 ${fieldErrors['paid_amount'] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                aria-invalid={!!fieldErrors['paid_amount']}
              />
              {fieldErrors['paid_amount'] && (
                <div className="flex items-center gap-2 text-sm text-red-600 mt-1">
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
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Dibayar:</span>
                <span>{formatCurrency(formData.paid_amount)}</span>
              </div>
              {totalAmount > formData.paid_amount && (
                <div className="flex justify-between text-orange-600 dark:text-orange-400 font-medium">
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
          <Button type="submit" disabled={loading} className="order-1 sm:order-2">
            {loading ? "Menyimpan..." : order ? "Update Pesanan" : "Simpan Pesanan"}
          </Button>
        </div>
      </SwipeableTabs>
    </form>
  )
})

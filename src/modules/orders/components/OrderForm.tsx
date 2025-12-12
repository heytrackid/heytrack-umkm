'use client'

import { AlertCircle, Check } from '@/components/icons'
import { useCustomersList } from '@/hooks/useCustomers'
import { useRecipes } from '@/hooks/useRecipes'
import { memo, useCallback, useMemo, useState, type FormEvent } from 'react'

import type { OrderFormProps, OrderItemWithRecipe } from '@/app/orders/types/orders-db.types'
import { useOrderItemsController } from '@/components/orders/hooks/useOrderItemsController'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { warningToast } from '@/hooks/use-toast'
import { ORDER_CONFIG } from '@/lib/constants/index'
import { calculateOrderTotals, generateOrderNo } from '@/modules/orders/utils/helpers'

// Split components
import { CustomerSection } from './OrderForm/CustomerSection'
import { DeliverySection } from './OrderForm/DeliverySection'
import { ItemsSection } from './OrderForm/ItemsSection'
import { PaymentSection } from './OrderForm/PaymentSection'
import type { FormState } from './OrderForm/types'

/**
 * OrderForm - Refactored
 * 
 * Split into sub-components for better maintainability:
 * - CustomerTab: Customer search and details
 * - ItemsTab: Order items management
 * - DeliveryTab: Delivery date, time, notes
 * - PaymentTab: Payment method and summary
 */
export const OrderForm = memo(({ order, onSubmit, onCancel, loading = false, error }: OrderFormProps) => {

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
  const { data: recipesData = [] } = useRecipes()
  const { data: customersData = [] } = useCustomersList()

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
  if (order) submitButtonLabel = 'Update Pesanan'
  if (loading) submitButtonLabel = 'Menyimpan...'

  const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <SwipeableTabsTrigger value="customer" className="text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              {formData.customer_name.trim() && <Check className="h-3 w-3 text-green-600" />}
              Pelanggan
            </span>
          </SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="items" className="text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              {orderItems.length > 0 && <Check className="h-3 w-3 text-green-600" />}
              Item ({orderItems.length})
            </span>
          </SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="delivery" className="text-xs sm:text-sm">Pengiriman</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="payment" className="text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              {formData.paid_amount > 0 && <Check className="h-3 w-3 text-green-600" />}
              Pembayaran
            </span>
          </SwipeableTabsTrigger>
        </SwipeableTabsList>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <SwipeableTabsContent value="customer" className="space-y-4">
          <CustomerSection
            formData={{
              customer_name: formData.customer_name,
              customer_phone: formData.customer_phone,
              customer_address: formData.customer_address,
              order_date: formData.order_date,
              priority: formData.priority ?? 'NORMAL'
            }}
            fieldErrors={fieldErrors}
            availableCustomers={availableCustomers}
            onInputChange={handleInputChange}
            onClearError={(field: string) => {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
              })
            }}
          />
        </SwipeableTabsContent>

        <SwipeableTabsContent value="items" className="space-y-4">
          <ItemsSection
            orderItems={orderItems}
            availableRecipes={availableRecipes}
            fieldErrors={fieldErrors}
            subtotal={subtotal}
            onAddItem={addOrderItem}
            onUpdateItem={updateOrderItem}
            onRemoveItem={removeOrderItem}
            onClearError={(field: string) => {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
              })
            }}
          />
        </SwipeableTabsContent>

        <SwipeableTabsContent value="delivery" className="space-y-4">
          <DeliverySection
            formData={{
              delivery_date: formData.delivery_date,
              delivery_time: formData.delivery_time,
              delivery_fee: formData.delivery_fee,
              notes: formData.notes,
              special_instructions: formData.special_instructions
            }}
            onInputChange={handleInputChange as never}
          />
        </SwipeableTabsContent>

        <SwipeableTabsContent value="payment" className="space-y-4">
          <PaymentSection
            formData={{
              payment_method: formData.payment_method,
              discount: formData.discount,
              tax_amount: formData.tax_amount,
              paid_amount: formData.paid_amount
            }}
            fieldErrors={fieldErrors}
            subtotal={subtotal}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
            deliveryFee={formData.delivery_fee}
            onInputChange={handleInputChange as never}
            onClearError={(field: string) => {
              setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
              })
            }}
          />
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

// @ts-nocheck
/**
 * Order Form - Main Component (Refactored)
 * Modular architecture with separated sections + Code Splitting
 */

'use client'

import { Button } from '@/components/ui/button'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { AlertCircle } from 'lucide-react'
import { memo, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
// import { ORDER_CONFIG } from '@/lib/constants'
import type { Order, OrderFormProps, OrderItemWithRecipe, PaymentMethod } from '@/app/orders/types/orders-db.types'
import { calculateOrderTotals, generateOrderNo } from '../../utils/helpers'
import { warningToast } from '@/hooks/use-toast'
import type { RecipesTable, CustomersTable } from '@/types/database'
import dynamic from 'next/dynamic'

// ✅ Code Splitting - Lazy load section components
const CustomerSection = dynamic(() => import('./CustomerSection').then(mod => ({ default: mod.CustomerSection })), {
    loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false
})

const ItemsSection = dynamic(() => import('./ItemsSection').then(mod => ({ default: mod.ItemsSection })), {
    loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false
})

const DeliverySection = dynamic(() => import('./DeliverySection').then(mod => ({ default: mod.DeliverySection })), {
    loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false
})

const PaymentSection = dynamic(() => import('./PaymentSection').then(mod => ({ default: mod.PaymentSection })), {
    loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false
})

type Customer = CustomersTable

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

export const OrderForm = memo(({ order, onSubmit, onCancel, loading = false, error }: OrderFormProps) => {
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
        payment_method: 'CASH',
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

    // Fetch recipes
    const { data: recipesData = [] } = useQuery({
        queryKey: ['recipes', 'active'],
        queryFn: async () => {
            const response = await fetch('/api/recipes')
            if (!response.ok) throw new Error('Failed to fetch recipes')
            const data: Array<RecipesTable> = await response.json()
            return data.filter(recipe => recipe.is_active)
        },
        staleTime: 5 * 60 * 1000,
    })

    // Fetch customers
    const { data: customersData = [] } = useQuery({
        queryKey: ['customers', 'all'],
        queryFn: async () => {
            const response = await fetch('/api/customers')
            if (!response.ok) throw new Error('Failed to fetch customers')
            return response.json() as Promise<Customer[]>
        },
        staleTime: 5 * 60 * 1000,
    })

    const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleClearError = (field: string) => {
        setFieldErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
        })
    }

    const addOrderItem = () => {
        if (recipesData.length === 0) {
            warningToast('Resep tidak tersedia', 'Tambahkan resep baru sebelum membuat item pesanan')
            return
        }

        const firstRecipe = recipesData[0]
        if (!firstRecipe) return

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
        setOrderItems(prev => [...prev, newItem])
    }

    const updateOrderItem = <K extends keyof OrderItemWithRecipe>(
        index: number,
        field: K,
        value: OrderItemWithRecipe[K] | string
    ) => {
        setOrderItems(prev => {
            const updated = [...prev]
            const currentItem = updated[index]
            if (!currentItem) return updated

            if (field === 'recipe_id') {
                const selectedRecipe = recipesData.find(recipe => recipe.id === value)
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
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                special_requests: item.special_requests
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
                    <CustomerSection
                        formData={formData}
                        fieldErrors={fieldErrors}
                        availableCustomers={customersData}
                        onInputChange={handleInputChange}
                        onClearError={handleClearError}
                    />
                </SwipeableTabsContent>

                <SwipeableTabsContent value="items" className="space-y-4">
                    <ItemsSection
                        orderItems={orderItems}
                        availableRecipes={recipesData}
                        fieldErrors={fieldErrors}
                        subtotal={subtotal}
                        onAddItem={addOrderItem}
                        onUpdateItem={updateOrderItem}
                        onRemoveItem={removeOrderItem}
                        onClearError={handleClearError}
                    />
                </SwipeableTabsContent>

                <SwipeableTabsContent value="delivery" className="space-y-4">
                    <DeliverySection
                        formData={formData}
                        onInputChange={handleInputChange}
                    />
                </SwipeableTabsContent>

                <SwipeableTabsContent value="payment" className="space-y-4">
                    <PaymentSection
                        formData={formData}
                        fieldErrors={fieldErrors}
                        subtotal={subtotal}
                        taxAmount={taxAmount}
                        totalAmount={totalAmount}
                        deliveryFee={formData.delivery_fee}
                        onInputChange={handleInputChange}
                        onClearError={handleClearError}
                    />
                </SwipeableTabsContent>
            </SwipeableTabs>

            <div className="flex gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Batal
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Menyimpan...' : order ? 'Update Pesanan' : 'Buat Pesanan'}
                </Button>
            </div>
        </form>
    )
})

OrderForm.displayName = 'OrderForm'

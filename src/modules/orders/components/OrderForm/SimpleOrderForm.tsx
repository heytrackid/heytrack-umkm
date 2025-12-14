'use client'

import { AlertCircle, CheckCircle, Clock, Minus, Plus, Search, Trash2, User, X } from '@/components/icons'
import { memo, useCallback, useMemo, useState, type FormEvent } from 'react'

import type { Order, OrderFormProps, OrderItemWithRecipe, PaymentMethod } from '@/app/orders/types/orders-db.types'
import { useOrderItemsController } from '@/components/orders/hooks/useOrderItemsController'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { warningToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { useCustomersList } from '@/hooks/useCustomers'
import { useRecipes } from '@/hooks/useRecipes'
import { safeNumber } from '@/lib/type-guards'
import { cn } from '@/lib/utils'
import { ORDER_CONFIG } from '@/modules/orders/constants'
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

export const SimpleOrderForm = memo(({ order, onSubmit, onCancel, loading = false, error }: OrderFormProps) => {
    const { formatCurrency } = useCurrency()
    
    const [formData, setFormData] = useState<FormState>({
        customer_name: order?.customer_name ?? '',
        customer_phone: order?.customer_phone ?? '',
        customer_address: order?.customer_address ?? '',
        order_date: order?.order_date ?? (new Date().toISOString().split('T')[0] ?? ''),
        delivery_date: order?.delivery_date ?? '',
        delivery_time: order?.delivery_date?.includes('T')
            ? order.delivery_date.split('T')[1]?.slice(0, 5) || ''
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
    const [customerSearch, setCustomerSearch] = useState('')
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
    const [productSearch, setProductSearch] = useState('')

    const { subtotal, taxAmount, totalAmount } = calculateOrderTotals(
        orderItems,
        formData.discount,
        formData.tax_amount,
        formData.delivery_fee
    )

    const { data: recipesData = [] } = useRecipes()
    const { data: customersData = [] } = useCustomersList()

    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return []
        return customersData.filter(c =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.phone?.includes(customerSearch)
        ).slice(0, 5)
    }, [customersData, customerSearch])

    const filteredRecipes = useMemo(() => {
        if (!productSearch.trim()) return recipesData.slice(0, 8)
        return recipesData.filter(r =>
            r.name.toLowerCase().includes(productSearch.toLowerCase())
        ).slice(0, 8)
    }, [recipesData, productSearch])

    const createEmptyOrderItem = useCallback((): OrderItemWithRecipe => {
        const firstRecipe = recipesData[0]
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
                    category: firstRecipe.category ?? 'Uncategorized',
                    servings: firstRecipe.servings ?? 0,
                    ...(firstRecipe.description && { description: firstRecipe.description })
                }
            })
        }
    }, [order?.id, order?.user_id, recipesData])

    const {
        updateItem: applyOrderItemUpdate,
        removeItem: removeOrderItem,
    } = useOrderItemsController<OrderItemWithRecipe>({
        items: orderItems,
        onItemsChange: setOrderItems,
        createEmptyItem: createEmptyOrderItem,
        availableRecipes: recipesData,
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
            } as OrderItemWithRecipe
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

    const selectCustomer = (customer: Customer) => {
        setFormData(prev => ({
            ...prev,
            customer_name: customer.name,
            customer_phone: customer.phone ?? '',
            customer_address: customer.address ?? ''
        }))
        setCustomerSearch('')
        setShowCustomerDropdown(false)
        if (fieldErrors['customer_name']) {
            setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors['customer_name']
                return newErrors
            })
        }
    }

    const addProductToOrder = useCallback((recipe: Row<'recipes'>) => {
        const existingIndex = orderItems.findIndex(item => item.recipe_id === recipe['id'])
        
        if (existingIndex >= 0) {
            const currentItem = orderItems[existingIndex]
            if (currentItem) {
                applyOrderItemUpdate(existingIndex, 'quantity', currentItem.quantity + 1)
            }
        } else {
            const unitPrice = recipe.selling_price ?? 0
            const cost = recipe.cost_per_unit ?? 0
            const timestamp = Date.now()
            
            const newItem: OrderItemWithRecipe = {
                id: `temp-${timestamp}`,
                order_id: order?.id ?? '',
                recipe_id: recipe['id'],
                product_name: recipe.name,
                quantity: 1,
                unit_price: unitPrice,
                total_price: unitPrice,
                special_requests: null,
                hpp_at_order: cost,
                profit_amount: unitPrice - cost,
                profit_margin: unitPrice > 0 ? (((unitPrice - cost) / unitPrice) * 100) : 0,
                updated_at: null,
                user_id: order?.user_id ?? '',
                recipe: {
                    id: recipe['id'],
                    name: recipe.name,
                    price: unitPrice,
                    category: recipe.category ?? 'Uncategorized',
                    servings: recipe.servings ?? 0,
                    ...(recipe.description && { description: recipe.description })
                }
            }
            setOrderItems(prev => [...prev, newItem])
        }
        
        setProductSearch('')
        if (fieldErrors['items']) {
            setFieldErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors['items']
                return newErrors
            })
        }
    }, [orderItems, applyOrderItemUpdate, order?.id, order?.user_id, fieldErrors])

    const updateQuantity = (index: number, delta: number) => {
        const item = orderItems[index]
        if (!item) return
        const newQty = Math.max(1, item.quantity + delta)
        applyOrderItemUpdate(index, 'quantity', newQty)
    }

    const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
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
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                special_requests: item.special_requests
            }))
        }

        await onSubmit(orderData)
    }

    const paymentStatus = formData.paid_amount >= totalAmount 
        ? 'paid' 
        : formData.paid_amount > 0 
            ? 'partial' 
            : 'unpaid'

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Customer Section */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold">Pelanggan</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <Label className="text-sm font-medium">Nama Pelanggan *</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari atau ketik nama pelanggan..."
                                    value={formData.customer_name || customerSearch}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        if (!formData.customer_name) {
                                            setCustomerSearch(value)
                                            setShowCustomerDropdown(true)
                                        }
                                        handleInputChange('customer_name', value)
                                        if (fieldErrors['customer_name']) {
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev }
                                                delete newErrors['customer_name']
                                                return newErrors
                                            })
                                        }
                                    }}
                                    onFocus={() => {
                                        if (!formData.customer_name) {
                                            setShowCustomerDropdown(true)
                                        }
                                    }}
                                    className={cn(
                                        "pl-9",
                                        fieldErrors['customer_name'] && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {formData.customer_name && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                customer_name: '',
                                                customer_phone: '',
                                                customer_address: ''
                                            }))
                                            setCustomerSearch('')
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            
                            {showCustomerDropdown && filteredCustomers.length > 0 && !formData.customer_name && (
                                <div className="absolute z-20 w-full bg-background border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                    {filteredCustomers.map(customer => (
                                        <button
                                            key={customer['id']}
                                            type="button"
                                            className="w-full p-3 text-left hover:bg-muted flex items-center gap-3 border-b last:border-b-0"
                                            onClick={() => selectCustomer(customer)}
                                        >
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{customer.name}</div>
                                                {customer.phone && (
                                                    <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {fieldErrors['customer_name'] && (
                                <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {fieldErrors['customer_name']}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium">No. WhatsApp</Label>
                                <Input
                                    placeholder="08xxxxxxxxxx"
                                    value={formData.customer_phone}
                                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Tanggal Kirim</Label>
                                <Input
                                    type="date"
                                    value={formData.delivery_date}
                                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">Alamat Pengiriman</Label>
                            <Textarea
                                placeholder="Alamat lengkap untuk pengiriman..."
                                value={formData.customer_address}
                                onChange={(e) => handleInputChange('customer_address', e.target.value)}
                                className="mt-1"
                                rows={2}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Section */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Produk Pesanan</h3>
                        {fieldErrors['items'] && (
                            <div className="flex items-center gap-1 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span>{fieldErrors['items']}</span>
                            </div>
                        )}
                    </div>

                    {/* Product Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari produk untuk ditambahkan..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Product Grid */}
                    {(productSearch || orderItems.length === 0) && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {filteredRecipes.map(recipe => (
                                <button
                                    key={recipe['id']}
                                    type="button"
                                    onClick={() => addProductToOrder(recipe)}
                                    className="p-3 border rounded-lg hover:bg-muted text-left transition-colors"
                                >
                                    <div className="font-medium text-sm truncate">{recipe.name}</div>
                                    <div className="text-xs text-muted-foreground">{formatCurrency(recipe.selling_price ?? 0)}</div>
                                </button>
                            ))}
                            {filteredRecipes.length === 0 && (
                                <div className="col-span-full text-center py-4 text-muted-foreground text-sm">
                                    {recipesData.length === 0 
                                        ? 'Belum ada produk. Buat resep terlebih dahulu.'
                                        : 'Produk tidak ditemukan'
                                    }
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order Items */}
                    {orderItems.length > 0 && (
                        <div className="space-y-2">
                            {orderItems.map((item, index) => (
                                <div 
                                    key={item['id']} 
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{item.product_name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatCurrency(item.unit_price)} × {item.quantity}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(index, -1)}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => updateQuantity(index, 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    
                                    <div className="text-right min-w-[80px]">
                                        <div className="font-medium">{formatCurrency(item.total_price)}</div>
                                    </div>
                                    
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeOrderItem(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Pembayaran</h3>
                        <Badge 
                            variant={paymentStatus === 'paid' ? 'default' : 'secondary'}
                            className={cn(
                                paymentStatus === 'paid' && 'bg-green-600',
                                paymentStatus === 'partial' && 'bg-yellow-500'
                            )}
                        >
                            {paymentStatus === 'paid' && <><CheckCircle className="h-3 w-3 mr-1" />Lunas</>}
                            {paymentStatus === 'partial' && <><Clock className="h-3 w-3 mr-1" />DP</>}
                            {paymentStatus === 'unpaid' && <><Clock className="h-3 w-3 mr-1" />Belum Bayar</>}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                            <Label className="text-sm font-medium">Metode Bayar</Label>
                            <select
                                className="w-full p-2 border border-input rounded-md bg-background mt-1 text-sm"
                                value={formData.payment_method}
                                onChange={(e) => handleInputChange('payment_method', e.target.value as PaymentMethod)}
                            >
                                <option value="CASH">Tunai</option>
                                <option value="BANK_TRANSFER">Transfer</option>
                                <option value="DIGITAL_WALLET">QRIS / E-Wallet</option>
                                <option value="CREDIT_CARD">Kartu Kredit</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Diskon (Rp)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.discount || ''}
                                onChange={(e) => handleInputChange('discount', safeNumber(e.target.value, 0))}
                                min="0"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Ongkir (Rp)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.delivery_fee || ''}
                                onChange={(e) => handleInputChange('delivery_fee', safeNumber(e.target.value, 0))}
                                min="0"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium">Dibayar (Rp)</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.paid_amount || ''}
                                onChange={(e) => handleInputChange('paid_amount', safeNumber(e.target.value, 0))}
                                min="0"
                                className={cn(
                                    "mt-1",
                                    fieldErrors['paid_amount'] && "border-destructive"
                                )}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {formData.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Diskon</span>
                                <span>-{formatCurrency(formData.discount)}</span>
                            </div>
                        )}
                        {formData.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Ongkir</span>
                                <span>{formatCurrency(formData.delivery_fee)}</span>
                            </div>
                        )}
                        {taxAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span>Pajak ({formData.tax_amount}%)</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                        )}
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold text-lg">
                            <span>Total</span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        {formData.paid_amount > 0 && formData.paid_amount < totalAmount && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Sisa</span>
                                <span>{formatCurrency(totalAmount - formData.paid_amount)}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Notes (Collapsible) */}
            <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
                    <span>Catatan Tambahan (opsional)</span>
                </summary>
                <div className="mt-3 space-y-3">
                    <div>
                        <Label className="text-sm font-medium">Catatan Pesanan</Label>
                        <Textarea
                            placeholder="Catatan internal untuk pesanan ini..."
                            value={formData.notes}
                            onChange={(e) => handleInputChange('notes', e.target.value)}
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Permintaan Khusus</Label>
                        <Textarea
                            placeholder="Permintaan khusus dari pelanggan..."
                            value={formData.special_instructions}
                            onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                            className="mt-1"
                            rows={2}
                        />
                    </div>
                </div>
            </details>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
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

SimpleOrderForm.displayName = 'SimpleOrderForm'

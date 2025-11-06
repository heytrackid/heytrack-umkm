/* eslint-disable no-nested-ternary */
'use client'

import type { OrderWithRelations } from '@/app/orders/types/orders.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LabelWithTooltip } from '@/components/ui/tooltip-helper'
import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('EnhancedOrderForm')
import { isRecipe } from '@/lib/type-guards'
import { validateOrderData } from '@/lib/validations/form-validations'
import type { Row } from '@/types/database'
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Package,
    Phone,
    Plus,
    Save,
    Search,
    ShoppingCart,
    Trash2,
    User
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Order, OrderFormData, OrderFormItem, Priority } from './types'
import { calculateOrderTotal, normalizePriority } from './utils'

interface EnhancedOrderFormProps {
    order?: Order
    onSave: (orderData: OrderFormData) => void
    onCancel: () => void
    loading?: boolean
}

type Recipe = Row<'recipes'>

const EnhancedOrderForm = ({
    order,
    onSave,
    onCancel,
    loading = false
}: EnhancedOrderFormProps) => {
    const { isMobile } = useResponsive()
    const { formatCurrency } = useCurrency()

    const [formData, setFormData] = useState<OrderFormData>({
        customer_name: '',
        customer_phone: '',
        // customer_email: '', // Field doesn't exist in DB
        customer_address: '',
        delivery_date: '',
        delivery_time: '10:00',
        priority: 'normal',
        notes: '',
        order_items: []
    })

    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [errors, setErrors] = useState<string[]>([])
    const [currentStep, setCurrentStep] = useState(1)

    useEffect(() => {
        if (order) {
            setFormData({
                customer_name: order.customer_name ?? '',
                customer_phone: order.customer_phone ?? '',
                // customer_email: order.customer_name || '', // Field doesn't exist in DB
                customer_address: order.customer_address ?? '',
                delivery_date: order.delivery_date ? order.delivery_date.split('T')[0] : '',
                delivery_time: order.delivery_time ?? '10:00',
                priority: normalizePriority(order.priority),
                notes: order.notes ?? '',
                order_items: (order as OrderWithRelations).items?.map(item => ({
                    recipe_id: item.recipe_id,
                    product_name: item.product_name ?? null,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                    special_requests: item.special_requests ?? null
                })) || []
            })
            setCurrentStep(3) // Skip to items if editing
        }
    }, [order])

    useEffect(() => {
        void fetchRecipes()
    }, [])

    useEffect(() => {
        if (searchTerm) {
            const filtered = recipes.filter(r =>
                r.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredRecipes(filtered)
        } else {
            setFilteredRecipes(recipes)
        }
    }, [searchTerm, recipes])

    const fetchRecipes = async () => {
        try {
            const response = await fetch('/api/recipes', {
                credentials: 'include', // Include cookies for authentication
            })
            if (!response.ok) { return }

            const payload = await response.json()
            const recipeList: Recipe[] = Array.isArray(payload)
                ? payload.filter((item): item is Recipe => isRecipe(item))
                : []

            setRecipes(recipeList)
            setFilteredRecipes(recipeList)
        } catch (err: unknown) {
            logger.error({ err }, 'Error fetching recipes')
        }
    }

    const handleInputChange = <K extends keyof OrderFormData>(
        field: K,
        value: OrderFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors.length > 0) {
            setErrors([])
        }
    }

    const addOrderItem = () => {
        const newItem: OrderFormItem = {
            recipe_id: '',
            product_name: null,
            quantity: 1,
            special_requests: null,
            total_price: 0,
            unit_price: 0
        }

        setFormData(prev => ({
            ...prev,
            order_items: [...prev.order_items, newItem]
        }))
    }

    const addRecipeToOrder = (recipe: Recipe) => {
        const existingIndex = formData.order_items.findIndex(
            item => item.recipe_id === recipe.id
        )

        if (existingIndex >= 0) {
            // Increase quantity if already exists
            setFormData(prev => ({
                ...prev,
                order_items: prev.order_items.map((item, i) =>
                    i === existingIndex
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }))
        } else {
            // Add new item
            const newItem: OrderFormItem = {
                recipe_id: recipe.id,
                product_name: recipe.name,
                quantity: 1,
                unit_price: recipe.selling_price ?? 0,
                total_price: recipe.selling_price ?? 0,
                special_requests: null
            }

            setFormData(prev => ({
                ...prev,
                order_items: [...prev.order_items, newItem]
            }))
        }
        setSearchTerm('')
    }

    const updateOrderItem = <K extends keyof OrderFormItem>(
        index: number,
        field: K,
        value: OrderFormItem[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            order_items: prev.order_items.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }))
    }

    const removeOrderItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            order_items: prev.order_items.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = () => {
        const validationErrors = validateOrderData(formData)
        if (validationErrors.length > 0) {
            setErrors(validationErrors)
            return
        }
        onSave(formData)
    }

    const canProceedToNextStep = () => {
        if (currentStep === 1) {
            return formData.customer_name && formData.customer_phone
        }
        if (currentStep === 2) {
            return formData.delivery_date
        }
        return true
    }

    const totalAmount = calculateOrderTotal(formData.order_items)
    const totalItems = formData.order_items.reduce((sum, item) => sum + item.quantity, 0)

    // Step 1: Customer Info
    // eslint-disable-next-line react/no-unstable-nested-components
    const CustomerInfoStep = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informasi Pelanggan
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nama Pelanggan *
                    </Label>
                    <Input
                        value={formData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="Masukkan nama pelanggan"
                        className="text-base"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Nomor Telepon *
                    </Label>
                    <Input
                        value={formData.customer_phone}
                        onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                        placeholder="08xx xxxx xxxx"
                        className="text-base"
                    />
                </div>

                {/* Email field removed - not in database schema */}

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Alamat Pengiriman (Opsional)
                    </Label>
                    <Textarea
                        value={formData.customer_address ?? ''}
                        onChange={(e) => handleInputChange('customer_address', e.target.value)}
                        placeholder="Masukkan alamat lengkap"
                        rows={3}
                        className="text-base"
                    />
                </div>
            </CardContent>
        </Card>
    )

    // Step 2: Delivery Info
    // eslint-disable-next-line react/no-unstable-nested-components
    const DeliveryInfoStep = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informasi Pengiriman
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <LabelWithTooltip
                            label="Tanggal Pengiriman"
                            tooltip="Kapan pesanan ini harus dikirim ke pelanggan"
                            required
                        />
                    </div>
                    <Input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="text-base"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <LabelWithTooltip
                            label="Waktu Pengiriman"
                            tooltip="Jam berapa pesanan harus sampai ke pelanggan"
                        />
                    </div>
                    <Input
                        type="time"
                        value={formData.delivery_time}
                        onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                        className="text-base"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <LabelWithTooltip
                            label="Tingkat Prioritas"
                            tooltip="Tingkat kepentingan pesanan: Rendah (biasa), Normal (standar), Tinggi (penting/mendesak)"
                        />
                    </div>
                    <Select
                        value={formData.priority ?? 'normal'}
                        onValueChange={(value: Priority) => handleInputChange('priority', value)}
                    >
                        <SelectTrigger className="text-base">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                                    Biasa
                                </div>
                            </SelectItem>
                            <SelectItem value="normal">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                                    Standar
                                </div>
                            </SelectItem>
                            <SelectItem value="high">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-red-400" />
                                    Penting/Mendesak
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Catatan Pesanan (Opsional)</Label>
                    <Textarea
                        value={formData.notes ?? ''}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Tambahkan catatan khusus untuk pesanan ini"
                        rows={3}
                        className="text-base"
                    />
                </div>
            </CardContent>
        </Card>
    )

    // Step 3: Order Items
    // eslint-disable-next-line react/no-unstable-nested-components
    const OrderItemsStep = () => (
        <div className="space-y-4">
            {/* Product Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Cari Produk
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari produk..."
                            className="pl-10 text-base"
                        />
                    </div>

                    {searchTerm && filteredRecipes.length > 0 && (
                        <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                            {filteredRecipes.map((recipe) => (
                                <button
                                    key={recipe.id}
                                    onClick={() => addRecipeToOrder(recipe)}
                                    className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors text-left"
                                >
                                    <div>
                                        <p className="font-medium">{recipe.name}</p>
                                        {recipe.category && (
                                            <p className="text-sm text-muted-foreground">{recipe.category}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{formatCurrency(recipe.selling_price ?? 0)}</p>
                                        <Plus className="h-4 w-4 text-primary ml-auto" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Items List */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Item Pesanan ({formData.order_items.length})
                        </CardTitle>
                        <Button onClick={addOrderItem} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Manual
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {formData.order_items.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-2">Belum ada item ditambahkan</p>
                            <p className="text-sm text-muted-foreground">
                                Cari produk di atas atau tambah manual
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formData.order_items.map((item, index) => (
                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product_name ?? 'Produk belum dipilih'}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateOrderItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateOrderItem(index, 'quantity', item.quantity + 1)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    × {formatCurrency(item.unit_price)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">
                                                {formatCurrency(item.unit_price * item.quantity)}
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeOrderItem(index)}
                                                className="text-red-500 hover:text-red-700 mt-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm">Catatan Item (Opsional)</Label>
                                        <Input
                                            value={item.special_requests ?? ''}
                                            onChange={(e) => updateOrderItem(index, 'special_requests', e.target.value)}
                                            placeholder="Contoh: Tanpa gula, extra pedas"
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Summary */}
            {formData.order_items.length > 0 && (
                <Card className="border-primary">
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Total Item</span>
                                <span>{totalItems} item</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onCancel} className="p-2">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                        {order ? 'Edit Pesanan' : 'Buat Pesanan Baru'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {order ? 'Perbarui informasi pesanan' : 'Lengkapi form untuk membuat pesanan'}
                    </p>
                </div>
            </div>

            {/* Progress Steps */}
            {!order && (
                <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <button
                                onClick={() => setCurrentStep(step)}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep === step
                                    ? 'border-primary bg-primary text-white'
                                    : currentStep > step
                                        ? 'border-green-500 bg-gray-500 text-white'
                                        : 'border-gray-300 text-gray-400'
                                    }`}
                            >
                                {step}
                            </button>
                            {step < 3 && (
                                <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-gray-500' : 'bg-gray-300'}`} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Validation Errors */}
            {errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-red-800 mb-2">Kesalahan Validasi</h4>
                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Form Steps */}
            {(currentStep === 1 || order) && <CustomerInfoStep />}
            {(currentStep === 2 || order) && <DeliveryInfoStep />}
            {(currentStep === 3 || order) && <OrderItemsStep />}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
                {!order && currentStep > 1 && (
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={loading}
                    >
                        Kembali
                    </Button>
                )}

                {!order && currentStep < 3 ? (
                    <Button
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={!canProceedToNextStep()}
                        className="flex-1"
                    >
                        Lanjut
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || formData.order_items.length === 0}
                        className="flex-1"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Menyimpan...' : (order ? 'Perbarui Pesanan' : 'Buat Pesanan')}
                    </Button>
                )}

                <Button variant="outline" onClick={onCancel} disabled={loading}>
                    Batal
                </Button>
            </div>
        </div>
    )
}

export default EnhancedOrderForm

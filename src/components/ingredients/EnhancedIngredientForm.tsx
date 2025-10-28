// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField, FormGrid } from '@/components/ui/crud-form'
import { LabelWithTooltip, UMKM_TOOLTIPS } from '@/components/ui/tooltip-helper'
import { AlertTriangle, Info, TrendingUp } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'
import type { SimpleIngredientFormData } from '@/lib/validations/form-validations'
import type { Database } from '@/types/supabase-generated'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface EnhancedIngredientFormProps {
    form: UseFormReturn<SimpleIngredientFormData>
    mode: 'create' | 'edit'
    initialData?: SimpleIngredientFormData & Partial<Ingredient>
}

export const EnhancedIngredientForm = ({
    form,
    mode,
    initialData
}: EnhancedIngredientFormProps) => {
    const { formatCurrency } = useSettings()
    const { register, watch, formState: { errors } } = form

    const currentStock = watch('current_stock')
    const minStock = watch('min_stock')
    const pricePerUnit = watch('price_per_unit')
    const name = watch('name')

    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            const changed =
                currentStock !== initialData.current_stock ||
                minStock !== initialData.min_stock ||
                pricePerUnit !== initialData.price_per_unit
            setHasChanges(changed)
        }
    }, [currentStock, minStock, pricePerUnit, initialData, mode])

    // Validation warnings
    const showMinStockWarning = minStock > 0 && currentStock > 0 && currentStock <= minStock
    const showOutOfStockWarning = currentStock <= 0
    const totalValue = (pricePerUnit || 0) * (currentStock || 0)

    const unitOptions = [
        { value: 'kg', label: 'Kilogram (kg)' },
        { value: 'g', label: 'Gram (g)' },
        { value: 'l', label: 'Liter (l)' },
        { value: 'ml', label: 'Mililiter (ml)' },
        { value: 'pcs', label: 'Pieces (pcs)' },
        { value: 'dozen', label: 'Lusin (dozen)' },
    ]

    return (
        <div className="space-y-6">
            {/* Current Summary (Edit Mode) */}
            {mode === 'edit' && initialData && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                                <Info className="w-4 h-4" />
                                Data Saat Ini
                            </div>
                            {hasChanges && (
                                <Badge variant="secondary" className="text-xs">
                                    Ada Perubahan
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-blue-700 mb-1">Stok</p>
                                <p className="text-blue-900 font-semibold">
                                    {initialData.current_stock} {initialData.unit}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-700 mb-1">Harga</p>
                                <p className="text-blue-900 font-semibold">
                                    {formatCurrency(initialData.price_per_unit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-700 mb-1">Min. Stok</p>
                                <p className="text-blue-900 font-semibold">
                                    {initialData.min_stock} {initialData.unit}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Warnings */}
            {showOutOfStockWarning && name && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Stok habis! Bahan baku ini tidak dapat digunakan untuk produksi.
                    </AlertDescription>
                </Alert>
            )}

            {showMinStockWarning && !showOutOfStockWarning && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        Stok mencapai batas minimum. Pertimbangkan untuk melakukan pemesanan.
                    </AlertDescription>
                </Alert>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Informasi Dasar</h3>
                    <FormGrid cols={2}>
                        <FormField
                            label="Nama Bahan"
                            name="name"
                            type="text"
                            {...register('name')}
                            error={errors.name?.message}
                            required
                            placeholder="Contoh: Tepung Terigu"
                            autoFocus={mode === 'create'}
                        />

                        <FormField
                            label="Satuan"
                            name="unit"
                            type="select"
                            {...register('unit')}
                            error={errors.unit?.message}
                            required
                            options={unitOptions}
                        />
                    </FormGrid>
                </div>

                {/* Price & Stock */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Harga & Stok</h3>
                    <FormGrid cols={2}>
                        <FormField
                            label="Harga per Unit"
                            name="price_per_unit"
                            type="number"
                            {...register('price_per_unit', { valueAsNumber: true })}
                            error={errors.price_per_unit?.message}
                            required
                            min={0}
                            step={0.01}
                            placeholder="0"
                        />

                        <FormField
                            label="Stok Saat Ini"
                            name="current_stock"
                            type="number"
                            {...register('current_stock', { valueAsNumber: true })}
                            error={errors.current_stock?.message}
                            required
                            min={0}
                            step={0.01}
                            placeholder="0"
                        />
                    </FormGrid>

                    <FormField
                        label="Stok Minimum"
                        name="min_stock"
                        type="number"
                        {...register('min_stock', { valueAsNumber: true })}
                        error={errors.min_stock?.message}
                        required
                        min={0}
                        step={0.01}
                        placeholder="0"
                        hint="Anda akan mendapat notifikasi jika stok mencapai batas ini"
                    />

                    {/* Total Value Display */}
                    {totalValue > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Nilai Stok</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {formatCurrency(totalValue)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">Informasi Tambahan (Opsional)</h3>
                    <FormField
                        label="Deskripsi"
                        name="description"
                        type="text"
                        {...register('description')}
                        placeholder="Catatan atau deskripsi tambahan"
                    />
                </div>
            </div>

            {/* Tips for Create Mode */}
            {mode === 'create' && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-green-900 mb-2">💡 Tips</p>
                                <ul className="text-green-800 space-y-1 text-xs">
                                    <li>• Set stok minimum 20-30% dari stok normal Anda</li>
                                    <li>• Gunakan satuan yang konsisten untuk kemudahan tracking</li>
                                    <li>• Update harga secara berkala untuk kalkulasi HPP yang akurat</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

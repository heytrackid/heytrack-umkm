// @ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FormField, FormGrid, FormSection } from '@/components/ui/crud-form'
import { AlertTriangle, Info, TrendingUp, Package } from 'lucide-react'
import { useSettings } from '@/contexts/settings-context'
import type { SimpleIngredientFormData } from '@/lib/validations/form-validations'

interface EnhancedIngredientFormProps {
    form: UseFormReturn<SimpleIngredientFormData>
    mode: 'create' | 'edit'
    initialData?: SimpleIngredientFormData
}

/**
 * Enhanced Ingredient Form
 * 
 * Features:
 * - Summary panel showing current values
 * - Real-time validation with helpful messages
 * - Visual indicators for changes
 * - Smart suggestions
 * - Two-column layout for better hierarchy
 */
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
    const showInvalidMinWarning = minStock > currentStock && currentStock > 0

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
            {/* Summary Panel (Edit Mode Only) */}
            {mode === 'edit' && initialData && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Ringkasan Saat Ini
                            {hasChanges && (
                                <Badge variant="secondary" className="ml-auto">
                                    Ada Perubahan
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-blue-700 font-medium mb-1">Stok</p>
                            <p className="text-blue-900 font-semibold">
                                {initialData.current_stock} {initialData.unit}
                            </p>
                        </div>
                        <div>
                            <p className="text-blue-700 font-medium mb-1">Harga</p>
                            <p className="text-blue-900 font-semibold">
                                {formatCurrency(initialData.price_per_unit)}
                            </p>
                        </div>
                        <div>
                            <p className="text-blue-700 font-medium mb-1">Min. Stok</p>
                            <p className="text-blue-900 font-semibold">
                                {initialData.min_stock} {initialData.unit}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Validation Warnings */}
            {showOutOfStockWarning && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Stok habis! Segera lakukan pembelian untuk menghindari gangguan produksi.
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

            {showInvalidMinWarning && (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        Stok minimum lebih tinggi dari stok saat ini. Pastikan nilai sudah benar.
                    </AlertDescription>
                </Alert>
            )}

            {/* Basic Information */}
            <FormSection
                title="Informasi Dasar"
                description="Data identitas bahan baku"
            >
                <FormGrid cols={2}>
                    <FormField
                        label="Nama Bahan"
                        name="name"
                        type="text"
                        {...register('name')}
                        error={errors.name?.message}
                        required
                        hint="Nama bahan baku yang mudah dikenali"
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
                        hint="Pilih satuan yang sesuai"
                    />
                </FormGrid>
            </FormSection>

            {/* Price & Stock - Two Column Layout */}
            <FormSection
                title="Harga & Stok"
                description="Atur harga dan jumlah stok"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Price */}
                    <div className="space-y-4">
                        <FormField
                            label="Harga per Unit"
                            name="price_per_unit"
                            type="number"
                            {...register('price_per_unit', { valueAsNumber: true })}
                            error={errors.price_per_unit?.message}
                            required
                            min={0}
                            step={0.01}
                            hint="Harga per satuan dalam Rupiah"
                        />

                        {pricePerUnit > 0 && currentStock > 0 && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-600 mb-1">Total Nilai Stok</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatCurrency(pricePerUnit * currentStock)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Stock */}
                    <div className="space-y-4">
                        <FormField
                            label="Stok Saat Ini"
                            name="current_stock"
                            type="number"
                            {...register('current_stock', { valueAsNumber: true })}
                            error={errors.current_stock?.message}
                            required
                            min={0}
                            step={0.01}
                            hint="Jumlah stok yang tersedia sekarang"
                        />

                        <FormField
                            label="Stok Minimum"
                            name="min_stock"
                            type="number"
                            {...register('min_stock', { valueAsNumber: true })}
                            error={errors.min_stock?.message}
                            required
                            min={0}
                            step={0.01}
                            hint="Batas minimum untuk alert stok"
                        />
                    </div>
                </div>
            </FormSection>

            {/* Optional Information */}
            <FormSection title="Informasi Tambahan (Opsional)">
                <FormField
                    label="Deskripsi"
                    name="description"
                    type="text"
                    {...register('description')}
                    hint="Catatan atau deskripsi tambahan"
                />
            </FormSection>

            {/* Smart Suggestions */}
            {mode === 'create' && (
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-green-900 mb-1">💡 Tips</p>
                                <ul className="text-green-800 space-y-1 list-disc list-inside">
                                    <li>Set stok minimum 20-30% dari stok normal Anda</li>
                                    <li>Gunakan satuan yang konsisten untuk kemudahan tracking</li>
                                    <li>Update harga secara berkala untuk kalkulasi HPP yang akurat</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

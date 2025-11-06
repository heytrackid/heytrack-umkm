'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FormField, FormGrid } from '@/components/ui/crud-form'
import { useSettings } from '@/contexts/settings-context'
import type { SimpleIngredientFormData } from '@/lib/validations/form-validations'
import type { Row } from '@/types/database'
import { AlertTriangle, Info, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'



type Ingredient = Row<'ingredients'>

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
    const { watch, formState: { errors }, setValue } = form

    const currentStock = watch('current_stock')
    const minStock = watch('min_stock')
    const pricePerUnit = watch('price_per_unit')
    const name = watch('name')

    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (mode === 'edit' && initialData) {
            const changed = (currentStock || 0) !== initialData.current_stock ||
                (minStock ?? 0) !== initialData.min_stock ||
                pricePerUnit !== initialData.price_per_unit
            setHasChanges(changed)
        }
    }, [currentStock, minStock, pricePerUnit, initialData, mode])

    // Validation warnings (with handling for potentially undefined values)
    const showMinStockWarning = (minStock ?? 0) > 0 && (currentStock ?? 0) > 0 && (currentStock ?? 0) <= (minStock ?? 0)
    const showOutOfStockWarning = (currentStock || 0) <= 0
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
                <Card className="bg-muted">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
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
                                <p className="text-muted-foreground mb-1">Stok</p>
                                <p className="text-foreground font-semibold">
                                    {initialData.current_stock} {initialData.unit}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Harga</p>
                                <p className="text-foreground font-semibold">
                                    {formatCurrency(initialData.price_per_unit)}
                                </p>
                            </div>
                            <div>
                                <p className="text-muted-foreground mb-1">Min. Stok</p>
                                <p className="text-foreground font-semibold">
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
                    <h3 className="text-sm font-semibold text-foreground">Informasi Dasar</h3>
                    <FormGrid cols={2}>
                        <FormField
                            label="Nama Bahan"
                            name="name"
                            type="text"
                            error={errors.name?.message}
                            required
                            placeholder="Contoh: Tepung Terigu"
                            autoFocus={mode === 'create'}
                            value={watch('name') || ''}
                            onChange={(_, value) => form.setValue('name', value as string)}
                        />

                        <FormField
                            label="Satuan"
                            name="unit"
                            type="select"
                            error={errors.unit?.message}
                            required
                            options={unitOptions}
                            value={watch('unit') || ''}
                            onChange={(_, value) => setValue('unit', value as string)}
                        />
                    </FormGrid>
                </div>

                {/* Price & Stock */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Harga & Stok</h3>
                    <FormGrid cols={2}>
                        <FormField
                            label="Harga per Unit"
                            name="price_per_unit"
                            type="number"
                            error={errors.price_per_unit?.message}
                            required
                            min={0}
                            step={0.01}
                            placeholder="0"
                            value={watch('price_per_unit') || 0}
                            onChange={(_, value) => setValue('price_per_unit', value as number)}
                        />

                        <FormField
                            label="Stok Saat Ini"
                            name="current_stock"
                            type="number"
                            error={errors.current_stock?.message}
                            required
                            min={0}
                            step={0.01}
                            placeholder="0"
                            value={watch('current_stock') || 0}
                            onChange={(_, value) => setValue('current_stock', value as number)}
                        />
                    </FormGrid>

                    <FormField
                        label="Stok Minimum"
                        name="min_stock"
                        type="number"
                        error={errors.min_stock?.message}
                        required
                        min={0}
                        step={0.01}
                        placeholder="0"
                        hint="Anda akan mendapat notifikasi jika stok mencapai batas ini"
                        value={watch('min_stock') ?? 0}
                        onChange={(_, value) => setValue('min_stock', value as number)}
                    />

                    {/* Total Value Display */}
                    {totalValue > 0 && (
                        <div className="p-4 bg-muted rounded-lg border">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Nilai Stok</span>
                                <span className="text-lg font-bold text-foreground">
                                    {formatCurrency(totalValue)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground">Informasi Tambahan (Opsional)</h3>
                    <FormField
                        label="Deskripsi"
                        name="description"
                        type="text"
                        placeholder="Catatan atau deskripsi tambahan"
                        value={watch('description') ?? ''}
                        onChange={(_, value) => setValue('description', value as string)}
                    />
                </div>
            </div>

            {/* Tips for Create Mode */}
            {mode === 'create' && (
                <Card className="bg-muted">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-foreground mb-2">💡 Tips</p>
                                <ul className="text-foreground space-y-1 text-xs">
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

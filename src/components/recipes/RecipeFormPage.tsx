 
'use client'

import { ArrowLeft, Plus, Save, Trash2 } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { handleError } from '@/lib/error-handling'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import { useCreateRecipeWithIngredients, useUpdateRecipeWithIngredients, useRecipe } from '@/hooks/useRecipes'
import { useIngredientsList } from '@/hooks/useIngredients'
import { PageHeader } from '@/components/layout/PageHeader'

import type { Row, Database } from '@/types/database'

type RecipeInsert = Row<'recipes'>
type Ingredient = Row<'ingredients'>

interface RecipeFormPageProps {
    mode: 'create' | 'edit'
    recipeId?: string
    onSuccess?: () => void
    onCancel?: () => void
    isDialog?: boolean
}

interface RecipeIngredientForm {
    id?: string
    ingredient_id: string
    quantity: number
    unit: string
    notes?: string
}

export const RecipeFormPage = ({ mode, recipeId, onSuccess, onCancel, isDialog = false }: RecipeFormPageProps) => {
    const router = useRouter()

    const createMutation = useCreateRecipeWithIngredients()
    const updateMutation = useUpdateRecipeWithIngredients()
    const { data: ingredients = [] } = useIngredientsList()
    const { data: recipeData } = useRecipe(recipeId || null)
    const loading = createMutation.isPending || updateMutation.isPending
    const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([])
    const [formData, setFormData] = useState<Partial<RecipeInsert>>({
        name: '',
        description: '',
        servings: 1,
        prep_time: 0,
        cook_time: 0,
        difficulty: 'medium',
        category: 'other',
        is_active: true,
    })
    const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredientForm[]>([])

    // Sync ingredients from hook to local state
    useEffect(() => {
        if (ingredients) {
            // Use setTimeout to avoid setState during render cycle
            setTimeout(() => setAvailableIngredients(ingredients), 0)
        }
    }, [ingredients])

    // Sync recipe data for edit mode
    useEffect(() => {
        if (mode === 'edit' && recipeData) {
            // Use setTimeout to avoid setState during render cycle
            setTimeout(() => {
                setFormData(recipeData)
                // Load recipe ingredients from the response
                if (recipeData.recipe_ingredients && Array.isArray(recipeData.recipe_ingredients)) {
                    setRecipeIngredients(
                        recipeData.recipe_ingredients.map((ri: Database['public']['Tables']['recipe_ingredients']['Row']) => ({
                            id: ri.id,
                            ingredient_id: ri.ingredient_id,
                            quantity: ri.quantity,
                            unit: ri.unit,
                            notes: '',
                        }))
                    )
                }
            }, 0)
        }
    }, [mode, recipeData])





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate basic recipe data
        if (!formData.name?.trim()) {
            handleError(new Error('Validation: Nama resep harus diisi'), 'RecipeFormPage: validation', true, 'Nama resep harus diisi')
            return
        }

        if (!formData.servings || formData.servings < 1) {
            handleError(new Error('Validation: Porsi harus minimal 1'), 'RecipeFormPage: validation', true, 'Porsi harus minimal 1')
            return
        }

        if (formData.prep_time !== undefined && formData.prep_time !== null && formData.prep_time < 0) {
            handleError(new Error('Validation: Waktu persiapan tidak boleh negatif'), 'RecipeFormPage: validation', true, 'Waktu persiapan tidak boleh negatif')
            return
        }

        if (formData.cook_time !== undefined && formData.cook_time !== null && formData.cook_time < 0) {
            handleError(new Error('Validation: Waktu memasak tidak boleh negatif'), 'RecipeFormPage: validation', true, 'Waktu memasak tidak boleh negatif')
            return
        }

        // Validate ingredients
        if (recipeIngredients.length === 0) {
            handleError(new Error('Validation: Resep harus memiliki minimal 1 bahan'), 'RecipeFormPage: validation', true, 'Resep harus memiliki minimal 1 bahan')
            return
        }

        // Validate each ingredient
        for (let i = 0; i < recipeIngredients.length; i++) {
            const ri = recipeIngredients[i]
            if (!ri) continue

            if (!ri.ingredient_id?.trim()) {
                handleError(new Error(`Validation: Bahan ${i + 1} harus dipilih`), 'RecipeFormPage: validation', true, `Bahan ${i + 1} harus dipilih`)
                return
            }
            if (!ri.quantity || ri.quantity <= 0) {
                handleError(new Error(`Validation: Bahan ${i + 1} harus memiliki jumlah yang valid`), 'RecipeFormPage: validation', true, `Bahan ${i + 1} harus memiliki jumlah yang valid`)
                return
            }
            if (!ri.unit?.trim()) {
                handleError(new Error(`Validation: Bahan ${i + 1} harus memiliki satuan`), 'RecipeFormPage: validation', true, `Bahan ${i + 1} harus memiliki satuan`)
                return
            }
        }

        try {
            const ingredientData = recipeIngredients.map(ri => {

                const item: {
                    ingredient_id: string
                    quantity: number
                    unit: string
                    notes?: string
                } = {
                    ingredient_id: ri.ingredient_id,
                    quantity: ri.quantity,
                    unit: ri.unit,
                }

                if (ri.notes) item.notes = ri.notes

                return item

            })

            if (mode === 'create') {
                const result = await createMutation.mutateAsync({
                    recipe: formData as RecipeInsert,
                    ingredients: ingredientData
                })

                if (isDialog && onSuccess) {
                    onSuccess()
                } else {
                    router.push(`/recipes/${result?.id}`)
                }
            } else if (recipeId) {
                await updateMutation.mutateAsync({
                    id: recipeId,
                    recipe: formData,
                    ingredients: ingredientData
                })

                if (isDialog && onSuccess) {
                    onSuccess()
                } else {
                    router.push(`/recipes/${recipeId}`)
                }
            }
        } catch (error: unknown) {
            handleError(error, 'Save recipe', true, 'Gagal menyimpan resep')
        }
    }

    const addIngredient = () => {
        setRecipeIngredients([
            ...recipeIngredients,
            {
                ingredient_id: '',
                quantity: 0,
                unit: 'gram',
                notes: '',
            },
        ])
    }

    const removeIngredient = (index: number) => {
        setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))
    }

    const updateIngredient = (index: number, field: keyof RecipeIngredientForm, value: number | string) => {
        const updated = [...recipeIngredients]
        const current = updated[index]
        if (!current) {return}

        const safeValue = value ?? ''

        const updatedIngredient: RecipeIngredientForm = {
            ...(current.id ? { id: current.id } : {}),
            ingredient_id: field === 'ingredient_id' ? String(safeValue) : String(current.ingredient_id || ''),
            quantity: field === 'quantity' ? Number(safeValue) : Number(current.quantity || 0),
            unit: field === 'unit' ? String(safeValue) : String(current.unit || 'gram'),
            notes: field === 'notes' ? String(safeValue) : String(current.notes ?? ''),
        }

        updated[index] = updatedIngredient
        setRecipeIngredients(updated)
    }

    return (
        <div className="space-y-6">
            {!isDialog && (
                <>
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <button onClick={() => router.push('/recipes')} className="hover:text-foreground">
                            Resep Produk
                        </button>
                        <span>/</span>
                        <span className="text-foreground font-medium">
                            {mode === 'create' ? 'Tambah Resep Baru' : 'Edit Resep'}
                        </span>
                    </div>

                    {/* Header */}
                    <PageHeader
                        title={mode === 'create' ? 'Tambah Resep Baru' : 'Edit Resep'}
                        description={mode === 'create'
                            ? 'Buat resep baru untuk produk Anda'
                            : 'Perbarui informasi resep'}
                        icon={
                            <Button variant="ghost" size="sm" onClick={() => router.push('/recipes')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        }
                    />
                </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Dasar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Resep *</Label>
                                <Input
                                    id="name"
                                    value={formData.name ?? ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Roti Tawar Premium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={formData.category ?? 'other'}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bread">🍞 Roti</SelectItem>
                                        <SelectItem value="pastry">🥐 Pastry</SelectItem>
                                        <SelectItem value="cake">🍰 Kue</SelectItem>
                                        <SelectItem value="cookie">🍪 Cookie</SelectItem>
                                        <SelectItem value="other">👩‍🍳 Lainnya</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi</Label>
                             <Textarea
                                 id="description"
                                 value={formData.description ?? ''}
                                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                 placeholder="Deskripsi singkat tentang resep ini..."
                                 rows={3}
                             />
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="servings">Porsi</Label>
                                <Input
                                    id="servings"
                                    type="number"
                                    min="1"
                                    value={formData.servings ?? 1}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prep_time">Waktu Persiapan (menit)</Label>
                                <Input
                                    id="prep_time"
                                    type="number"
                                    min="0"
                                    value={formData.prep_time ?? 0}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cook_time">Waktu Memasak (menit)</Label>
                                <Input
                                    id="cook_time"
                                    type="number"
                                    min="0"
                                    value={formData.cook_time ?? 0}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                                <Select
                                    value={formData.difficulty ?? 'medium'}
                                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                                >
                                    <SelectTrigger id="difficulty">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">Mudah</SelectItem>
                                        <SelectItem value="medium">Sedang</SelectItem>
                                        <SelectItem value="hard">Sulit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ingredients */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Bahan-bahan</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Bahan
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recipeIngredients.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Belum ada bahan. Klik &#34;Tambah Bahan&#34; untuk mulai.</p>
                            </div>
                        ) : (
                            recipeIngredients.map((ri, index) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="flex-1 grid gap-3 md:grid-cols-4">
                                        <Select
                                            value={ri.ingredient_id}
                                            onValueChange={(value) => updateIngredient(index, 'ingredient_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih bahan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableIngredients.map((ing) => (
                                                    <SelectItem key={ing['id']} value={ing['id']}>
                                                        {ing.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Jumlah"
                                            value={ri.quantity || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                updateIngredient(index, 'quantity', parseFloat(e.target.value.replace(',', '.')) || 0)
                                            }
                                        />

                                        <Select
                                            value={ri.unit}
                                            onValueChange={(value) => updateIngredient(index, 'unit', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gram">gram</SelectItem>
                                                <SelectItem value="kg">kg</SelectItem>
                                                <SelectItem value="ml">ml</SelectItem>
                                                <SelectItem value="liter">liter</SelectItem>
                                                <SelectItem value="pcs">pcs</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Input
                                            placeholder="Catatan (opsional)"
                                            value={ri.notes ?? ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateIngredient(index, 'notes', e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeIngredient(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    {!isDialog && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/recipes')}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                    )}
                    {isDialog && onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Menyimpan...' : mode === 'create' ? 'Buat Resep' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

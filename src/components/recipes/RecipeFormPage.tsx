'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import type { Database } from '@/types/supabase-generated'

type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface RecipeFormPageProps {
    mode: 'create' | 'edit'
    recipeId?: string
}

interface RecipeIngredientForm {
    id?: string
    ingredient_id: string
    quantity: number
    unit: string
    notes?: string
}

export const RecipeFormPage = ({ mode, recipeId }: RecipeFormPageProps) => {
    const router = useRouter()
    const { toast } = useToast()

    const [loading, setLoading] = useState(false)
    const [ingredients, setIngredients] = useState<Ingredient[]>([])
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

    useEffect(() => {
        loadIngredients()
        if (mode === 'edit' && recipeId) {
            loadRecipe()
        }
    }, [mode, recipeId])

    const loadIngredients = async () => {
        try {
            const response = await fetch('/api/ingredients')
            if (response.ok) {
                const data = await response.json()
                setIngredients(data)
            }
        } catch (error: unknown) {
            console.error('Failed to load ingredients:', error)
        }
    }

    const loadRecipe = async () => {
        if (!recipeId) {return}

        try {
            setLoading(true)

            // Fetch recipe with ingredients from API
            const response = await fetch(`/api/recipes/${recipeId}`)
            if (!response.ok) {
                throw new Error('Gagal memuat resep')
            }

            const recipe = await response.json()
            setFormData(recipe)

            // Load recipe ingredients from the response
            if (recipe.recipe_ingredients && Array.isArray(recipe.recipe_ingredients)) {
                setRecipeIngredients(
                    recipe.recipe_ingredients.map((ri: any) => ({
                        id: ri.id,
                        ingredient_id: ri.ingredient_id,
                        quantity: ri.quantity,
                        unit: ri.unit,
                        notes: ri.notes || '',
                    }))
                )
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal memuat resep'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
            router.push('/recipes')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name) {
            toast({
                title: 'Validasi Error',
                description: 'Nama resep harus diisi',
                variant: 'destructive',
            })
            return
        }

        // Validate ingredients
        if (recipeIngredients.length === 0) {
            toast({
                title: 'Validasi Error',
                description: 'Resep harus memiliki minimal 1 bahan',
                variant: 'destructive',
            })
            return
        }

        // Validate each ingredient
        for (const ri of recipeIngredients) {
            if (!ri.ingredient_id || ri.quantity <= 0) {
                toast({
                    title: 'Validasi Error',
                    description: 'Semua bahan harus dipilih dan memiliki jumlah yang valid',
                    variant: 'destructive',
                })
                return
            }
        }

        try {
            setLoading(true)

            if (mode === 'create') {
                // Use API route for create (handles ingredients atomically)
                const response = await fetch('/api/recipes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        recipe_ingredients: recipeIngredients.map(ri => ({
                            ingredient_id: ri.ingredient_id,
                            quantity: ri.quantity,
                            unit: ri.unit,
                            notes: ri.notes,
                        })),
                    }),
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Gagal membuat resep')
                }

                const newRecipe = await response.json()

                toast({
                    title: 'Resep dibuat',
                    description: `${formData.name} berhasil dibuat dengan ${recipeIngredients.length} bahan`,
                })

                router.push(`/recipes/${newRecipe.id}`)
            } else if (recipeId) {
                // Use API route for update (handles ingredients atomically)
                const response = await fetch(`/api/recipes/${recipeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        recipe_ingredients: recipeIngredients.map(ri => ({
                            ingredient_id: ri.ingredient_id,
                            quantity: ri.quantity,
                            unit: ri.unit,
                            notes: ri.notes,
                        })),
                    }),
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Gagal memperbarui resep')
                }

                toast({
                    title: 'Resep diperbarui',
                    description: `${formData.name} berhasil diperbarui dengan ${recipeIngredients.length} bahan`,
                })

                router.push(`/recipes/${recipeId}`)
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menyimpan resep'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
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

    const updateIngredient = (index: number, field: keyof RecipeIngredientForm, value: string | number) => {
        const updated = [...recipeIngredients]
        updated[index] = { ...updated[index], [field]: value }
        setRecipeIngredients(updated)
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={() => router.push('/recipes')} className="hover:text-foreground">
                    Resep Produk
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">
                    {mode === 'create' ? 'Tambah Resep Baru' : 'Edit Resep'}
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push('/recipes')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {mode === 'create' ? 'Tambah Resep Baru' : 'Edit Resep'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {mode === 'create'
                            ? 'Buat resep baru untuk produk Anda'
                            : 'Perbarui informasi resep'}
                    </p>
                </div>
            </div>

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
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Roti Tawar Premium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Kategori</Label>
                                <Select
                                    value={formData.category || 'other'}
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
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                    value={formData.servings || 1}
                                    onChange={(e) =>
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
                                    value={formData.prep_time || 0}
                                    onChange={(e) =>
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
                                    value={formData.cook_time || 0}
                                    onChange={(e) =>
                                        setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
                                <Select
                                    value={formData.difficulty || 'medium'}
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
                                <p>Belum ada bahan. Klik "Tambah Bahan" untuk mulai.</p>
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
                                                {ingredients.map((ing) => (
                                                    <SelectItem key={ing.id} value={ing.id}>
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
                                            onChange={(e) =>
                                                updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)
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
                                            value={ri.notes || ''}
                                            onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeIngredient(index)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/recipes')}
                        disabled={loading}
                    >
                        Batal
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Menyimpan...' : mode === 'create' ? 'Buat Resep' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

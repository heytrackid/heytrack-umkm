'use client'

import { Plus, Trash2, Save, X, ChefHat, Clock, Users, DollarSign } from '@/components/icons'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
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
import { toast } from '@/lib/toast'
import { useCurrency } from '@/hooks/useCurrency'

interface RecipeIngredient {
    id?: string
    ingredient_id: string
    ingredient_name: string
    quantity: number
    unit: string
    price_per_unit: number
}

interface RecipeStep {
    id?: string
    step_number: number
    instruction: string
    duration_minutes?: number
}

interface RecipeData {
    id?: string
    name: string
    description: string
    category: string
    servings: number
    prep_time_minutes: number
    cook_time_minutes: number
    ingredients: RecipeIngredient[]
    steps: RecipeStep[]
    notes?: string
}

interface RecipeEditorProps {
    initialData?: RecipeData
    availableIngredients: Array<{
        id: string
        name: string
        unit: string
        price_per_unit: number
        category?: string
    }>
    onSave: (data: RecipeData) => Promise<void>
    onCancel: () => void
}

const RECIPE_CATEGORIES = [
    { value: 'bread', label: 'Roti' },
    { value: 'cake', label: 'Kue' },
    { value: 'pastry', label: 'Pastry' },
    { value: 'cookies', label: 'Cookies' },
    { value: 'donuts', label: 'Donat' },
    { value: 'other', label: 'Lainnya' },
]

export const RecipeEditor = ({
    initialData,
    availableIngredients,
    onSave,
    onCancel
}: RecipeEditorProps) => {
    const { formatCurrency } = useCurrency()

    const [saving, setSaving] = useState(false)
    const [recipe, setRecipe] = useState<RecipeData>(initialData ?? {
        name: '',
        description: '',
        category: 'other',
        servings: 1,
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        ingredients: [],
        steps: [],
        notes: ''
    })

    const [newIngredient, setNewIngredient] = useState({
        ingredient_id: '',
        quantity: 0,
        unit: 'gram'
    })

    const [newStep, setNewStep] = useState({
        instruction: '',
        duration_minutes: 0
    })

    // Calculate total cost
    const totalCost = recipe.ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.price_per_unit), 0)

    const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes

    const addIngredient = () => {
        if (!newIngredient.ingredient_id || newIngredient.quantity <= 0) { return }

        const ingredient = availableIngredients.find(i => i['id'] === newIngredient.ingredient_id)
        if (!ingredient) { return }

        setRecipe({
            ...recipe,
            ingredients: [
                ...recipe.ingredients,
                {
                    ingredient_id: ingredient['id'],
                    ingredient_name: ingredient.name,
                    quantity: newIngredient.quantity,
                    unit: newIngredient.unit,
                    price_per_unit: ingredient.price_per_unit
                }
            ]
        })

        setNewIngredient({
            ingredient_id: '',
            quantity: 0,
            unit: 'gram'
        })
    }

    const removeIngredient = (index: number) => {
        setRecipe({
            ...recipe,
            ingredients: recipe.ingredients.filter((_, i) => i !== index)
        })
    }

    const addStep = () => {
        if (!newStep.instruction.trim()) { return }

        setRecipe({
            ...recipe,
            steps: [
                ...recipe.steps,
                {
                    step_number: recipe.steps.length + 1,
                    instruction: newStep.instruction,
                    duration_minutes: newStep.duration_minutes || undefined
                }
            ]
        })

        setNewStep({
            instruction: '',
            duration_minutes: 0
        })
    }

    const removeStep = (index: number) => {
        setRecipe({
            ...recipe,
            steps: recipe.steps
                .filter((_, i) => i !== index)
                .map((step, i) => ({ ...step, step_number: i + 1 }))
        })
    }

    const moveStep = (index: number, direction: 'down' | 'up') => {
        const newSteps = [...recipe.steps]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= newSteps.length) { return }

        const stepAtIndex = newSteps[index]
        const stepAtTargetIndex = newSteps[targetIndex]
        
        if (!stepAtIndex || !stepAtTargetIndex) { return }

        newSteps[index] = stepAtTargetIndex
        newSteps[targetIndex] = stepAtIndex

        setRecipe({
            ...recipe,
            steps: newSteps.map((step, i) => ({ ...step, step_number: i + 1 }))
        })
    }

    const handleSave = async () => {
        if (!recipe.name.trim()) {
            toast.error('Nama resep harus diisi!')
            return
        }

        if (recipe.ingredients.length === 0) {
            toast.error('Minimal harus ada 1 bahan!')
            return
        }

        setSaving(true)
        try {
            await onSave(recipe)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-2 border-border/20  bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-950/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                             <ChefHat className="h-6 w-6 text-muted-foreground" />
                            {initialData ? 'Edit Resep' : 'Resep Baru'}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onCancel} disabled={saving}>
                                <X className="h-4 w-4 mr-2" />
                                Batal
                            </Button>
                            <Button onClick={handleSave} disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-card rounded-lg border">
                             <div className="text-lg font-bold text-foreground">{recipe.ingredients.length}</div>
                            <div className="text-xs text-muted-foreground">Bahan</div>
                        </div>
                        <div className="text-center p-3 bg-card rounded-lg border">
                             <div className="text-lg font-bold text-foreground">{recipe.steps.length}</div>
                            <div className="text-xs text-muted-foreground">Langkah</div>
                        </div>
                        <div className="text-center p-3 bg-card rounded-lg border">
                            <div className="text-lg font-bold text-orange-600">{totalTime} min</div>
                            <div className="text-xs text-muted-foreground">Total Waktu</div>
                        </div>
                        <div className="text-center p-3 bg-card rounded-lg border">
                             <div className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</div>
                            <div className="text-xs text-muted-foreground">Est. HPP</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Dasar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Label htmlFor="name">Nama Resep *</Label>
                            <Input
                                id="name"
                                value={recipe.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipe({ ...recipe, name: e.target.value })}
                                placeholder="Contoh: Roti Sobek Coklat"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={recipe.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecipe({ ...recipe, description: e.target.value })}
                                placeholder="Deskripsi singkat tentang produk ini..."
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Kategori</Label>
                            <Select value={recipe.category} onValueChange={(v) => setRecipe({ ...recipe, category: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RECIPE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="servings">Jumlah Hasil</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="servings"
                                    type="number"
                                    value={recipe.servings}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipe({ ...recipe, servings: Number(e.target.value) })}
                                    min={1}
                                />
                                <Badge variant="outline" className="px-3 flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    porsi
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="prep_time">Waktu Persiapan</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="prep_time"
                                    type="number"
                                    value={recipe.prep_time_minutes}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipe({ ...recipe, prep_time_minutes: Number(e.target.value) })}
                                    min={0}
                                />
                                <Badge variant="outline" className="px-3 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    menit
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="cook_time">Waktu Memasak</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="cook_time"
                                    type="number"
                                    value={recipe.cook_time_minutes}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipe({ ...recipe, cook_time_minutes: Number(e.target.value) })}
                                    min={0}
                                />
                                <Badge variant="outline" className="px-3 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    menit
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Bahan-Bahan ({recipe.ingredients.length})</span>
                        <Badge variant="secondary" className="gap-1">
                            <DollarSign className="h-3 w-3" />
                            Total: {formatCurrency(totalCost)}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add Ingredient Form */}
                    <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-5">
                                <Label className="text-xs">Bahan</Label>
                                <Select
                                    value={newIngredient.ingredient_id}
                                    onValueChange={(v) => {
                                        const ing = availableIngredients.find(i => i['id'] === v)
                                        setNewIngredient({
                                            ...newIngredient,
                                            ingredient_id: v,
                                            unit: ing?.unit ?? 'gram'
                                        })
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih bahan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableIngredients.map(ing => (
                                            <SelectItem key={ing['id']} value={ing['id']}>
                                                {ing.name} ({formatCurrency(ing.price_per_unit)}/{ing.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-3">
                                <Label className="text-xs">Jumlah</Label>
                                <Input
                                    type="number"
                                    value={newIngredient.quantity || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
                                    placeholder="0"
                                    min={0}
                                    step={0.1}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label className="text-xs">Satuan</Label>
                                <Input
                                    value={newIngredient.unit}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                    placeholder="gram"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-end">
                                <Button onClick={addIngredient} className="w-full">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients List */}
                    <div className="space-y-2">
                        {recipe.ingredients.map((ing, idx) => {
                            const cost = ing.quantity * ing.price_per_unit
                            const percent = totalCost > 0 ? (cost / totalCost) * 100 : 0
                            const ingredientKey = ing.ingredient_id || `${ing['ingredient_name']}-${idx}`

                            return (
                                <div key={ingredientKey} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{ing['ingredient_name']}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {percent.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {ing.quantity} {ing.unit} × {formatCurrency(ing.price_per_unit)} = {formatCurrency(cost)}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeIngredient(idx)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            )
                        })}

                        {recipe.ingredients.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada bahan. Tambahkan bahan pertama di atas.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Steps */}
            <Card>
                <CardHeader>
                    <CardTitle>Langkah-Langkah ({recipe.steps.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add Step Form */}
                    <div className="p-4 bg-muted rounded-lg border-2 border-dashed">
                        <div className="space-y-3">
                            <div>
                                <Label className="text-xs">Instruksi</Label>
                                <Textarea
                                    value={newStep.instruction}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewStep({ ...newStep, instruction: e.target.value })}
                                    placeholder="Contoh: Campurkan tepung, gula, dan garam dalam wadah besar..."
                                    rows={2}
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label className="text-xs">Durasi (opsional)</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={newStep.duration_minutes || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStep({ ...newStep, duration_minutes: Number(e.target.value) })}
                                            placeholder="0"
                                            min={0}
                                        />
                                        <Badge variant="outline" className="px-3 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            menit
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={addStep}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tambah Langkah
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Steps List */}
                    <div className="space-y-2">
                        {recipe.steps.map((step, idx) => {
                            const stepKey = step['id'] ?? `step-${step.step_number}-${idx}`
                            return (
                                <div key={stepKey} className="flex gap-3 p-4 bg-card rounded-lg border">
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveStep(idx, 'up')}
                                            disabled={idx === 0}
                                            className="h-6 w-6 p-0"
                                        >
                                            ↑
                                        </Button>
                                         <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                                            {step.step_number}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => moveStep(idx, 'down')}
                                            disabled={idx === recipe.steps.length - 1}
                                            className="h-6 w-6 p-0"
                                        >
                                            ↓
                                        </Button>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm mb-2">{step.instruction}</p>
                                        {step.duration_minutes && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <Clock className="h-3 w-3" />
                                                {step.duration_minutes} menit
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeStep(idx)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            )
                        })}

                        {recipe.steps.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada langkah. Tambahkan langkah pertama di atas.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Catatan Tambahan (Opsional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={recipe.notes}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecipe({ ...recipe, notes: e.target.value })}
                        placeholder="Tips, variasi, atau catatan penting lainnya..."
                        rows={4}
                    />
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel} disabled={saving}>
                    Batal
                </Button>
                <Button onClick={handleSave} disabled={saving} size="lg">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Menyimpan...' : 'Simpan Resep'}
                </Button>
            </div>
        </div>
    )
}

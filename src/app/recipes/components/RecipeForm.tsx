'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import categoriesData from '@/data/categories.json'
import { useResponsive } from '@/hooks/useResponsive'
import {
  ArrowLeft,
  ChefHat,
  Plus,
  Trash2
} from 'lucide-react'

interface RecipeIngredient {
  ingredient_id: string
  quantity: number
  unit: string
}

interface Recipe {
  name: string
  category: string
  description: string
  ingredients: RecipeIngredient[]
}

interface Ingredient {
  id: string
  name: string
  unit: string
}

interface RecipeFormProps {
  recipe: Recipe
  ingredients: Ingredient[]
  isEditing: boolean
  onRecipeChange: (recipe: Recipe) => void
  onSave: () => void
  onCancel: () => void
}

export const RecipeForm = ({
  recipe,
  ingredients,
  isEditing,
  onRecipeChange,
  onSave,
  onCancel
}: RecipeFormProps) => {
  const { isMobile } = useResponsive()

  // Get common ingredients based on category
  const getCommonIngredientsByCategory = (categoryId: string) => {
    const category = categoriesData.categories.find(cat => cat.id === categoryId || cat.name === categoryId)
    return category?.commonIngredients || []
  }

  const getDefaultQuantityByIngredient = (name: string) => {
    const lowerName = name.toLowerCase()
    // Check JSON data first
    for (const [key, config] of Object.entries(categoriesData.defaultIngredientQuantities)) {
      if (lowerName.includes(key.toLowerCase())) {
        return config.quantity
      }
    }
    return 100 // Default fallback
  }

  const handleQuickAddIngredients = () => {
    if (!ingredients) { return }

    const commonIngredientNames = getCommonIngredientsByCategory(recipe.category)
    const availableIngredients = commonIngredientNames
      .map(name => ingredients.find(ing =>
        ing.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(ing.name.toLowerCase())
      ))
      .filter(Boolean)

    // Avoid duplicate ingredients
    const existingIngredientIds = new Set(recipe.ingredients.map(ing => ing.ingredient_id))
    const newIngredients = availableIngredients
      .filter(ing => !existingIngredientIds.has(ing!.id))
      .map(ing => ({
        ingredient_id: ing!.id,
        quantity: 1,
        unit: ing!.unit
      }))

    onRecipeChange({
      ...recipe,
      ingredients: [...recipe.ingredients, ...newIngredients]
    })
  }

  // Auto-populate ingredients when category changes
  useEffect(() => {
    if (recipe.category && recipe.category !== '' && ingredients && recipe.ingredients.length === 0) {
      void handleQuickAddIngredients()
    }
  }, [recipe.category, ingredients, recipe.ingredients.length])

  const handleAddIngredient = () => {
    onRecipeChange({
      ...recipe,
      ingredients: [...recipe.ingredients, { ingredient_id: '', quantity: 0, unit: 'gram' }]
    })
  }

  const handleRemoveIngredient = (index: number) => {
    onRecipeChange({
      ...recipe,
      ingredients: recipe.ingredients.filter((_: any, i: number) => i !== index)
    })
  }

  const handleUpdateIngredient = (index: number, field: string, value: any) => {
    const updatedIngredients = recipe.ingredients.map((ing: any, i: number) =>
      i === index ? { ...ing, [field]: value } : ing
    )
    onRecipeChange({
      ...recipe,
      ingredients: updatedIngredients
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
              {isEditing ? 'Edit Resep' : 'Tambah Resep Baru'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Recipe Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipe-name" className="text-sm font-medium">
              Nama Resep
            </Label>
            <Input
              id="recipe-name"
              value={recipe.name}
              onChange={(e) => onRecipeChange({ ...recipe, name: e.target.value })}
              placeholder="Contoh: Nasi Goreng Spesial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipe-category" className="text-sm font-medium">
              Kategori
            </Label>
            <Select
              value={recipe.category}
              onValueChange={(value) => onRecipeChange({ ...recipe, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipe-description" className="text-sm font-medium">
            Deskripsi (Opsional)
          </Label>
          <Textarea
            id="recipe-description"
            value={recipe.description}
            onChange={(e) => onRecipeChange({ ...recipe, description: e.target.value })}
            placeholder="Deskripsi singkat tentang resep ini..."
            rows={3}
          />
        </div>

        {/* Ingredients Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">
              Bahan-Bahan
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddIngredient}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan
            </Button>
          </div>

          <div className="space-y-3">
            {recipe.ingredients.map((ingredient: RecipeIngredient, index: number) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-xs text-gray-600">
                    Bahan Baku
                  </Label>
                  <Select
                    value={ingredient.ingredient_id}
                    onValueChange={(value) => handleUpdateIngredient(index, 'ingredient_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients?.map((ing: Ingredient) => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label className="text-xs text-gray-600">
                    Jumlah
                  </Label>
                  <Input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => handleUpdateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="w-20">
                  <Label className="text-xs text-gray-600">
                    Satuan
                  </Label>
                  <Select
                    value={ingredient.unit}
                    onValueChange={(value) => handleUpdateIngredient(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gram">Gram</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="ml">mL</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="pcs">Pcs</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveIngredient(index)}
                  disabled={recipe.ingredients.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {recipe.ingredients.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Belum ada bahan. Klik "Tambah Bahan" untuk menambahkan.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onSave}>
            {isEditing ? 'Simpan Perubahan' : 'Tambah Resep'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

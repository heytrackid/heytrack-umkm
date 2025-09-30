'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useI18n } from '@/providers/I18nProvider'
import categoriesData from '@/data/categories.json'

interface RecipeFormProps {
  recipe: any
  ingredients: any[]
  onCancel: () => void
  onSave: (recipe: any) => void
  isMobile?: boolean
}

/**
 * Recipe Form Component
 * Extracted from resep/page.tsx for code splitting
 */
export default function RecipeForm({ 
  recipe, 
  ingredients,
  onCancel, 
  onSave,
  isMobile = false 
}: RecipeFormProps) {
  const { t } = useI18n()
  const [formData, setFormData] = React.useState(recipe || {
    name: '',
    category: '',
    description: '',
    serving_size: 1,
    prep_time: 0,
    cook_time: 0,
    ingredients: []
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.category) {
      alert('Please fill in required fields')
      return
    }
    onSave(formData)
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { ingredient_id: '', quantity: 0, unit: 'g' }
      ]
    }))
  }

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_: any, i: number) => i !== index)
    }))
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing: any, i: number) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {recipe ? t('recipes.editRecipe') : t('recipes.addNewRecipe')}
          </h2>
          <p className="text-muted-foreground">
            {recipe ? t('recipes.updateRecipeDesc') : t('recipes.createRecipeDesc')}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label>{t('recipes.productName')}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('recipes.productNamePlaceholder')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('forms.labels.category')}</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriesData.categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('forms.labels.description')}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('recipes.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('recipes.servingSize')}</Label>
              <Input
                type="number"
                value={formData.serving_size}
                onChange={(e) => setFormData(prev => ({ ...prev, serving_size: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('recipes.prepTime')}</Label>
              <Input
                type="number"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('recipes.cookTime')}</Label>
              <Input
                type="number"
                value={formData.cook_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cook_time: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-lg">{t('recipes.ingredients')}</Label>
              <Button variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-2" />
                {t('recipes.addIngredient')}
              </Button>
            </div>

            {formData.ingredients.map((ing: any, index: number) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-sm">{t('recipes.ingredient')}</Label>
                  <Select
                    value={ing.ingredient_id}
                    onValueChange={(value) => updateIngredient(index, 'ingredient_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('recipes.selectIngredient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.map(ingredient => (
                        <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                          {ingredient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-sm">{t('recipes.quantity')}</Label>
                  <Input
                    type="number"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="w-20">
                  <Label className="text-sm">{t('recipes.unit')}</Label>
                  <Select
                    value={ing.unit}
                    onValueChange={(value) => updateIngredient(index, 'unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="pcs">pcs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {formData.ingredients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('recipes.noIngredientsYet')}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {recipe ? t('common.actions.update') : t('common.actions.save')}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              {t('common.actions.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

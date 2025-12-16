'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { BUTTON_TEXTS, FORM_LABELS, LOADING_TEXTS } from '@/lib/shared'
import type { GeneratedRecipe } from '@/services/ai'
import { Plus, Save, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface RecipeEditorProps {
  recipe: GeneratedRecipe
  onSave: (recipe: GeneratedRecipe) => void
  onCancel: () => void
  isSaving?: boolean
}

export function RecipeEditor({ recipe, onSave, onCancel, isSaving = false }: RecipeEditorProps) {
  const [editedRecipe, setEditedRecipe] = useState<GeneratedRecipe>({ ...recipe })

  const handleIngredientChange = (index: number, field: string, value: string | number) => {
    const newIngredients = [...editedRecipe.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value } as typeof newIngredients[0]
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients })
  }

  const handleAddIngredient = () => {
    const newIngredient: typeof editedRecipe.ingredients[0] = { name: '', quantity: 0, unit: '' }
    setEditedRecipe({
      ...editedRecipe,
      ingredients: [...editedRecipe.ingredients, newIngredient]
    })
  }

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = editedRecipe.ingredients.filter((_, i) => i !== index)
    setEditedRecipe({ ...editedRecipe, ingredients: newIngredients })
  }

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...editedRecipe.instructions]
    newInstructions[index] = value
    setEditedRecipe({ ...editedRecipe, instructions: newInstructions })
  }

  const handleAddInstruction = () => {
    setEditedRecipe({
      ...editedRecipe,
      instructions: [...editedRecipe.instructions, '']
    })
  }

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = editedRecipe.instructions.filter((_, i) => i !== index)
    setEditedRecipe({ ...editedRecipe, instructions: newInstructions })
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.RECIPE_NAME}</label>
              <Input
                value={editedRecipe.name}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
                placeholder={FORM_LABELS.RECIPE_NAME}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.CATEGORY}</label>
              <Input
                value={editedRecipe.category || ''}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, category: e.target.value })}
                placeholder={FORM_LABELS.CATEGORY}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">{FORM_LABELS.DESCRIPTION}</label>
            <Textarea
              value={editedRecipe.description || ''}
              onChange={(e) => setEditedRecipe({ ...editedRecipe, description: e.target.value })}
              placeholder={FORM_LABELS.DESCRIPTION}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.SERVINGS}</label>
              <Input
                type="number"
                min="1"
                value={editedRecipe.servings || 4}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, servings: parseInt(e.target.value) || 4 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.PREP_TIME}</label>
              <Input
                type="number"
                min="0"
                value={editedRecipe.prep_time_minutes || 0}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, prep_time_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{FORM_LABELS.COOK_TIME}</label>
              <Input
                type="number"
                min="0"
                value={editedRecipe.cook_time_minutes || 0}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, cook_time_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <select
                className="w-full h-10 px-3 border rounded-md"
                value={editedRecipe.difficulty || 'Medium'}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, difficulty: e.target.value })}
              >
                <option value="Simple">Simple</option>
                <option value="Medium">Medium</option>
                <option value="Complex">Complex</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bahan-bahan</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
            <Plus className="h-4 w-4 mr-1" />
            {BUTTON_TEXTS.ADD}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {editedRecipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Input
                className="flex-1"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                placeholder={FORM_LABELS.INGREDIENT}
              />
              <Input
                className="w-20"
                type="number"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                placeholder={FORM_LABELS.QUANTITY}
              />
              <Input
                className="w-24"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                placeholder={FORM_LABELS.UNIT}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveIngredient(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Langkah-langkah</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={handleAddInstruction}>
            <Plus className="h-4 w-4 mr-1" />
            {BUTTON_TEXTS.ADD}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {editedRecipe.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-2">
                {index + 1}
              </span>
              <Textarea
                className="flex-1"
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                placeholder={`Langkah ${index + 1}`}
                rows={2}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveInstruction(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {BUTTON_TEXTS.CANCEL}
        </Button>
        <Button type="button" onClick={() => onSave(editedRecipe)} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? LOADING_TEXTS.SAVING : BUTTON_TEXTS.SAVE_CHANGES}
        </Button>
      </div>
    </div>
  )
}

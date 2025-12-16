'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { GeneratedRecipe } from '@/services/ai'
import { ChefHat, Clock, DollarSign, Edit, Save, Users } from 'lucide-react'

interface RecipePreviewProps {
  recipe: GeneratedRecipe
  onSave?: () => void
  onEdit?: () => void
  isSaving?: boolean
}

export function RecipePreview({ recipe, onSave, onEdit, isSaving = false }: RecipePreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'simple':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'complex':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Recipe Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-2xl">
                <ChefHat className="h-6 w-6" />
                {recipe.name}
              </CardTitle>
              {recipe.description && (
                <CardDescription className="text-base">
                  {recipe.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onSave && (
                <Button size="sm" onClick={onSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Recipe'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 grid-cols-1 md:grid-cols-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{recipe.servings} porsi</p>
                <p className="text-xs text-muted-foreground">Servings</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{recipe.total_time_minutes || 0} menit</p>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{formatCurrency(recipe.totalCost || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Badge className={getDifficultyColor(recipe.difficulty || '')}>
                {recipe.difficulty || 'Medium'}
              </Badge>
            </div>
          </div>
          
          {/* Cost Breakdown */}
          {(recipe.costPerServing || recipe.cost_info?.cost_per_serving) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                <span className="text-muted-foreground">Cost per serving:</span>
                <span className="font-medium">
                  {formatCurrency(recipe.costPerServing || recipe.cost_info?.cost_per_serving || 0)}
                </span>
              </div>
              {recipe.budgetCompliance !== null && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Budget compliant:</span>
                  <Badge variant={recipe.budgetCompliance ? 'default' : 'destructive'}>
                    {recipe.budgetCompliance ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              {recipe.totalPotentialSavings && recipe.totalPotentialSavings > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Potential savings:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(recipe.totalPotentialSavings)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Bahan-bahan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {recipe.ingredients?.map((ingredient, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-lg bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm">•</span>
                  <span className="text-sm font-medium">{ingredient.name}</span>
                  {ingredient.notes && (
                    <span className="text-xs text-muted-foreground">({ingredient.notes})</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                  {ingredient.actualCost && (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(ingredient.actualCost)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Cara Memasak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipe.instructions?.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {index + 1}
                </div>
                <p className="text-sm">{instruction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Info */}
      {recipe.nutrition_info && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Nutrisi (per porsi)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{recipe.nutrition_info.calories}</p>
                <p className="text-xs text-muted-foreground">Kalori</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{recipe.nutrition_info.protein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{recipe.nutrition_info.carbs}g</p>
                <p className="text-xs text-muted-foreground">Karbohidrat</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{recipe.nutrition_info.fat}g</p>
                <p className="text-xs text-muted-foreground">Lemak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

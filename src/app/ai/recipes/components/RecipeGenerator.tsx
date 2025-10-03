// Recipe Generator UI Components

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChefHat,
  Clock,
  Users,
  Flame,
  Star,
  Heart,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { IndonesianFoodCategory, GeneratedRecipe, RecipeIngredient, RecipeInstruction } from '../types/recipe.types'
import { useRecipeGenerator, useRecipeSuggestions } from '../hooks/useRecipeGenerator'

interface RecipeGeneratorProps {
  className?: string
}

export function RecipeGenerator({ className }: RecipeGeneratorProps) {
  const {
    categories,
    selectedCategory,
    recipeRequest,
    generatedRecipe,
    isGenerating,
    error,
    setSelectedCategory,
    updateRecipeRequest,
    generateRecipe,
    clearRecipe,
    saveRecipe,
    clearError
  } = useRecipeGenerator()

  const { suggestions, isLoading: suggestionsLoading } = useRecipeSuggestions(
    selectedCategory?.id,
    !!selectedCategory
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-gray-900">AI Recipe Generator</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate authentic Indonesian recipes with AI. Choose from traditional dishes
          across all regions of Indonesia.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="h-auto p-1 ml-2"
            >
              ✕
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recipe Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Configure Your Recipe
            </CardTitle>
            <CardDescription>
              Select category and customize your recipe preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-3">
              <Label htmlFor="category">Food Category</Label>
              <Select
                value={selectedCategory?.id || ''}
                onValueChange={(value) => {
                  const category = categories.find(c => c.id === value)
                  setSelectedCategory(category || null)
                  updateRecipeRequest({ category: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a food category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory Selection */}
            {selectedCategory && (
              <div className="space-y-3">
                <Label htmlFor="subcategory">Specific Type</Label>
                <Select
                  value={recipeRequest.subcategory || ''}
                  onValueChange={(value) => updateRecipeRequest({ subcategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a specific dish type" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCategory.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Specific Dish Input */}
            <div className="space-y-3">
              <Label htmlFor="specificDish">Specific Dish (Optional)</Label>
              <Input
                id="specificDish"
                placeholder="e.g., Nasi Goreng Spesial, Rendang Padang..."
                value={recipeRequest.specificDish || ''}
                onChange={(e) => updateRecipeRequest({ specificDish: e.target.value })}
              />
            </div>

            {/* Popular Suggestions */}
            {selectedCategory && suggestions.length > 0 && (
              <div className="space-y-3">
                <Label>Popular Dishes</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((dish, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => updateRecipeRequest({ specificDish: dish })}
                      className="text-xs"
                    >
                      {dish}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Recipe Preferences */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="servingSize">Serving Size</Label>
                <Select
                  value={recipeRequest.servingSize?.toString() || '4'}
                  onValueChange={(value) => updateRecipeRequest({ servingSize: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Person</SelectItem>
                    <SelectItem value="2">2 People</SelectItem>
                    <SelectItem value="4">4 People</SelectItem>
                    <SelectItem value="6">6 People</SelectItem>
                    <SelectItem value="8">8 People</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={recipeRequest.difficulty || 'medium'}
                  onValueChange={(value: any) => updateRecipeRequest({ difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookingTime">Cooking Time</Label>
                <Select
                  value={recipeRequest.cookingTime || 'normal'}
                  onValueChange={(value: any) => updateRecipeRequest({ cookingTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (&lt; 30 min)</SelectItem>
                    <SelectItem value="normal">Normal (30-60 min)</SelectItem>
                    <SelectItem value="extended">Extended (&gt; 60 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spiceLevel">Spice Level</Label>
                <Select
                  value={recipeRequest.spiceLevel || 'medium'}
                  onValueChange={(value: any) => updateRecipeRequest({ spiceLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="spicy">Spicy</SelectItem>
                    <SelectItem value="very-spicy">Very Spicy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateRecipe}
              disabled={isGenerating || !selectedCategory}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Recipe...
                </>
              ) : (
                <>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Generate Recipe
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Recipe Display */}
        <div className="space-y-6">
          {generatedRecipe ? (
            <RecipeDisplay
              recipe={generatedRecipe}
              onSave={() => saveRecipe(generatedRecipe)}
              onRegenerate={generateRecipe}
              onClear={clearRecipe}
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <ChefHat className="h-16 w-16 text-gray-300 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">No Recipe Generated</h3>
                    <p className="text-gray-500">
                      Configure your preferences and click "Generate Recipe" to create an authentic Indonesian dish.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// Recipe Display Component
interface RecipeDisplayProps {
  recipe: GeneratedRecipe
  onSave: () => void
  onRegenerate: () => void
  onClear: () => void
}

function RecipeDisplay({ recipe, onSave, onRegenerate, onClear }: RecipeDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Recipe Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{recipe.title}</CardTitle>
              <CardDescription>{recipe.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={onClear}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Recipe Meta */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{recipe.cookingTime} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{recipe.servingSize} servings</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-gray-500" />
              <span className="text-sm capitalize">{recipe.difficulty}</span>
            </div>
            <Badge variant={
              recipe.spiceLevel === 'mild' ? 'secondary' :
              recipe.spiceLevel === 'medium' ? 'default' :
              recipe.spiceLevel === 'spicy' ? 'destructive' : 'destructive'
            }>
              {recipe.spiceLevel.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Cultural Context */}
          {recipe.culturalContext && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{recipe.culturalContext.region}</strong>
                {recipe.culturalContext.festival && ` - Popular during ${recipe.culturalContext.festival}`}
                {recipe.culturalContext.tradition && ` - ${recipe.culturalContext.tradition}`}
                {recipe.culturalContext.notes && <div className="mt-2">{recipe.culturalContext.notes}</div>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recipe.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <span className="font-medium">{ingredient.name}</span>
                  {ingredient.notes && (
                    <span className="text-sm text-gray-500 ml-2">({ingredient.notes})</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                  {ingredient.substitutes && ingredient.substitutes.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Alt: {ingredient.substitutes.join(', ')}
                    </div>
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
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recipe.instructions.map((instruction) => (
              <div key={instruction.id} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {instruction.step}
                </div>
                <div className="flex-1 space-y-2">
                  <p>{instruction.instruction}</p>
                  {(instruction.duration || instruction.temperature) && (
                    <div className="flex gap-4 text-sm text-gray-600">
                      {instruction.duration && (
                        <span>⏱️ {instruction.duration} min</span>
                      )}
                      {instruction.temperature && (
                        <span>🌡️ {instruction.temperature}°C</span>
                      )}
                    </div>
                  )}
                  {instruction.tips && instruction.tips.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">💡 Tips:</p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        {instruction.tips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutritional Information */}
      {recipe.nutritionalInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Nutritional Information</CardTitle>
            <CardDescription>Per serving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{recipe.nutritionalInfo.calories}</div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{recipe.nutritionalInfo.protein}g</div>
                <div className="text-sm text-gray-500">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{recipe.nutritionalInfo.carbs}g</div>
                <div className="text-sm text-gray-500">Carbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{recipe.nutritionalInfo.fat}g</div>
                <div className="text-sm text-gray-500">Fat</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center">
              <div>
                <div className="font-medium">{recipe.nutritionalInfo.fiber}g</div>
                <div className="text-sm text-gray-500">Fiber</div>
              </div>
              <div>
                <div className="font-medium">{recipe.nutritionalInfo.sugar}g</div>
                <div className="text-sm text-gray-500">Sugar</div>
              </div>
              <div>
                <div className="font-medium">{recipe.nutritionalInfo.sodium}mg</div>
                <div className="text-sm text-gray-500">Sodium</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

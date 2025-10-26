'use client'
import * as React from 'react'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, PackageOpen, Calculator } from 'lucide-react'

interface RecipeStatsProps {
  recipes: unknown[]
  ingredients: unknown[]
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

/**
 * Recipe Statistics Component
 * Shows summary stats for recipes
 */
export default function RecipeStats({
  recipes,
  ingredients,
  formatCurrency,
  isMobile = false
}: RecipeStatsProps) {
  
  // Calculate stats
  const stats = useMemo(() => {
    const totalRecipes = recipes.length
    const recipesWithIngredients = recipes.filter(r => (r.recipe_ingredients?.length || 0) > 0).length
    const recipesWithoutIngredients = totalRecipes - recipesWithIngredients
    
    // Calculate average HPP
    const totalHPP = recipes.reduce((sum, recipe) => {
      if (!recipe.recipe_ingredients || !ingredients) {return sum}
      
      const hpp = recipe.recipe_ingredients.reduce((total: number, ri: any) => {
        const ingredient = ingredients.find(ing => ing.id === ri.ingredient_id)
        if (!ingredient) {return total}
        return total + (ingredient.price_per_unit * ri.quantity)
      }, 0)
      
      return sum + hpp
    }, 0)
    
    const averageHPP = totalRecipes > 0 ? totalHPP / totalRecipes : 0
    
    return {
      totalRecipes,
      recipesWithIngredients,
      recipesWithoutIngredients,
      averageHPP
    }
  }, [recipes, ingredients])
  
  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Resep</p>
              <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {stats.totalRecipes}
              </p>
            </div>
            <ChefHat className={`text-primary ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Dengan Bahan</p>
              <p className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {stats.recipesWithIngredients}
              </p>
            </div>
            <PackageOpen className={`text-green-600 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tanpa Bahan</p>
              <p className={`font-bold text-orange-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {stats.recipesWithoutIngredients}
              </p>
            </div>
            <Badge variant="destructive" className={isMobile ? 'h-8 w-8' : 'h-10 w-10'}>!</Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rata-rata HPP</p>
              <p className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {formatCurrency(Math.round(stats.averageHPP))}
              </p>
            </div>
            <Calculator className={`text-primary ${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
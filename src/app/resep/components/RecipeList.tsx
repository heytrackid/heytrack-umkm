'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { useSettings } from '@/contexts/settings-context'
import { useI18n } from '@/providers/I18nProvider'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  ChefHat,
  Calculator,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  MoreHorizontal
} from 'lucide-react'

interface RecipeListProps {
  recipes: any[]
  ingredients: any[]
  loading: boolean
  searchTerm: string
  selectedItems: string[]
  onSearchChange: (value: string) => void
  onSelectItem: (id: string) => void
  onSelectAll: (checked: boolean) => void
  onRefresh: () => void
  onAddNew: () => void
  onViewRecipe: (recipe: any) => void
  onEditRecipe: (recipe: any) => void
  onDeleteRecipe: (recipe: any) => void
}

export function RecipeList({
  recipes,
  ingredients,
  loading,
  searchTerm,
  selectedItems,
  onSearchChange,
  onSelectItem,
  onSelectAll,
  onRefresh,
  onAddNew,
  onViewRecipe,
  onEditRecipe,
  onDeleteRecipe
}: RecipeListProps) {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const { t } = useI18n()

  const calculateRecipeHPP = (recipe: any) => {
    if (!recipe.recipe_ingredients || !ingredients) return 0
    
    return recipe.recipe_ingredients.reduce((total: number, recipeIngredient: any) => {
      const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredient_id)
      if (!ingredient) return total
      
      const cost = ingredient.price_per_unit * recipeIngredient.quantity
      return total + cost
    }, 0)
  }

  // Filter recipes based on search term
  const filteredRecipes = (recipes || []).filter(recipe =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
              {t('recipes.title')}
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('recipes.search.placeholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`pl-9 ${isMobile ? 'w-full' : 'w-64'}`}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t('recipes.actions.add')}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRecipes.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredRecipes.length}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                  <TableHead>{t('recipes.table.recipe')}</TableHead>
                  <TableHead>{t('recipes.table.hpp')}</TableHead>
                  <TableHead>{t('recipes.table.ingredients')}</TableHead>
                  <TableHead>{t('recipes.table.status')}</TableHead>
                  <TableHead>{t('common.actions.title')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipes.map((recipe) => {
                  const hpp = calculateRecipeHPP(recipe)
                  const ingredientCount = recipe.recipe_ingredients?.length || 0
                  
                  return (
                    <TableRow key={recipe.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(recipe.id)}
                          onCheckedChange={() => onSelectItem(recipe.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{recipe.name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {recipe.category}
                            </Badge>
                          </div>
                          {recipe.description && (
                            <span className="text-xs text-gray-400 mt-1">{recipe.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.round(hpp))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={ingredientCount > 0 ? 'default' : 'destructive'} className="text-xs">
                            {t('recipes.table.ingredients', { count: ingredientCount })}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ingredientCount > 0 ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            {t('recipes.table.readyHPP')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            {t('recipes.table.needIngredients')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewRecipe(recipe)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => onEditRecipe(recipe)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                {t('common.actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.location.href = '/hpp'}
                                disabled={ingredientCount === 0}
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                {t('recipes.table.calculateHPP')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => onDeleteRecipe(recipe)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('common.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {searchTerm ? t('recipes.empty.noResults') : t('recipes.empty.noRecipes')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? t('recipes.empty.tryDifferentKeyword')
                : t('recipes.empty.startAddingRecipes')
              }
            </p>
            {!searchTerm && (
              <Button onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                {t('recipes.empty.addFirstRecipe')}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

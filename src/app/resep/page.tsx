'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { 
  StatsCardSkeleton,
  HPPResultsSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { 
  RecipesTableSkeleton,
  SearchFormSkeleton
} from '@/components/ui/skeletons/table-skeletons'
import { RecipeFormSkeleton } from '@/components/ui/skeletons/form-skeletons'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import categoriesData from '@/data/categories.json'
import { useResponsive } from '@/hooks/use-mobile'
import { useRecipesWithIngredients, useIngredients } from '@/hooks/useDatabase'
import { 
  Plus, 
  ChefHat, 
  PackageOpen,
  Calculator,
  Edit2,
  Trash2,
  RefreshCw,
  BookOpen,
  ArrowLeft,
  Home,
  Tags,
  MoreHorizontal,
  Search,
  Eye
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/providers/I18nProvider'

export default function ProductionPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const { t } = useI18n()
  const { data: recipes, loading, refetch } = useRecipesWithIngredients()
  const { data: ingredients } = useIngredients()
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  // Skeleton loading management
  const { loading: skeletonLoading, setLoading: setSkeletonLoading, isLoading: isSkeletonLoading } = useLoading({
    [LOADING_KEYS.FETCH_RECIPES]: true,
    [LOADING_KEYS.CALCULATE_HPP]: false
  })
  
  // Simulate skeleton loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setSkeletonLoading(LOADING_KEYS.FETCH_RECIPES, false)
    }, 1600)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Form states
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    category: 'makanan-utama',
    ingredients: [] as any[]
  })
  
  // Quick add common ingredients based on category
  const getCommonIngredientsByCategory = (categoryId: string) => {
    const category = categoriesData.categories.find(cat => cat.id === categoryId || cat.name === categoryId)
    return category?.commonIngredients || []
  }

  const handleQuickAddIngredients = () => {
    if (!ingredients) return
    
    const commonIngredientNames = getCommonIngredientsByCategory(newRecipe.category)
    const availableIngredients = commonIngredientNames
      .map(name => ingredients.find(ing => 
        ing.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(ing.name.toLowerCase())
      ))
      .filter(Boolean)
      
    // Avoid duplicate ingredients
    const existingIngredientIds = new Set(newRecipe.ingredients.map(ing => ing.ingredient_id))
    const newIngredients = availableIngredients
      .filter(ing => !existingIngredientIds.has(ing!.id))
      .map(ing => ({
        ingredient_id: ing!.id,
        quantity: getDefaultQuantityByIngredient(ing!.name), // Smart default quantity
        unit: ing!.unit
      }))
    
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ...newIngredients]
    }))
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

  // Auto-populate ingredients when category changes
  React.useEffect(() => {
    if (newRecipe.category && newRecipe.category !== '' && ingredients && newRecipe.ingredients.length === 0) {
      handleQuickAddIngredients()
    }
  }, [newRecipe.category, ingredients, newRecipe.ingredients.length])

  const handleAddIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient_id: '', quantity: 0, unit: 'gram' }]
    }))
  }
  
  const handleRemoveIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateIngredient = (index: number, field: string, value: any) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }))
  }

  const resetForm = () => {
    setNewRecipe({
      name: '',
      description: '',
      category: 'makanan-utama',
      ingredients: []
    })
  }

  const handleSaveRecipe = async () => {
    // This would save to database
    console.log('Saving recipe:', newRecipe)
    resetForm()
    setCurrentView('list')
    refetch()
  }

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

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredRecipes.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredRecipes.map(recipe => recipe.id.toString()))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    const selectedRecipes = filteredRecipes.filter(recipe => selectedItems.includes(recipe.id.toString()))
    const recipeNames = selectedRecipes.map(recipe => recipe.name).join(', ')
    
    const confirmed = window.confirm(
      t('messages.confirmation.bulkDelete', { count: selectedItems.length, type: 'resep', names: recipeNames })
    )
    
    if (confirmed) {
      // TODO: Implement actual API call to delete recipes
      console.log('Deleting recipes:', selectedItems)
      
      // Show success message (in real app, this would be API call)
      alert(t('messages.success.bulkDeleted', { count: selectedItems.length, type: 'resep' }))
      
      // Clear selection and refresh
      setSelectedItems([])
      refetch()
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedRecipes = filteredRecipes.filter(recipe => selectedItems.includes(recipe.id.toString()))
    const recipeNames = selectedRecipes.map(recipe => recipe.name).join(', ')
    
    // TODO: Open bulk edit modal
    console.log('Bulk editing recipes:', selectedItems)
    
    alert(t('messages.info.bulkEditFeature', { count: selectedItems.length, type: 'resep', names: recipeNames }))
  }

  // Individual action handlers
  const handleViewRecipe = (recipe: any) => {
    console.log('View recipe details:', recipe)
    alert(t('messages.info.detailFeature', { type: 'resep', name: recipe.name }))
  }

  const handleDeleteRecipe = (recipe: any) => {
    const confirmed = window.confirm(
      t('messages.confirmation.singleDelete', { type: 'resep', name: recipe.name })
    )
    
    if (confirmed) {
      // TODO: Implement actual API call to delete recipe
      console.log('Deleting recipe:', recipe.id)
      alert(t('messages.success.singleDeleted', { type: 'Resep', name: recipe.name }))
      refetch()
    }
  }

  // Show skeleton while loading instead of old loading state
  if (loading && !isSkeletonLoading(LOADING_KEYS.FETCH_RECIPES)) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {t('recipes.pageTitle')}
            </h1>
            <p className="text-muted-foreground">
              {t('recipes.pageDescription')}
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className={`${isMobile ? 'text-sm' : ''}`}>{t('messages.info.loadingSpecific', { type: 'resep' })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: t('navigation.dashboard.title'), href: '/' },
      { label: t('recipes.title'), href: currentView === 'list' ? undefined : '/resep' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? t('recipes.addRecipe') : t('recipes.editRecipe')
      })
    }
    
    return items
  }

  // Add Recipe Form Component
  const AddRecipeForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('list')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{t('recipes.addNewRecipe')}</h2>
          <p className="text-muted-foreground">{t('recipes.createRecipeDesc')}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>{t('recipes.productName')}</Label>
            <Input
              value={newRecipe.name}
              onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('recipes.productNamePlaceholder')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('forms.labels.category')}</Label>
            <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriesData.categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name} ({category.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('forms.labels.description')}</Label>
            <Textarea
              value={newRecipe.description}
              onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t('recipes.descriptionPlaceholder')}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>{t('recipes.ingredientComposition')}</Label>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleQuickAddIngredients}
                  disabled={!ingredients || ingredients.length === 0}
                >
                  <PackageOpen className="h-4 w-4 mr-1" />
                  {t('recipes.autoAdd')}
                </Button>
                <Button size="sm" onClick={handleAddIngredient}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('recipes.manualAdd')}
                </Button>
              </div>
            </div>
            
            {/* Quick add helper */}
            {newRecipe.ingredients.length === 0 && ingredients && ingredients.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-800/50 p-1.5 rounded">
                    <PackageOpen className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                      {t('messages.features.autoPopulateTitle')}
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      {t('messages.features.autoPopulateDesc', { category: newRecipe.category })}
                    </p>
                    <div className="text-xs text-green-700 dark:text-green-300">
                      {t('messages.features.ingredientsToAdd', { ingredients: getCommonIngredientsByCategory(newRecipe.category).slice(0, 4).join(', ') })}
                      {getCommonIngredientsByCategory(newRecipe.category).length > 4 && `, dan ${getCommonIngredientsByCategory(newRecipe.category).length - 4} lainnya`}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {newRecipe.ingredients.length === 0 && (!ingredients || ingredients.length === 0) && (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <PackageOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">{t('recipes.noIngredientData')}</p>
                <p className="text-sm mb-3">{t('recipes.addIngredientsFirst')}</p>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/inventory'}>
                  <PackageOpen className="h-4 w-4 mr-2" />
                  {t('recipes.manageIngredients')}
                </Button>
              </div>
            )}
            
            {newRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-xs">{t('recipes.ingredient')}</Label>
                  <Select 
                    value={ingredient.ingredient_id} 
                    onValueChange={(value) => handleUpdateIngredient(index, 'ingredient_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('recipes.selectIngredient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients?.map(ing => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name} ({formatCurrency(ing.price_per_unit)}/{ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-xs">{t('recipes.quantity')}</Label>
                  <Input
                    type="number"
                    value={ingredient.quantity}
                    onChange={(e) => handleUpdateIngredient(index, 'quantity', Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveIngredient(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveRecipe} className="flex-1">
              <ChefHat className="h-4 w-4 mr-2" />
              {t('recipes.saveRecipe')}
            </Button>
            <Button variant="outline" onClick={() => {
              resetForm()
              setCurrentView('list')
            }}>
              {t('common.actions.cancel')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Recipe List Component
  const RecipeList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {t('recipes.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('recipes.mainPageDescription')}
          </p>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
          <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('common.actions.refresh')}
          </Button>
          <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => window.location.href = '/categories'}>
            <Tags className="h-4 w-4 mr-2" />
            {t('recipes.manageCategories')}
          </Button>
          <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('recipes.addRecipe')}
          </Button>
        </div>
      </div>

        {/* Helpful Guide */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                <ChefHat className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('recipes.tips.title')}
                </h3>
                <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                  <span>{t('recipes.tips.step1')}</span>
                  <span>{t('recipes.tips.step2')}</span>
                  <span>{t('recipes.tips.step3')}</span>
                  <span>{t('recipes.tips.step4')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        {isSkeletonLoading(LOADING_KEYS.FETCH_RECIPES) ? (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'}`}>
            {Array.from({ length: 3 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'}`}>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {recipes.length}
              </div>
              <p className="text-sm text-muted-foreground">{t('recipes.totalRecipesLabel')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <PackageOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {ingredients?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">{t('recipes.availableIngredients')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {recipes.filter(r => r.recipe_ingredients?.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">{t('recipes.readyForHPP')}</p>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Search and Filters */}
        {isSkeletonLoading(LOADING_KEYS.FETCH_RECIPES) ? (
          <SearchFormSkeleton />
        ) : (
          <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('recipes.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {t('recipes.selectedRecipes', { count: selectedItems.length })}
                </span>
                <span className="text-xs text-gray-500">
                  ({filteredRecipes.filter(recipe => selectedItems.includes(recipe.id.toString())).map(recipe => recipe.name).slice(0, 2).join(', ')}
                  {selectedItems.length > 2 ? ` ${t('recipes.otherRecipes', { count: selectedItems.length - 2 })}` : ''})
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {t('common.actions.cancel')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkEdit}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {t('tables.bulk.editAll')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('tables.bulk.deleteAll')}
                </Button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Recipe List */}
        {!ingredients || ingredients.length === 0 ? (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="py-12 text-center">
              <PackageOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'} text-orange-900 dark:text-orange-100`}>
                {t('recipes.empty.noIngredients')}
              </h3>
              <p className="text-orange-700 dark:text-orange-200 mb-4">
                {t('recipes.empty.addIngredientsBeforeRecipes')}
              </p>
              <Button onClick={() => window.location.href = '/inventory'} className="bg-orange-600 hover:bg-orange-700">
                <PackageOpen className="h-4 w-4 mr-2" />
                {t('recipes.empty.goToIngredients')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                {t('recipes.table.recipeList')}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {t('recipes.table.manageRecipesEasily')}
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <RecipeTableSkeleton />
              ) : filteredRecipes.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedItems.length === filteredRecipes.length && filteredRecipes.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>{t('recipes.table.nameCategory')}</TableHead>
                        <TableHead>{t('recipes.table.hppEstimate')}</TableHead>
                        <TableHead>{t('recipes.table.ingredientCount')}</TableHead>
                        <TableHead>{t('tables.headers.status')}</TableHead>
                        <TableHead className="w-32">{t('tables.headers.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecipes.map((recipe) => {
                        const hpp = calculateRecipeHPP(recipe)
                        const ingredientCount = recipe.recipe_ingredients?.length || 0
                        
                        return (
                          <TableRow key={recipe.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(recipe.id.toString())}
                                onCheckedChange={() => handleSelectItem(recipe.id.toString())}
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
                                  onClick={() => handleViewRecipe(recipe)}
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
                                    <DropdownMenuItem onClick={() => {
                                      setSelectedRecipe(recipe)
                                      setCurrentView('edit')
                                    }}>
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
                                      onClick={() => handleDeleteRecipe(recipe)}
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
                    <Button onClick={() => setCurrentView('add')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('recipes.empty.addFirstRecipe')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {currentView === 'list' && <RecipeList />}
        {currentView === 'add' && <AddRecipeForm />}
        {currentView === 'edit' && <AddRecipeForm />}
      </div>
    </AppLayout>
  )
}

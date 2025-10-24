'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { uiLogger } from '@/lib/logger'
import {
  BarChart3,
  Calculator,
  ChefHat,
  Clock,
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'

// Lazy loaded components
import {
  LazyAdvancedHPPCalculator,
  RecipeDashboardWithProgressiveLoading,
  SmartRecipeLoader,
  preloadRecipeComponents
} from './LazyComponents'

interface Recipe {
  id: string
  name: string
  description: string
  servings: number
  prep_time: number
  cook_time: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface RecipesPageProps {
  userRole?: 'admin' | 'manager' | 'staff'
  enableAdvancedFeatures?: boolean
}

export default function RecipesPage({
  userRole = 'manager',
  enableAdvancedFeatures = true
}: RecipesPageProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<'list' | 'hpp' | 'pricing' | 'analytics'>('list')

  useEffect(() => {
    // Preload recipe components for better performance
    preloadRecipeComponents()
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      // Fetch recipes from API
      const response = await fetch('/api/recipes')
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const fetchedRecipes: Recipe[] = await response.json()
      setRecipes(fetchedRecipes)
      if (fetchedRecipes.length > 0) {
        setSelectedRecipe(fetchedRecipes[0])
      }
    } catch (error: unknown) {
      uiLogger.error({ err: error }, 'Error fetching recipes')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || recipe.category === categoryFilter
    return matchesSearch && matchesCategory && recipe.is_active
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'medium': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'hard': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bread': return '🍞'
      case 'pastry': return '🥐'
      case 'cake': return '🍰'
      case 'cookie': return '🍪'
      default: return '👩‍🍳'
    }
  }

  const handlePriceUpdate = (price: number, margin?: number) => {
    // Handle price updates from HPP calculator or pricing assistant
    uiLogger.info('Price updated', { price, margin })
    // In real app, this would update the recipe price in database
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ChefHat className="h-8 w-8" />
              Recipe Management
            </h1>
            <p className="text-muted-foreground">
              Kelola resep dan hitung HPP dengan sistem otomatis
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-4">
            <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="h-8 w-8" />
            Recipe Management
          </h1>
          <p className="text-muted-foreground">
            Kelola resep dan hitung HPP dengan sistem otomatis
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Resep
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Resep</p>
                <p className="text-2xl font-bold">{recipes.length}</p>
              </div>
              <ChefHat className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Margin</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg HPP</p>
                <p className="text-2xl font-bold">Rp 8.5K</p>
              </div>
              <Calculator className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Seller</p>
                <p className="text-2xl font-bold">Roti Tawar</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recipe List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Filter Resep
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Cari Resep</Label>
                <Input
                  id="search"

                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="bread">Roti</SelectItem>
                    <SelectItem value="pastry">Pastry</SelectItem>
                    <SelectItem value="cake">Kue</SelectItem>
                    <SelectItem value="cookie">Cookie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recipe List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className={`cursor-pointer transition-all hover: ${selectedRecipe?.id === recipe.id ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{recipe.name}</h3>
                      <span className="text-lg">{getCategoryIcon(recipe.category)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{recipe.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prep_time + recipe.cook_time}m
                      </Badge>
                      <Badge className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRecipe ? (
            <>
              {/* Recipe Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(selectedRecipe.category)}</span>
                        {selectedRecipe.name}
                      </CardTitle>
                      <p className="text-muted-foreground">{selectedRecipe.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(selectedRecipe.difficulty)}>
                      {selectedRecipe.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{selectedRecipe.servings}</div>
                      <div className="text-xs text-muted-foreground">Porsi</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedRecipe.prep_time}m</div>
                      <div className="text-xs text-muted-foreground">Persiapan</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{selectedRecipe.cook_time}m</div>
                      <div className="text-xs text-muted-foreground">Memasak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Tabs */}
              <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="list">📋 Detail</TabsTrigger>
                  <TabsTrigger value="hpp">💰 HPP</TabsTrigger>
                  <TabsTrigger value="pricing">💡 Pricing</TabsTrigger>
                  <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Recipe Details</h3>
                        <p className="text-sm text-muted-foreground">
                          Detail ingredients dan langkah-langkah akan ditampilkan di sini
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="hpp" className="mt-6">
                  <LazyAdvancedHPPCalculator
                    recipeId={selectedRecipe.id}
                    recipeName={selectedRecipe.name}
                    onPriceUpdate={handlePriceUpdate}
                  />
                </TabsContent>

                <TabsContent value="pricing" className="mt-6">
                  {enableAdvancedFeatures && (userRole === 'admin' || userRole === 'manager') ? (
                    <SmartRecipeLoader
                      userRole={userRole}
                      recipeId={selectedRecipe.id}
                      recipeName={selectedRecipe.name}
                      onPriceUpdate={handlePriceUpdate}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-medium mb-2">Smart Pricing Assistant</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Fitur ini hanya tersedia untuk Admin dan Manager
                          </p>
                          <Badge variant="outline">Akses Terbatas</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                  <RecipeDashboardWithProgressiveLoading
                    recipeId={selectedRecipe.id}
                    recipeName={selectedRecipe.name}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Pilih Resep</h3>
                  <p className="text-sm text-muted-foreground">
                    Pilih resep dari daftar di sebelah kiri untuk mulai mengelola
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
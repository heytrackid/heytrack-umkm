'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { RecipeWithIngredients } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ChefHat, 
  Clock, 
  Users,
  Calculator,
  Eye,
  Star,
  TrendingUp
} from 'lucide-react'

// Mobile UX imports
import { useResponsive } from '@/hooks/use-mobile'
import { PullToRefresh } from '@/components/ui/mobile-gestures'
import { MobileInput, MobileSelect, MobileTextarea, MobileForm } from '@/components/ui/mobile-forms'

// Lazy loading imports
import { MiniChartWithLoading } from '@/components/lazy/chart-features'
import { ProgressiveLoader } from '@/components/lazy/progressive-loading'

const categories = ['Semua', 'Roti', 'Pastry', 'Donat', 'Kue', 'Cookies']
const difficulties = ['Easy', 'Medium', 'Hard']

// Enhanced recipe type for UI display  
interface RecipeWithStats extends RecipeWithIngredients {
  cost?: number
  sellingPrice?: number
  margin?: number
  rating?: number
  totalMade?: number
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithStats | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithStats | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  
  // Mobile responsive hooks
  const { isMobile, isTablet } = useResponsive()
  
  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
    await fetchRecipes()
  }

  // Fetch recipes from API
  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError('') // Clear previous errors
      
      const response = await fetch('/api/recipes')
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('API endpoint tidak ditemukan. Pastikan server berjalan dengan benar.')
        } else if (response.status === 500) {
          throw new Error('Server mengalami kesalahan internal. Silakan coba lagi.')
        } else if (response.status >= 400) {
          throw new Error(`Gagal mengambil data resep (${response.status}). Silakan coba lagi.`)
        }
        throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.')
      }
      
      const data: RecipeWithIngredients[] = await response.json()
      
      // Transform data to include calculated fields for UI
      const transformedData: RecipeWithStats[] = data.map(recipe => {
        // Calculate total cost from ingredients if not set in recipe
        const calculatedCost = recipe.recipe_ingredients?.reduce((sum, ri) => {
          const ingredientCost = (ri.ingredient?.price_per_unit || 0) * ri.quantity
          return sum + ingredientCost
        }, 0) || 0
        
        // Use database values if available, otherwise fall back to calculated/default values
        const cost = recipe.cost_per_unit || calculatedCost
        const sellingPrice = recipe.selling_price || (cost * 1.5) // 50% markup as fallback
        const margin = recipe.margin_percentage || (sellingPrice > 0 ? ((sellingPrice - cost) / sellingPrice * 100) : 0)
        
        return {
          ...recipe,
          cost,
          sellingPrice,
          margin,
          rating: recipe.rating || 0, // Use actual rating or 0
          totalMade: recipe.times_made || 0 // Use actual times made
        }
      })
      
      setRecipes(transformedData)
    } catch (err) {
      let errorMessage = 'Gagal memuat data resep'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setError(errorMessage)
      console.error('Error fetching recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesCategory = selectedCategory === 'Semua' || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  const handleViewRecipe = (recipe: RecipeWithStats) => {
    setSelectedRecipe(recipe)
    setIsViewDialogOpen(true)
  }

  const handleEditRecipe = (recipe: RecipeWithStats) => {
    setEditingRecipe(recipe)
    setIsEditDialogOpen(true)
  }

  const handleDeleteRecipe = async (recipe: RecipeWithStats) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus resep "${recipe.name}"?`)) {
      return
    }
    
    try {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menghapus resep')
      }
      
      // Refresh data after delete
      fetchRecipes()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus resep')
    }
  }

  const handleFormSuccess = () => {
    fetchRecipes() // Refresh data after create/update
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`flex gap-4 ${
            isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>Manajemen Resep</h1>
              <p className="text-muted-foreground">Kelola resep dan formula produk</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className={isMobile ? 'w-full' : ''}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Resep
                </Button>
              </DialogTrigger>
                <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${
                  isMobile ? 'w-full mx-4 rounded-lg' : ''
                }`}>
                  <DialogHeader>
                    <DialogTitle className={isMobile ? 'text-lg' : ''}>
                      Tambah Resep Baru
                    </DialogTitle>
                  </DialogHeader>
                  <RecipeForm 
                    onClose={() => setIsAddDialogOpen(false)} 
                    onSuccess={handleFormSuccess}
                  />
                </DialogContent>
            </Dialog>
          </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Memuat resep...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <ChefHat className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Gagal memuat resep</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchRecipes}>Coba Lagi</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content - only show when not loading and no error */}
        {!loading && !error && (
          <>
          {/* Stats Cards */}
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'md:grid-cols-4'
          }`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Resep</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{recipes.length}</div>
                <p className="text-xs text-muted-foreground">
                  {recipes.filter(r => r.is_active).length} aktif
                </p>
                {recipes.length > 0 && (
                  <MiniChartWithLoading 
                    data={recipes.slice(0, 7).map((recipe, index) => ({
                      day: index + 1,
                      count: recipe.totalMade || 0
                    }))}
                    type="bar"
                    dataKey="count"
                    color="#10b981"
                    className="mt-2"
                    height={30}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  {recipes.length > 0 
                    ? (recipes.reduce((sum, r) => sum + (r.margin || 0), 0) / recipes.length).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  dari semua resep
                </p>
                {recipes.length > 0 && (
                  <MiniChartWithLoading 
                    data={recipes.slice(0, 7).map((recipe, index) => ({
                      day: index + 1,
                      margin: recipe.margin || 0
                    }))}
                    type="line"
                    dataKey="margin"
                    color="#3b82f6"
                    className="mt-2"
                    height={30}
                  />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Resep Terpopuler</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-lg truncate' : 'text-2xl'
                }`}>
                  {recipes.length > 0 ? recipes[0]?.name || '-' : '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {recipes.length > 0 ? (recipes[0]?.totalMade || 0) : 0} kali dibuat
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Produksi</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  {recipes.reduce((sum, r) => sum + (r.totalMade || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  item diproduksi
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className={`pt-6 ${isMobile ? 'px-4' : ''}`}>
              <div className={`flex gap-4 ${
                isMobile ? 'flex-col space-y-4' : 'flex-col md:flex-row'
              }`}>
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute text-muted-foreground ${
                      isMobile ? 'left-3 top-3 h-4 w-4' : 'left-2.5 top-2.5 h-4 w-4'
                    }`} />
                    {isMobile ? (
                      <MobileInput
                        placeholder="Cari resep..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="pl-10"
                      />
                    ) : (
                      <Input
                        placeholder="Cari resep..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    )}
                  </div>
                </div>
                <div className={`flex gap-2 ${
                  isMobile ? 'overflow-x-auto pb-2' : 'flex-wrap'
                }`}>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size={isMobile ? "sm" : "sm"}
                      onClick={() => setSelectedCategory(category)}
                      className={isMobile ? 'whitespace-nowrap flex-shrink-0' : ''}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipes Grid */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredRecipes.map((recipe) => (
                <Card 
                  key={recipe.id}
                  className="p-4 transition-all duration-200 hover:shadow-lg cursor-pointer"
                  onClick={() => handleViewRecipe(recipe)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{recipe.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {recipe.description}
                        </p>
                      </div>
                      <Badge className={`ml-2 ${getDifficultyColor(recipe.difficulty || 'Medium')}`}>
                        {recipe.difficulty || 'Medium'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)}m
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {recipe.rating || 0}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">HPP</p>
                        <p className="font-medium text-sm">Rp {(recipe.cost || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Margin</p>
                        <p className="font-medium text-green-600 text-sm">{(recipe.margin || 0).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditRecipe(recipe)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRecipe(recipe)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{recipe.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {recipe.description}
                        </p>
                      </div>
                      <Badge className={getDifficultyColor(recipe.difficulty || 'Medium')}>
                        {recipe.difficulty || 'Medium'}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings} porsi
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(recipe.prep_time || 0) + (recipe.cook_time || 0)} menit
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">HPP</p>
                        <p className="font-medium">Rp {(recipe.cost || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Harga Jual</p>
                        <p className="font-medium">Rp {(recipe.sellingPrice || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Margin</p>
                        <p className="font-medium text-green-600">{(recipe.margin || 0).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{recipe.rating || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewRecipe(recipe)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Lihat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRecipe(recipe)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteRecipe(recipe)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        {filteredRecipes.length === 0 && recipes.length > 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada resep yang sesuai</h3>
              <p className="text-muted-foreground mb-4">
                Tidak ada resep yang sesuai dengan filter "{searchTerm}" dalam kategori "{selectedCategory}"
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Hapus Pencarian
                </Button>
                <Button variant="outline" onClick={() => setSelectedCategory('Semua')}>
                  Reset Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {filteredRecipes.length === 0 && recipes.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum ada resep</h3>
              <p className="text-muted-foreground mb-4">
                Mulai dengan menambahkan resep pertama Anda untuk mengelola formula produk bakery
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Resep Pertama
              </Button>
            </CardContent>
          </Card>
        )}

          {/* Edit Recipe Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${
              isMobile ? 'w-full mx-4 rounded-lg' : ''
            }`}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>
                  Edit Resep
                </DialogTitle>
              </DialogHeader>
              <RecipeForm 
                onClose={() => {
                  setIsEditDialogOpen(false)
                  setEditingRecipe(null)
                }}
                onSuccess={() => {
                  handleFormSuccess()
                  setEditingRecipe(null)
                }}
                editData={editingRecipe}
              />
            </DialogContent>
          </Dialog>

          {/* Recipe Detail Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${
              isMobile ? 'w-full mx-4 rounded-lg' : ''
            }`}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>
                  {selectedRecipe?.name}
                </DialogTitle>
              </DialogHeader>
              {selectedRecipe && <RecipeDetailView recipe={selectedRecipe} />}
            </DialogContent>
          </Dialog>
          </>
        )}
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

// Recipe Form Component
function RecipeForm({ onClose, onSuccess, editData }: { 
  onClose: () => void
  onSuccess?: () => void
  editData?: RecipeWithStats | null 
}) {
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    category: editData?.category || '',
    servings: editData?.servings || 1,
    prep_time: editData?.prep_time || 0,
    cook_time: editData?.cook_time || 0,
    difficulty: editData?.difficulty || 'Medium',
    instructions: editData?.instructions || '',
    selling_price: editData?.selling_price || 0
  })
  const [recipeIngredients, setRecipeIngredients] = useState<Array<{
    ingredient_id: string
    ingredient: any
    quantity: number
    unit: string
    cost: number
  }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [costCalculation, setCostCalculation] = useState({
    totalCost: 0,
    costPerServing: 0,
    actualMargin: 0,
    profitPerServing: 0
  })

  // Fetch available ingredients
  useEffect(() => {
    fetchIngredients()
    if (editData?.recipe_ingredients) {
      const existingIngredients = editData.recipe_ingredients.map((ri: any) => ({
        ingredient_id: ri.ingredient.id,
        ingredient: ri.ingredient,
        quantity: ri.quantity,
        unit: ri.unit,
        cost: ri.ingredient.price_per_unit * ri.quantity
      }))
      setRecipeIngredients(existingIngredients)
    }
  }, [editData])

  // Calculate cost whenever ingredients or servings change
  useEffect(() => {
    calculateCost()
  }, [recipeIngredients, formData.servings, formData.selling_price])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients')
      if (response.ok) {
        const data = await response.json()
        setAvailableIngredients(data)
      }
    } catch (err) {
      console.error('Error fetching ingredients:', err)
    }
  }

  const calculateCost = () => {
    const totalCost = recipeIngredients.reduce((sum, ri) => sum + ri.cost, 0)
    const costPerServing = formData.servings > 0 ? totalCost / formData.servings : 0
    const actualMargin = formData.selling_price > 0 
      ? ((formData.selling_price - costPerServing) / formData.selling_price * 100) 
      : 0
    const profitPerServing = formData.selling_price - costPerServing

    setCostCalculation({
      totalCost,
      costPerServing,
      actualMargin,
      profitPerServing
    })
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const addIngredient = () => {
    if (availableIngredients.length === 0) {
      setError('Belum ada bahan baku tersedia. Tambahkan bahan baku terlebih dahulu.')
      return
    }
    
    const firstIngredient = availableIngredients[0]
    const newIngredient = {
      ingredient_id: firstIngredient.id,
      ingredient: firstIngredient,
      quantity: 1,
      unit: firstIngredient.unit,
      cost: firstIngredient.price_per_unit * 1
    }
    setRecipeIngredients(prev => [...prev, newIngredient])
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    setRecipeIngredients(prev => {
      const updated = [...prev]
      if (field === 'ingredient_id') {
        const selectedIngredient = availableIngredients.find(ing => ing.id === value)
        if (selectedIngredient) {
          updated[index] = {
            ...updated[index],
            ingredient_id: value,
            ingredient: selectedIngredient,
            unit: selectedIngredient.unit,
            cost: selectedIngredient.price_per_unit * updated[index].quantity
          }
        }
      } else if (field === 'quantity') {
        updated[index] = {
          ...updated[index],
          quantity: parseFloat(value) || 0,
          cost: updated[index].ingredient.price_per_unit * (parseFloat(value) || 0)
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const removeIngredient = (index: number) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || formData.servings <= 0) {
      setError('Nama resep, kategori, dan porsi harus diisi dengan benar')
      return
    }
    
    if (recipeIngredients.length === 0) {
      setError('Resep harus memiliki minimal 1 bahan')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      const recipeData = {
        ...formData,
        cost_per_unit: costCalculation.totalCost,
        margin_percentage: costCalculation.actualMargin,
        is_active: true,
        recipe_ingredients: recipeIngredients.map(ri => ({
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity,
          unit: ri.unit,
          cost: ri.cost
        }))
      }
      
      const url = editData ? `/api/recipes/${editData.id}` : '/api/recipes'
      const method = editData ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menyimpan resep')
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Info Dasar</TabsTrigger>
          <TabsTrigger value="ingredients">Bahan ({recipeIngredients.length})</TabsTrigger>
          <TabsTrigger value="instructions">Instruksi</TabsTrigger>
          <TabsTrigger value="costing">Costing</TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Resep *</Label>
              <Input 
                id="name" 
                placeholder="Contoh: Roti Tawar Premium"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Kategori *</Label>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              >
                <option value="">Pilih kategori</option>
                {categories.filter(c => c !== 'Semua').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="servings">Porsi *</Label>
              <Input 
                id="servings" 
                type="number" 
                placeholder="12"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                required
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
              >
                <option value="Easy">Mudah</option>
                <option value="Medium">Sedang</option>
                <option value="Hard">Sulit</option>
              </select>
            </div>
            <div>
              <Label htmlFor="prepTime">Waktu Persiapan (menit)</Label>
              <Input 
                id="prepTime" 
                type="number" 
                placeholder="30"
                value={formData.prep_time}
                onChange={(e) => handleInputChange('prep_time', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="cookTime">Waktu Memasak (menit)</Label>
              <Input 
                id="cookTime" 
                type="number" 
                placeholder="45"
                value={formData.cook_time}
                onChange={(e) => handleInputChange('cook_time', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea 
              id="description" 
              placeholder="Deskripsi resep..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="ingredients" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Daftar Bahan ({recipeIngredients.length})</h3>
            <Button type="button" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan
            </Button>
          </div>
          
          {recipeIngredients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ChefHat className="h-8 w-8 mx-auto mb-2" />
              <p>Belum ada bahan yang ditambahkan</p>
              <p className="text-sm">Klik "Tambah Bahan" untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recipeIngredients.map((ri, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Bahan</Label>
                      <select
                        className="w-full p-2 text-sm border border-input rounded-md bg-background"
                        value={ri.ingredient_id}
                        onChange={(e) => updateIngredient(index, 'ingredient_id', e.target.value)}
                      >
                        {availableIngredients.map(ingredient => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Jumlah ({ri.unit})</Label>
                      <Input
                        type="number"
                        className="text-sm"
                        value={ri.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total Biaya</Label>
                      <Input
                        className="text-sm"
                        value={`Rp ${ri.cost.toLocaleString()}`}
                        readOnly
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => removeIngredient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Total Biaya Bahan:</span>
                  <span>Rp {costCalculation.totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="instructions" className="space-y-4">
          <div>
            <Label htmlFor="instructions">Instruksi Pembuatan</Label>
            <Textarea 
              id="instructions" 
              placeholder="1. Langkah pertama...&#10;2. Langkah kedua...&#10;3. Dan seterusnya..." 
              rows={10}
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="costing" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sellingPrice">Harga Jual per Porsi</Label>
              <Input 
                id="sellingPrice" 
                type="number" 
                placeholder="15000"
                value={formData.selling_price}
                onChange={(e) => handleInputChange('selling_price', parseFloat(e.target.value) || 0)}
                min="0"
                step="500"
              />
            </div>
            <div>
              <Label>Saran Harga (Margin 60%)</Label>
              <Input
                value={`Rp ${(costCalculation.costPerServing * 2.5).toLocaleString()}`}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Kalkulasi Real-time</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Biaya Bahan:</p>
                <p className="font-medium">Rp {costCalculation.totalCost.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Biaya per Porsi:</p>
                <p className="font-medium">Rp {costCalculation.costPerServing.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Margin Aktual:</p>
                <p className={`font-medium ${costCalculation.actualMargin > 50 ? 'text-green-600' : costCalculation.actualMargin > 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {costCalculation.actualMargin.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Keuntungan per Porsi:</p>
                <p className="font-medium">Rp {costCalculation.profitPerServing.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : editData ? 'Update Resep' : 'Simpan Resep'}
          </Button>
        </div>
      </Tabs>
    </form>
  )
}

// Recipe Detail View Component
function RecipeDetailView({ recipe }: { recipe: RecipeWithStats }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ingredients">Bahan</TabsTrigger>
        <TabsTrigger value="instructions">Instruksi</TabsTrigger>
        <TabsTrigger value="analytics">Analitik</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Dasar</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span>{recipe.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Porsi:</span>
                  <span>{recipe.servings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu Total:</span>
                  <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} menit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kesulitan:</span>
                  <Badge className={getDifficultyColor(recipe.difficulty || 'Medium')}>
                    {recipe.difficulty || 'Medium'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Analisis Biaya</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HPP Total:</span>
                  <span>Rp {(recipe.cost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HPP per Porsi:</span>
                  <span>Rp {((recipe.cost || 0) / recipe.servings).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Jual:</span>
                  <span>Rp {(recipe.sellingPrice || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="text-green-600">{(recipe.margin || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Deskripsi</h3>
          <p className="mt-2 text-sm text-muted-foreground">{recipe.description}</p>
        </div>
      </TabsContent>
      
      <TabsContent value="ingredients" className="space-y-4">
        <h3 className="font-medium">Daftar Bahan ({recipe.recipe_ingredients?.length || 0})</h3>
        <div className="space-y-2">
          {(recipe.recipe_ingredients || []).map((recipeIngredient: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{recipeIngredient.ingredient?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">
                  {recipeIngredient.quantity} {recipeIngredient.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {((recipeIngredient.ingredient?.price_per_unit || 0) * recipeIngredient.quantity).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Rp {(recipeIngredient.ingredient?.price_per_unit || 0).toLocaleString()}/{recipeIngredient.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Biaya Bahan:</span>
            <span>Rp {(recipe.cost || 0).toLocaleString()}</span>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="instructions" className="space-y-4">
        <h3 className="font-medium">Langkah Pembuatan</h3>
        <div className="space-y-3">
          {(recipe.instructions || 'Tidak ada instruksi').split('\n').map((step: string, index: number) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-sm">{step.replace(/^\d+\.\s*/, '')}</p>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Diproduksi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{recipe.totalMade || 0}</p>
              <p className="text-xs text-muted-foreground">kali dibuat</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold">{recipe.rating || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground">dari pelanggan</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Performa Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chart analitik produksi akan ditampilkan di sini
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'  
    case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}
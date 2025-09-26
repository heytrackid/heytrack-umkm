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
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithStats | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manajemen Resep</h1>
            <p className="text-muted-foreground">Kelola resep dan formula produk</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Resep
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Resep Baru</DialogTitle>
              </DialogHeader>
              <RecipeForm onClose={() => setIsAddDialogOpen(false)} />
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resep</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes.length}</div>
              <p className="text-xs text-muted-foreground">
                {recipes.filter(r => r.is_active).length} aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recipes.length > 0 
                  ? (recipes.reduce((sum, r) => sum + (r.margin || 0), 0) / recipes.length).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                dari semua resep
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resep Terpopuler</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
              <div className="text-2xl font-bold">
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
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari resep..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
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
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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

        {/* Recipe Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedRecipe?.name}</DialogTitle>
            </DialogHeader>
            {selectedRecipe && <RecipeDetailView recipe={selectedRecipe} />}
          </DialogContent>
        </Dialog>
        </>
        )}
      </div>
    </AppLayout>
  )
}

// Recipe Form Component
function RecipeForm({ onClose }: { onClose: () => void }) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">Info Dasar</TabsTrigger>
        <TabsTrigger value="ingredients">Bahan</TabsTrigger>
        <TabsTrigger value="instructions">Instruksi</TabsTrigger>
        <TabsTrigger value="costing">Costing</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nama Resep</Label>
            <Input id="name" placeholder="Contoh: Roti Tawar Premium" />
          </div>
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" placeholder="Contoh: Roti" />
          </div>
          <div>
            <Label htmlFor="servings">Porsi</Label>
            <Input id="servings" type="number" placeholder="12" />
          </div>
          <div>
            <Label htmlFor="difficulty">Tingkat Kesulitan</Label>
            <select className="w-full p-2 border border-input rounded-md bg-background">
              <option value="">Pilih tingkat kesulitan</option>
              <option value="Easy">Mudah</option>
              <option value="Medium">Sedang</option>
              <option value="Hard">Sulit</option>
            </select>
          </div>
          <div>
            <Label htmlFor="prepTime">Waktu Persiapan (menit)</Label>
            <Input id="prepTime" type="number" placeholder="30" />
          </div>
          <div>
            <Label htmlFor="cookTime">Waktu Memasak (menit)</Label>
            <Input id="cookTime" type="number" placeholder="45" />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea id="description" placeholder="Deskripsi resep..." />
        </div>
      </TabsContent>
      
      <TabsContent value="ingredients" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Daftar Bahan</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Bahan
          </Button>
        </div>
        {/* Dynamic ingredients list would go here */}
        <p className="text-sm text-muted-foreground">
          Klik "Tambah Bahan" untuk menambahkan bahan-bahan yang diperlukan
        </p>
      </TabsContent>
      
      <TabsContent value="instructions" className="space-y-4">
        <div>
          <Label htmlFor="instructions">Instruksi Pembuatan</Label>
          <Textarea 
            id="instructions" 
            placeholder="1. Langkah pertama...&#10;2. Langkah kedua...&#10;3. Dan seterusnya..." 
            rows={10}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="costing" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sellingPrice">Harga Jual</Label>
            <Input id="sellingPrice" type="number" placeholder="15000" />
          </div>
          <div>
            <Label htmlFor="margin">Target Margin (%)</Label>
            <Input id="margin" type="number" placeholder="70" />
          </div>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Kalkulasi Otomatis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Biaya Bahan:</p>
              <p className="font-medium">Rp 0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Biaya per Porsi:</p>
              <p className="font-medium">Rp 0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Margin Aktual:</p>
              <p className="font-medium">0%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Keuntungan per Porsi:</p>
              <p className="font-medium">Rp 0</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button>Simpan Resep</Button>
      </div>
    </Tabs>
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
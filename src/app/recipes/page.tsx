'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
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

// Sample data - in real app, this would come from your database
const sampleRecipes = [
  {
    id: '1',
    name: 'Roti Tawar Premium',
    description: 'Roti tawar lembut dengan tekstur yang sempurna',
    category: 'Roti',
    servings: 12,
    prepTime: 30,
    cookTime: 45,
    difficulty: 'Medium',
    isActive: true,
    cost: 8500,
    sellingPrice: 15000,
    margin: 76.5,
    rating: 4.8,
    totalMade: 245,
    ingredients: [
      { name: 'Tepung Terigu', quantity: 500, unit: 'g', cost: 3000 },
      { name: 'Ragi Instan', quantity: 7, unit: 'g', cost: 500 },
      { name: 'Gula Pasir', quantity: 50, unit: 'g', cost: 300 },
      { name: 'Garam', quantity: 8, unit: 'g', cost: 50 },
      { name: 'Mentega', quantity: 50, unit: 'g', cost: 2000 },
      { name: 'Susu Cair', quantity: 300, unit: 'ml', cost: 2000 },
      { name: 'Telur', quantity: 1, unit: 'butir', cost: 650 }
    ],
    instructions: `1. Campurkan tepung terigu, ragi instan, gula, dan garam dalam mangkuk besar
2. Tambahkan susu cair hangat dan telur, aduk hingga tercampur
3. Masukkan mentega, uleni hingga kalis elastis (15-20 menit)
4. Istirahatkan adonan 1 jam hingga mengembang 2x lipat
5. Kempiskan adonan, bentuk sesuai loyang
6. Istirahatkan 45 menit hingga mengembang lagi
7. Panggang di suhu 180°C selama 30-35 menit
8. Dinginkan sebelum dipotong`
  },
  {
    id: '2',
    name: 'Croissant Butter',
    description: 'Croissant berlapis dengan mentega premium',
    category: 'Pastry',
    servings: 8,
    prepTime: 180,
    cookTime: 20,
    difficulty: 'Hard',
    isActive: true,
    cost: 12000,
    sellingPrice: 25000,
    margin: 108.3,
    rating: 4.9,
    totalMade: 89,
    ingredients: [
      { name: 'Tepung Terigu', quantity: 400, unit: 'g', cost: 2400 },
      { name: 'Mentega Premium', quantity: 200, unit: 'g', cost: 6000 },
      { name: 'Susu', quantity: 150, unit: 'ml', cost: 1500 },
      { name: 'Gula', quantity: 30, unit: 'g', cost: 180 },
      { name: 'Ragi', quantity: 6, unit: 'g', cost: 420 },
      { name: 'Garam', quantity: 6, unit: 'g', cost: 38 },
      { name: 'Telur', quantity: 1, unit: 'butir', cost: 650 }
    ],
    instructions: `1. Buat adonan dasar dengan tepung, susu, gula, ragi, dan garam
2. Uleni hingga kalis, istirahatkan 30 menit
3. Pipihkan mentega hingga ketebalan 1cm
4. Bungkus mentega dengan adonan
5. Lakukan teknik laminating 3x dengan istirahat 30 menit setiap lipatan
6. Bentuk croissant, istirahatkan 2 jam
7. Oles dengan telur kocok
8. Panggang 180°C selama 15-20 menit`
  },
  {
    id: '3',
    name: 'Donat Glaze',
    description: 'Donat empuk dengan glazing manis',
    category: 'Donat',
    servings: 15,
    prepTime: 45,
    cookTime: 15,
    difficulty: 'Easy',
    isActive: true,
    cost: 4500,
    sellingPrice: 8000,
    margin: 77.8,
    rating: 4.6,
    totalMade: 456,
    ingredients: [
      { name: 'Tepung Terigu', quantity: 350, unit: 'g', cost: 2100 },
      { name: 'Gula', quantity: 60, unit: 'g', cost: 360 },
      { name: 'Ragi', quantity: 5, unit: 'g', cost: 350 },
      { name: 'Mentega', quantity: 40, unit: 'g', cost: 1200 },
      { name: 'Telur', quantity: 1, unit: 'butir', cost: 650 },
      { name: 'Susu', quantity: 100, unit: 'ml', cost: 1000 }
    ],
    instructions: `1. Campur semua bahan kering
2. Tambahkan bahan basah, uleni hingga kalis
3. Istirahatkan 1 jam
4. Bentuk donat, istirahatkan 30 menit
5. Goreng dalam minyak 170°C hingga keemasan
6. Tiriskan dan beri topping sesuai selera`
  }
]

const categories = ['Semua', 'Roti', 'Pastry', 'Donat', 'Kue', 'Cookies']
const difficulties = ['Easy', 'Medium', 'Hard']

export default function RecipesPage() {
  const [recipes, setRecipes] = useState(sampleRecipes)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleViewRecipe = (recipe: any) => {
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
                {recipes.filter(r => r.isActive).length} aktif
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
                {(recipes.reduce((sum, r) => sum + r.margin, 0) / recipes.length).toFixed(1)}%
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
              <div className="text-2xl font-bold">{sampleRecipes[2].name}</div>
              <p className="text-xs text-muted-foreground">
                {sampleRecipes[2].totalMade} kali dibuat
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
                {recipes.reduce((sum, r) => sum + r.totalMade, 0)}
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
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {recipe.servings} porsi
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.prepTime + recipe.cookTime} menit
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">HPP</p>
                    <p className="font-medium">Rp {recipe.cost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harga Jual</p>
                    <p className="font-medium">Rp {recipe.sellingPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Margin</p>
                    <p className="font-medium text-green-600">{recipe.margin.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{recipe.rating}</span>
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

        {filteredRecipes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada resep ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah kata kunci pencarian atau filter kategori
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
function RecipeDetailView({ recipe }: { recipe: any }) {
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
                  <span>{recipe.prepTime + recipe.cookTime} menit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kesulitan:</span>
                  <Badge className={getDifficultyColor(recipe.difficulty)} size="sm">
                    {recipe.difficulty}
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
                  <span>Rp {recipe.cost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">HPP per Porsi:</span>
                  <span>Rp {(recipe.cost / recipe.servings).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Harga Jual:</span>
                  <span>Rp {recipe.sellingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="text-green-600">{recipe.margin.toFixed(1)}%</span>
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
        <h3 className="font-medium">Daftar Bahan ({recipe.ingredients.length})</h3>
        <div className="space-y-2">
          {recipe.ingredients.map((ingredient: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{ingredient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ingredient.quantity} {ingredient.unit}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {ingredient.cost.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Rp {(ingredient.cost / ingredient.quantity).toLocaleString()}/{ingredient.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Biaya Bahan:</span>
            <span>Rp {recipe.cost.toLocaleString()}</span>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="instructions" className="space-y-4">
        <h3 className="font-medium">Langkah Pembuatan</h3>
        <div className="space-y-3">
          {recipe.instructions.split('\n').map((step: string, index: number) => (
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
              <p className="text-2xl font-bold">{recipe.totalMade}</p>
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
                <span className="text-2xl font-bold">{recipe.rating}</span>
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
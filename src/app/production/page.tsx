'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  ChevronRight
} from 'lucide-react'

export default function ProductionPage() {
  const { isMobile } = useResponsive()
  const { data: recipes, loading, refetch } = useRecipesWithIngredients()
  const { data: ingredients } = useIngredients()
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  
  // Form states
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    category: 'Roti',
    ingredients: [] as any[]
  })

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
      category: 'Roti',
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

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Resep Produk
            </h1>
            <p className="text-muted-foreground">
              Buat dan kelola resep untuk menghitung HPP
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className={`${isMobile ? 'text-sm' : ''}`}>Memuat data resep...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // Breadcrumb component
  const Breadcrumb = () => (
    <nav className="flex items-center space-x-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = '/'}
        className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4 mr-1" />
        Dashboard
      </Button>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      {currentView === 'list' ? (
        <span className="font-medium">Resep Produk</span>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('list')}
            className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            Resep Produk
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {currentView === 'add' ? 'Tambah Resep' : 'Edit Resep'}
          </span>
        </>
      )}
    </nav>
  )

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
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Tambah Resep Baru</h2>
          <p className="text-muted-foreground">Buat resep produk untuk perhitungan HPP</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Nama Produk</Label>
            <Input
              value={newRecipe.name}
              onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Contoh: Roti Tawar Premium"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={newRecipe.category} onValueChange={(value) => setNewRecipe(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Roti">🍞 Roti (Tawar, Manis, dll)</SelectItem>
                <SelectItem value="Kue Basah">🧁 Kue Basah (Puding, Bolu, dll)</SelectItem>
                <SelectItem value="Kue Kering">🍪 Kue Kering (Cookies, Nastar)</SelectItem>
                <SelectItem value="Pastry">🥐 Pastry & Croissant</SelectItem>
                <SelectItem value="Donat">🍩 Donat & Muffin</SelectItem>
                <SelectItem value="Cake">🎂 Cake & Tart</SelectItem>
                <SelectItem value="Minuman">🥤 Minuman</SelectItem>
                <SelectItem value="Lainnya">📦 Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Textarea
              value={newRecipe.description}
              onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Deskripsi singkat tentang produk..."
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Komposisi Bahan</Label>
              <Button size="sm" onClick={handleAddIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Bahan
              </Button>
            </div>
            
            {newRecipe.ingredients.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <PackageOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada bahan yang ditambahkan</p>
                <p className="text-sm">Klik tombol "Tambah Bahan" untuk mulai</p>
              </div>
            )}
            
            {newRecipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
                <div className="flex-1">
                  <Label className="text-xs">Bahan</Label>
                  <Select 
                    value={ingredient.ingredient_id} 
                    onValueChange={(value) => handleUpdateIngredient(index, 'ingredient_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients?.map(ing => (
                        <SelectItem key={ing.id} value={ing.id}>
                          {ing.name} (Rp {ing.price_per_unit.toLocaleString()}/{ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-xs">Jumlah</Label>
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
              Simpan Resep
            </Button>
            <Button variant="outline" onClick={() => {
              resetForm()
              setCurrentView('list')
            }}>
              Batal
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
            Resep Produk
          </h1>
          <p className="text-muted-foreground">
            Buat dan kelola resep untuk menghitung HPP otomatis
          </p>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
          <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Resep
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
                  💡 Tips: Cara Mudah Buat Resep
                </h3>
                <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                  <span>• Input nama produk (contoh: "Roti Tawar")</span>
                  <span>• Pilih bahan dari daftar</span>
                  <span>• Masukkan takaran (gram/ml/pcs)</span>
                  <span>• HPP akan dihitung otomatis!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'}`}>
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {recipes.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Resep</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <PackageOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {ingredients?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Bahan Tersedia</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {recipes.filter(r => r.recipe_ingredients?.length > 0).length}
              </div>
              <p className="text-sm text-muted-foreground">Siap Hitung HPP</p>
            </CardContent>
          </Card>
        </div>

        {/* Recipe List */}
        {!ingredients || ingredients.length === 0 ? (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="py-12 text-center">
              <PackageOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'} text-orange-900 dark:text-orange-100`}>
                Belum ada data bahan baku
              </h3>
              <p className="text-orange-700 dark:text-orange-200 mb-4">
                Sebelum membuat resep, Anda perlu menambahkan bahan baku terlebih dahulu
              </p>
              <Button onClick={() => window.location.href = '/inventory'} className="bg-orange-600 hover:bg-orange-700">
                <PackageOpen className="h-4 w-4 mr-2" />
                Ke Data Bahan Baku
              </Button>
            </CardContent>
          </Card>
        ) : recipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Belum ada resep
              </h3>
              <p className="text-muted-foreground mb-4">
                Mulai dengan menambahkan resep pertama untuk produk Anda
              </p>
              <Button onClick={() => setCurrentView('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Resep Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
            {recipes.map((recipe) => {
              const hpp = calculateRecipeHPP(recipe)
              const ingredientCount = recipe.recipe_ingredients?.length || 0
              
              return (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
                          {recipe.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {recipe.category}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setSelectedRecipe(recipe)
                          setCurrentView('edit')
                        }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {recipe.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">HPP Estimasi:</span>
                        <span className="font-bold text-primary">
                          Rp {Math.round(hpp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Jumlah Bahan:</span>
                        <Badge variant={ingredientCount > 0 ? 'default' : 'destructive'}>
                          {ingredientCount} bahan
                        </Badge>
                      </div>
                      
                      {ingredientCount > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1">Bahan utama:</p>
                          <div className="space-y-1">
                            {recipe.recipe_ingredients?.slice(0, 3).map((ri: any, index: number) => {
                              const ingredient = ingredients?.find(ing => ing.id === ri.ingredient_id)
                              return (
                                <div key={index} className="flex justify-between">
                                  <span>• {ingredient?.name || 'Unknown'}</span>
                                  <span>{ri.quantity} {ingredient?.unit}</span>
                                </div>
                              )
                            })}
                            {(recipe.recipe_ingredients?.length || 0) > 3 && (
                              <div className="text-center pt-1">
                                <span>+{(recipe.recipe_ingredients?.length || 0) - 3} bahan lainnya</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={() => window.location.href = '/hpp'}
                        disabled={ingredientCount === 0}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        {ingredientCount > 0 ? 'Hitung HPP Detail' : 'Tambah Bahan Dulu'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb />
        {currentView === 'list' && <RecipeList />}
        {currentView === 'add' && <AddRecipeForm />}
        {currentView === 'edit' && <AddRecipeForm />}
      </div>
    </AppLayout>
  )
}

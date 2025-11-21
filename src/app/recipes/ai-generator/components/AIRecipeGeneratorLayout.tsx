'use client'

import { ChefHat, Sparkles, Package, Save, RotateCcw } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/index'
import { toast } from '@/lib/toast'
import { apiLogger } from '@/lib/logger'
import { typedInsert } from '@/lib/supabase-client'
import { useSupabase } from '@/providers/SupabaseProvider'

import type { Insert, Row } from '@/types/database'

import { GeneratedRecipeDisplay } from '@/app/recipes/ai-generator/components/GeneratedRecipeDisplay'
import { UnifiedIngredientInput } from '@/app/recipes/ai-generator/components/UnifiedIngredientInput'

import type { AvailableIngredient, GeneratedRecipe } from '@/app/recipes/ai-generator/components/types'

// AI Recipe Generator - Complete Rebuild
// Single-page interface with real-time preview and unified ingredient management

const AIRecipeGeneratorPage = () => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { supabase } = useSupabase()

  // Form state
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('main-dish')
  const [servings, setServings] = useState(12)
  const [targetPrice, setTargetPrice] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [customIngredients, setCustomIngredients] = useState<string[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Generation state
  const [loading, setLoading] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)

   // UI state
   const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input')
   const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
   const [lastSaved, setLastSaved] = useState<Date | null>(null)
   const [uiError, setUiError] = useState<string | null>(null)

  // Enhanced form validation
  const isProductNameValid = productName.trim().length >= 3
  const isIngredientsValid = (selectedIngredients.length + customIngredients.length) >= 3
  const isServingsValid = servings >= 1
  const isTargetPriceValid = targetPrice === '' || parseFloat(targetPrice) > 0

  const isFormValid = isProductNameValid && isIngredientsValid && isServingsValid

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Fetch available ingredients
  const fetchIngredients = useCallback(async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('id, name, unit, price_per_unit, current_stock, min_stock')
      .order('name')
      .returns<Array<Row<'ingredients'>>>()

    if (!error && data) {
      const ingredients = data.map((item): AvailableIngredient => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        price_per_unit: item.price_per_unit,
        current_stock: item.current_stock,
        ...(item.min_stock !== null && { minimum_stock: item.min_stock })
      }))

      setAvailableIngredients(ingredients)
    }
  }, [supabase])

  useEffect(() => {
    void fetchIngredients()
  }, [fetchIngredients])

  const handleGenerate = useCallback(async () => {
    // More comprehensive validation before submission
    if (!isProductNameValid) {
      toast.error('Nama produk harus minimal 3 karakter')
      return
    }

    if (!isIngredientsValid) {
      toast.error('Minimal 3 bahan diperlukan untuk generate resep')
      return
    }

    if (!isServingsValid) {
      toast.error('Jumlah porsi harus lebih dari 0')
      return
    }

    if (targetPrice && !isTargetPriceValid) {
      toast.error('Target harga harus berupa angka positif')
      return
    }

    setLoading(true)
    setGeneratedRecipe(null)
    setActiveTab('preview')

    try {
      // Get user_id from Supabase Auth
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: productName,
          type: productType,
          servings,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          dietaryRestrictions,
          preferredIngredients: selectedIngredients,
          customIngredients: customIngredients,
          specialInstructions: specialInstructions.trim() || undefined,
          userId: session.user.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error ?? 'Failed to generate recipe')
      }

      const data = await response.json() as { recipe: GeneratedRecipe }
      setGeneratedRecipe(data.recipe)

      toast.success('AI telah meracik resep profesional untuk Anda')
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error generating recipe:')
      const errorMessage = error as Error

      // More detailed error messages
      if (errorMessage.message.includes('API key')) {
        toast.error('Konfigurasi AI tidak valid. Silakan hubungi administrator.')
      } else if (errorMessage.message.includes('authentication')) {
        toast.error('Sesi Anda telah habis. Silakan login kembali.')
      } else if (errorMessage.message.includes('ingredients')) {
        toast.error('Pastikan Anda memiliki cukup bahan untuk membuat resep ini.')
      } else {
        toast.error(errorMessage.message || 'Terjadi kesalahan saat membuat resep. Silakan coba lagi.')
      }
      setActiveTab('input')
    } finally {
      setLoading(false)
    }
  }, [productName, productType, servings, targetPrice, dietaryRestrictions, selectedIngredients, customIngredients, specialInstructions, isProductNameValid, isIngredientsValid, isServingsValid, isTargetPriceValid, supabase])

  const handleSaveRecipe = useCallback(async () => {
    if (!generatedRecipe) { return }

    try {
      // Get user_id from Stack Auth
      const authResponse = await fetch('/api/auth/me')
      if (!authResponse.ok) {
        throw new Error('User not authenticated')
      }

      const { userId } = await authResponse.json()
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Save recipe to database
      const recipeInsert: Insert<'recipes'> = {
        user_id: userId,
        name: generatedRecipe.name,
        category: generatedRecipe.category,
        servings: generatedRecipe.servings,
        prep_time: generatedRecipe.prep_time_minutes,
        cook_time: generatedRecipe.bake_time_minutes,
        description: generatedRecipe.description,
        instructions: JSON.stringify(generatedRecipe.instructions),
        is_active: true
      }

      const { data: recipeRows, error: recipeError } = await typedInsert(supabase as never, 'recipes', recipeInsert)

      if (recipeError) { throw recipeError }
      const recipe = recipeRows?.[0]
      if (!recipe) {
        throw new Error('Failed to create recipe record')
      }

      // Save recipe ingredients
      const recipeIngredients: Array<Insert<'recipe_ingredients'>> = generatedRecipe.ingredients
        .map((ing) => {
          const ingredient = availableIngredients.find(
            i => i.name.toLowerCase() === ing.name.toLowerCase()
          )

          if (!ingredient) {
            return null
          }

          return {
            recipe_id: recipe.id,
            ingredient_id: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit,
            user_id: userId
          }
        })
        .filter((value): value is Insert<'recipe_ingredients'> => value !== null)

      if (recipeIngredients.length > 0) {
        const { error: ingredientsError } = await typedInsert(supabase as never, 'recipe_ingredients', recipeIngredients)
        if (ingredientsError) { throw ingredientsError }
      }

      toast.success('Resep sudah tersimpan di database Anda')

      // Reset form
      setGeneratedRecipe(null)
      setProductName('')
      setServings(12)
      setTargetPrice('')
      setSelectedIngredients([])
      setCustomIngredients([])
      setSpecialInstructions('')
      setActiveTab('input')

    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error saving recipe:')
      const errorMessage = error as Error

      if (errorMessage.message.includes('authentication')) {
        toast.error('Sesi Anda telah habis. Silakan login kembali.')
      } else if (errorMessage.message.includes('database') || errorMessage.message.includes('insert')) {
        toast.error('Gagal menyimpan resep ke database. Silakan coba lagi.')
      } else {
        toast.error(errorMessage.message || 'Terjadi kesalahan saat menyimpan resep.')
      }
    }
  }, [generatedRecipe, availableIngredients, supabase])

  const handleNewRecipe = useCallback(() => {
    setGeneratedRecipe(null)
    setProductName('')
    setServings(12)
    setTargetPrice('')
    setSelectedIngredients([])
    setCustomIngredients([])
    setSpecialInstructions('')
    setActiveTab('input')
  }, [])

  // Auto-save draft functionality
  const saveDraft = useCallback(() => {
    const draft = {
      productName,
      productType,
      servings,
      targetPrice,
      dietaryRestrictions,
      selectedIngredients,
      customIngredients,
      specialInstructions,
      timestamp: new Date().toISOString()
    }

    try {
      localStorage.setItem('recipe-generator-draft', JSON.stringify(draft))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch {
      // Silently fail for localStorage issues
    }
  }, [productName, productType, servings, targetPrice, dietaryRestrictions, selectedIngredients, customIngredients, specialInstructions])

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem('recipe-generator-draft')
      if (saved) {
        const draft = JSON.parse(saved)
        setProductName(draft.productName || '')
        setProductType(draft.productType || 'bread')
        setServings(draft.servings || 12)
        setTargetPrice(draft.targetPrice || '')
        setDietaryRestrictions(draft.dietaryRestrictions || [])
        setSelectedIngredients(draft.selectedIngredients || [])
        setCustomIngredients(draft.customIngredients || [])
        setSpecialInstructions(draft.specialInstructions || '')
        setLastSaved(new Date(draft.timestamp))
        return true
      }
    } catch {
      // Silently fail for localStorage issues
    }
    return false
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem('recipe-generator-draft')
    setLastSaved(null)
    setHasUnsavedChanges(false)
  }, [])

  // Auto-save effect
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && (productName || selectedIngredients.length > 0 || customIngredients.length > 0)) {
        saveDraft()
      }
    }, 5000) // Save every 5 seconds

    return () => clearInterval(autoSaveInterval)
  }, [hasUnsavedChanges, productName, selectedIngredients, customIngredients, saveDraft])

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [productName, productType, servings, targetPrice, dietaryRestrictions, selectedIngredients, customIngredients, specialInstructions])

  // Load draft on mount
  useEffect(() => {
    const hasDraft = loadDraft()
    if (hasDraft) {
      setHasUnsavedChanges(false)
    }
  }, [loadDraft])



  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-white animate-pulse" />
            </div>
            <p className="text-muted-foreground">Memuat Generator Resep AI...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Redirecting to login...</div>
        </div>
      </AppLayout>
    )
  }



  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Error display for UI errors */}
        {uiError && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{uiError}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => setUiError(null)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-4 space-y-6">
          {/* Header */}
          <PageHeader
            title={
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                AI Resep UMKM
              </span>
            }
            description="✨ Buat resep kuliner UMKM profesional dengan AI dalam hitungan detik"
            icon={
              <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
            }
          />

          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-card/50 rounded-xl p-4 border shadow-sm gap-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {lastSaved && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Draft tersimpan {lastSaved.toLocaleTimeString('id-ID')}</span>
                </div>
              )}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Perubahan belum tersimpan</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>💡 Auto-save aktif • Minimal 3 bahan untuk generate</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="bg-card rounded-xl p-1 border shadow-sm w-full max-w-md">
              <div className="flex gap-1">
                <Button
                  variant={activeTab === 'input' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('input')}
                  className={`px-4 py-2 flex-1 text-sm transition-all duration-200 ${
                    activeTab === 'input'
                      ? 'shadow-sm transform scale-[1.02]'
                      : 'hover:bg-accent'
                  }`}
                >
                  📝 Input Resep
                </Button>
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('preview')}
                  disabled={!generatedRecipe && !loading}
                  className={`px-4 py-2 flex-1 text-sm transition-all duration-200 ${
                    activeTab === 'preview'
                      ? 'shadow-sm transform scale-[1.02]'
                      : 'hover:bg-accent disabled:opacity-50'
                  }`}
                >
                  👀 Preview & Hasil
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
            {/* Input Panel */}
            {activeTab === 'input' && (
              <div className="space-y-6 lg:col-span-7 w-full">
                {/* Live Preview */}
                {(productName || selectedIngredients.length > 0 || customIngredients.length > 0) && (
                  <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                          👁️
                        </div>
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nama:</span>
                          <p className="font-medium truncate">{productName || 'Belum diisi'}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Jenis:</span>
                          <p className="font-medium">
                            {productType === 'main-dish' ? '🍽️ Makanan Utama' :
                             productType === 'side-dish' ? '🥗 Lauk Pendamping' :
                             productType === 'snack' ? '🍿 Camilan' :
                             productType === 'beverage' ? '🥤 Minuman' :
                             productType === 'dessert' ? '🍰 Dessert' :
                             productType === 'culinary' ? '🥘 Masakan Umum' : '🍲 Lainnya'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Porsi:</span>
                          <p className="font-medium">{servings} porsi</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bahan:</span>
                          <p className="font-medium">{selectedIngredients.length + customIngredients.length} bahan</p>
                        </div>
                      </div>

                      {targetPrice && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground text-sm">Target Harga:</span>
                          <p className="font-medium">Rp {parseInt(targetPrice).toLocaleString('id-ID')}</p>
                        </div>
                      )}

                      {(selectedIngredients.length > 0 || customIngredients.length > 0) && (
                        <div className="pt-2 border-t">
                          <span className="text-muted-foreground text-sm">Bahan Utama:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {[...selectedIngredients.slice(0, 3), ...customIngredients.slice(0, 3)].map((ing, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {typeof ing === 'string' ? ing : 'Bahan dari inventory'}
                              </Badge>
                            ))}
                            {(selectedIngredients.length + customIngredients.length) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(selectedIngredients.length + customIngredients.length) - 3} lainnya
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {isFormValid && (
                        <div className="pt-2 border-t">
                          <Badge className="bg-green-500 text-white">
                            ✅ Siap untuk generate resep!
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Start Templates */}
                {!productName && selectedIngredients.length === 0 && customIngredients.length === 0 && (
                  <Card className="border-2 border-dashed border-primary/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                          🚀
                        </div>
                        Contoh Resep UMKM
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Pilih contoh untuk memulai lebih cepat
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          {
                            id: 'nasi-goreng',
                            name: 'Nasi Goreng Spesial',
                            type: 'main-dish',
                            servings: 4,
                            ingredients: ['nasi putih', 'telur ayam', 'bawang putih', 'bawang merah', 'kecap manis', 'sayuran'],
                            icon: '🍚'
                          },
                          {
                            id: 'ayam-goreng',
                            name: 'Ayam Goreng Crispy',
                            type: 'main-dish',
                            servings: 6,
                            ingredients: ['ayam', 'tepung terigu', 'telur ayam', 'bawang putih', 'ketumbar', 'minyak goreng'],
                            icon: '🍗'
                          },
                          {
                            id: 'jus-buah',
                            name: 'Jus Buah Segar',
                            type: 'beverage',
                            servings: 4,
                            ingredients: ['buah jeruk', 'buah apel', 'madu', 'air', 'es batu'],
                            icon: '🧃'
                          },
                          {
                            id: 'martabak-manis',
                            name: 'Martabak Manis',
                            type: 'dessert',
                            servings: 8,
                            ingredients: ['tepung terigu', 'telur ayam', 'gula pasir', 'susu', 'keju', 'meses'],
                            icon: '🥞'
                          },
                          {
                            id: 'sate-ayam',
                            name: 'Sate Ayam Madura',
                            type: 'main-dish',
                            servings: 6,
                            ingredients: ['ayam', 'kecap manis', 'bawang merah', 'bawang putih', 'ketumbar', 'tusuk sate'],
                            icon: '🍢'
                          },
                          {
                            id: 'bakso-malang',
                            name: 'Bakso Malang',
                            type: 'main-dish',
                            servings: 8,
                            ingredients: ['daging sapi', 'tepung tapioka', 'bawang putih', 'telur ayam', 'mie', 'tahu'],
                            icon: '🥟'
                          }
                        ].map((template) => (
                          <Card
                            key={template.id}
                            className="cursor-pointer hover:shadow-md transition-shadow border hover:border-primary/50"
                            onClick={() => {
                              setProductName(template.name)
                              setProductType(template.type as 'main-dish' | 'side-dish' | 'snack' | 'beverage' | 'dessert' | 'bread' | 'other')
                              setServings(template.servings)
                              setCustomIngredients(template.ingredients)
                              setActiveTab('input')
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{template.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">{template.name}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {template.servings} porsi • {template.ingredients.length} bahan
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Product Details */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Detail Produk
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="flex items-center gap-1">
                        Nama Produk *
                        {!isProductNameValid && productName && (
                          <span className="text-xs text-red-500">min 3 karakter</span>
                        )}
                      </Label>
                      <Input
                        id="productName"
                        placeholder="Contoh: Roti Tawar Premium, Brownies Coklat"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        disabled={loading}
                        className={!isProductNameValid && productName ? "border-red-500 focus:border-red-500" : ""}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="productType">Jenis Produk *</Label>
                        <Select value={productType} onValueChange={setProductType} disabled={loading}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main-dish">🍽️ Makanan Utama</SelectItem>
                            <SelectItem value="side-dish">🥗 Lauk Pendamping</SelectItem>
                            <SelectItem value="snack">🍿 Camilan</SelectItem>
                            <SelectItem value="beverage">🥤 Minuman</SelectItem>
                            <SelectItem value="dessert">🍰 Dessert</SelectItem>
                            <SelectItem value="culinary">🥘 Masakan Umum</SelectItem>
                            <SelectItem value="other">🍲 Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="servings" className="flex items-center gap-1">
                          Jumlah Hasil *
                          {!isServingsValid && servings === 0 && (
                            <span className="text-xs text-red-500">harus &gt; 0</span>
                          )}
                        </Label>
                        <Input
                          id="servings"
                          type="number"
                          min="1"
                          placeholder="12"
                          value={servings}
                          onChange={(e) => setServings(parseInt(e.target.value) || 12)}
                          disabled={loading}
                          className={!isServingsValid && servings === 0 ? "border-red-500 focus:border-red-500" : ""}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetPrice" className="flex items-center gap-1">
                        Target Harga Jual (opsional)
                        {targetPrice && !isTargetPriceValid && (
                          <span className="text-xs text-red-500">harga harus positif</span>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <div className="px-3 py-2 bg-muted rounded-md text-sm flex items-center">Rp</div>
                        <Input
                          id="targetPrice"
                          type="number"
                          min="0"
                          placeholder="25000"
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          disabled={loading}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialInstructions">Instruksi Khusus (opsional)</Label>
                      <Textarea
                        id="specialInstructions"
                        placeholder="Contoh: Buat versi diet, tanpa gula, atau dengan bahan lokal..."
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        disabled={loading}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Ingredients */}
                <UnifiedIngredientInput
                  availableIngredients={availableIngredients.map(ing => ({
                    id: ing.id,
                    name: ing.name,
                    unit: ing.unit,
                    price_per_unit: ing.price_per_unit,
                    current_stock: ing.current_stock ?? 0,
                    ...(ing.minimum_stock !== undefined && { minimum_stock: ing.minimum_stock })
                  }))}
                  selectedIngredients={selectedIngredients}
                  customIngredients={customIngredients}
                  onSelectionChange={setSelectedIngredients}
                  onCustomIngredientsChange={setCustomIngredients}
                  productType={productType}
                  disabled={loading}
                />

                {/* Action Buttons */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Generate Button */}
                      <Button
                        onClick={handleGenerate}
                        disabled={loading || !isFormValid}
                        size="lg"
                        className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {loading ? (
                          <>
                            <ChefHat className="h-5 w-5 mr-2 animate-spin" />
                            AI Sedang Meracik...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Generate Resep dengan AI
                          </>
                        )}
                      </Button>

                      {/* Secondary Actions */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={saveDraft}
                          disabled={!hasUnsavedChanges}
                          className="flex-1"
                        >
                          💾 Save Draft
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleNewRecipe}
                          className="flex-1"
                        >
                          🔄 Reset Form
                        </Button>
                      </div>

                      {!isFormValid && !loading && (
                        <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium text-orange-600">⚠️ Lengkapi form untuk generate:</p>
                          {!isProductNameValid && <p>• Nama produk minimal 3 karakter</p>}
                          {!isIngredientsValid && <p>• Minimal 3 bahan diperlukan</p>}
                          {!isServingsValid && <p>• Jumlah porsi harus lebih dari 0</p>}
                        </div>
                      )}

                      {isFormValid && !loading && (
                        <div className="text-sm text-green-600 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <p className="font-medium">✅ Form siap! Klik generate untuk membuat resep.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Preview Panel */}
            <div className="space-y-6 lg:col-span-5 w-full">
              {loading && (
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 animate-pulse">
                  <CardContent className="py-16">
                    <div className="text-center space-y-8">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto animate-bounce">
                          <ChefHat className="h-12 w-12 text-white" />
                        </div>
                        <div className="absolute inset-0 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 mx-auto animate-ping opacity-20" />
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                          ✨ AI sedang meracik resep...
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Membuat resep profesional yang disesuaikan dengan kebutuhan bisnis Anda
                        </p>
                      </div>

                      <div className="max-w-md mx-auto space-y-2">
                        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full" style={{
                            animation: 'loading-progress 3s infinite',
                            width: '0%'
                          }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Memahami permintaan Anda</span>
                          <span>Meracik resep unggulan</span>
                        </div>
                      </div>

                      <style jsx>{`
                        @keyframes loading-progress {
                          0% { width: 0%; }
                          50% { width: 70%; }
                          100% { width: 100%; }
                        }
                      `}</style>

                      <div className="text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full inline-block">
                        ⏱️ Estimasi selesai dalam 15-30 detik
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {generatedRecipe && activeTab === 'preview' && (
                <GeneratedRecipeDisplay
                  recipe={generatedRecipe}
                  onSave={handleSaveRecipe}
                  onGenerateAgain={handleNewRecipe}
                  availableIngredients={availableIngredients}
                />
              )}

              {!loading && !generatedRecipe && activeTab === 'preview' && (
                <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="py-16">
                    <div className="text-center space-y-4">
                      <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center">
                        <ChefHat className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Preview Resep AI</h3>
                      <p className="text-muted-foreground">
                        Isi form di sebelah kiri untuk melihat preview resep yang akan dihasilkan
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

    </AppLayout>
  )
}

export { AIRecipeGeneratorPage }
// AI Recipe Generator Layout - Enhanced Interactive Version
// Improved UX with live preview, quick mode, and better guidance

'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { createClient as createSupabaseClient } from '@/utils/supabase'
import { apiLogger } from '@/lib/logger'
import type { GeneratedRecipe, AvailableIngredient } from './types'

// Lazy load heavy components
import dynamic from 'next/dynamic'

const RecipeGeneratorForm = dynamic(
  () => import(/* webpackChunkName: "ai-recipe-generator-form" */ './RecipeGeneratorFormEnhanced'),
  {
    loading: () => <div className="p-4">Loading form...</div>
  }
)

const GeneratedRecipeDisplay = dynamic(
  () => import(/* webpackChunkName: "ai-recipe-display" */ './GeneratedRecipeDisplay'),
  {
    loading: () => <div className="p-4">Loading recipe display...</div>
  }
)

const RecipePreviewCard = dynamic(
  () => import(/* webpackChunkName: "ai-recipe-preview" */ './RecipePreviewCard'),
  {
    loading: () => <div className="p-4">Loading preview...</div>
  }
)

export default function AIRecipeGeneratorPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Form state
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('bread')
  const [servings, setServings] = useState(2)
  const [targetPrice, setTargetPrice] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])

  // Generation state
  const [loading, setLoading] = useState(false)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)

  // Mode state (quick vs complete)
  const [mode, setMode] = useState<'quick' | 'complete'>('quick')

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      void router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  useEffect(() => {
    void fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name')

    if (!error && data) {
      void setAvailableIngredients(data)
    }
  }

  const handleGenerate = async () => {
    if (!productName || !productType || !servings) {
      toast({
        title: 'Data belum lengkap',
        description: 'Mohon isi nama produk dan jumlah hasil',
        variant: 'destructive',
      })
      return
    }

    void setLoading(true)
    void setGeneratedRecipe(null)

    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
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
          userId: user.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate recipe')
      }

      const data = await response.json()
      void setGeneratedRecipe(data.recipe)

      toast({
        title: '✨ Resep berhasil dibuat!',
        description: 'AI telah meracik resep profesional untuk Anda',
      })
    } catch (err: unknown) {
      apiLogger.error({ error }, 'Error generating recipe:')
      toast({
        title: 'Gagal generate resep',
        description: (error as Error).message || 'Terjadi kesalahan, coba lagi',
        variant: 'destructive',
      })
    } finally {
      void setLoading(false)
    }
  }

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) { return }

    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Save recipe to database
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          user_id: user.id,
          name: generatedRecipe.name,
          category: generatedRecipe.category,
          servings: generatedRecipe.servings,
          prep_time: generatedRecipe.prep_time_minutes,
          cook_time: generatedRecipe.bake_time_minutes,
          description: generatedRecipe.description,
          instructions: generatedRecipe.instructions,
          tips: generatedRecipe.tips,
          storage_instructions: generatedRecipe.storage,
          shelf_life: generatedRecipe.shelf_life,
          is_active: true
        })
        .select()
        .single()

      if (recipeError) { throw recipeError }

      // Save recipe ingredients
      const recipeIngredients = generatedRecipe.ingredients.map((ing) => {
        const ingredient = availableIngredients.find(
          i => i.name.toLowerCase() === ing.name.toLowerCase()
        )

        return {
          recipe_id: recipe.id,
          ingredient_id: ingredient?.id,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes
        }
      })

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(recipeIngredients)

      if (ingredientsError) { throw ingredientsError }

      toast({
        title: '✅ Resep berhasil disimpan!',
        description: 'Resep sudah tersimpan di database Anda',
      })

      // Reset form
      void setGeneratedRecipe(null)
      void setProductName('')
      void setServings(2)
      void setTargetPrice('')
      void setSelectedIngredients([])

    } catch (err: unknown) {
      apiLogger.error({ error }, 'Error saving recipe:')
      toast({
        title: 'Gagal menyimpan resep',
        description: (error as Error).message || 'Terjadi kesalahan',
        variant: 'destructive',
      })
    }
  }

  const handleGenerateAgain = () => {
    void setGeneratedRecipe(null)
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Recipe Generator</h1>
            </div>
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header with Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Recipe Generator
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                ✨ Generate resep UMKM profesional dengan AI dalam hitungan detik
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-1.5 rounded-xl border border-purple-200 dark:border-purple-800">
            <button
              onClick={() => setMode('quick')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'quick'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-black/20'
                }`}
            >
              <Zap className="h-4 w-4" />
              Mode Cepat
            </button>
            <button
              onClick={() => setMode('complete')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'complete'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-black/20'
                }`}
            >
              <ChefHat className="h-4 w-4" />
              Mode Lengkap
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form - Enhanced */}
          <RecipeGeneratorForm
            productName={productName}
            setProductName={setProductName}
            productType={productType}
            setProductType={setProductType}
            servings={servings}
            setServings={setServings}
            targetPrice={targetPrice}
            setTargetPrice={setTargetPrice}
            dietaryRestrictions={dietaryRestrictions}
            setDietaryRestrictions={setDietaryRestrictions}
            selectedIngredients={selectedIngredients}
            setSelectedIngredients={setSelectedIngredients}
            availableIngredients={availableIngredients}
            loading={loading}
            onGenerate={handleGenerate}
            mode={mode}
          />

          {/* Right Side - Preview or Result */}
          <div className="space-y-6">
            {loading && (
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="py-16">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mx-auto shadow-xl">
                        <ChefHat className="h-10 w-10 text-white animate-bounce" />
                      </div>
                      <div className="absolute inset-0 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto animate-ping opacity-20" />
                    </div>
                    <div>
                      <p className="font-semibold text-xl mb-2">🧑‍🍳 AI sedang meracik resep...</p>
                      <p className="text-sm text-muted-foreground">
                        Tunggu sebentar ya, proses ini membutuhkan waktu 10-30 detik
                      </p>
                      <div className="mt-6 flex justify-center gap-2">
                        <div className="h-3 w-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-3 w-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-8 space-y-3 max-w-sm mx-auto">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-muted-foreground">Menganalisis input Anda</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-6 w-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                          <span className="text-white text-xs">⚡</span>
                        </div>
                        <span className="font-medium">Meracik komposisi bahan</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-xs">3</span>
                        </div>
                        <span className="text-muted-foreground">Menyusun instruksi</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedRecipe && (
              <GeneratedRecipeDisplay
                recipe={generatedRecipe}
                onSave={handleSaveRecipe}
                onGenerateAgain={handleGenerateAgain}
                availableIngredients={availableIngredients}
              />
            )}

            {!loading && !generatedRecipe && (
              <RecipePreviewCard
                productName={productName}
                productType={productType}
                servings={servings}
                targetPrice={targetPrice}
                selectedIngredients={selectedIngredients}
                availableIngredients={availableIngredients}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

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

const RecipeGeneratorForm = dynamic(() => import('./RecipeGeneratorFormEnhanced'), {
  loading: () => <div className="p-4">Loading form...</div>
})

const GeneratedRecipeDisplay = dynamic(() => import('./GeneratedRecipeDisplay'), {
  loading: () => <div className="p-4">Loading recipe display...</div>
})

const RecipePreviewCard = dynamic(() => import('./RecipePreviewCard'), {
  loading: () => <div className="p-4">Loading preview...</div>
})

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
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  useEffect(() => {
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name')

    if (!error && data) {
      setAvailableIngredients(data)
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

    setLoading(true)
    setGeneratedRecipe(null)

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
      setGeneratedRecipe(data.recipe)
      
      toast({
        title: '✨ Resep berhasil dibuat!',
        description: 'AI telah meracik resep profesional untuk Anda',
      })
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error generating recipe:')
      toast({
        title: 'Gagal generate resep',
        description: (error as Error).message || 'Terjadi kesalahan, coba lagi',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) {return}

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

      if (recipeError) {throw recipeError}

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

      if (ingredientsError) {throw ingredientsError}

      toast({
        title: '✅ Resep berhasil disimpan!',
        description: 'Resep sudah tersimpan di database Anda',
      })

      // Reset form
      setGeneratedRecipe(null)
      setProductName('')
      setServings(2)
      setTargetPrice('')
      setSelectedIngredients([])

    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error saving recipe:')
      toast({
        title: 'Gagal menyimpan resep',
        description: (error as Error).message || 'Terjadi kesalahan',
        variant: 'destructive',
      })
    }
  }

  const handleGenerateAgain = () => {
    setGeneratedRecipe(null)
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Recipe Generator</h1>
              <p className="text-muted-foreground">
                Generate resep UMKM profesional dengan AI dalam hitungan detik
              </p>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex gap-2 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setMode('quick')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === 'quick'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="h-4 w-4" />
              Mode Cepat
            </button>
            <button
              onClick={() => setMode('complete')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                mode === 'complete'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
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
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                      <ChefHat className="h-8 w-8 text-white animate-bounce" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">🧑‍🍳 AI sedang meracik resep...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tunggu sebentar ya, ini butuh waktu 10-30 detik
                      </p>
                      <div className="mt-4 flex justify-center gap-1">
                        <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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

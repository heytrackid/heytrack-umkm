// AI Recipe Generator Layout - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded AI recipe generation components

'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { createClient as createSupabaseClient } from '@/utils/supabase'
import { apiLogger } from '@/lib/logger'
import type { GeneratedRecipe, AvailableIngredient } from './types'

// Lazy load heavy components
import dynamic from 'next/dynamic'

const RecipeGeneratorForm = dynamic(() => import('./RecipeGeneratorForm'), {
  loading: () => <div className="p-4">Loading form...</div>
})

const GeneratedRecipeDisplay = dynamic(() => import('./GeneratedRecipeDisplay'), {
  loading: () => <div className="p-4">Loading recipe display...</div>
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
      alert('Mohon isi semua field yang wajib')
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
          productName,
          productType,
          servings,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          dietaryRestrictions,
          availableIngredients: selectedIngredients,
          userId: user.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate recipe')
      }

      const data = await response.json()
      setGeneratedRecipe(data.recipe)
    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error generating recipe:')
      alert((error as Error).message || 'Gagal generate resep')
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

      alert('✅ Resep berhasil disimpan!')

      // Reset form
      setGeneratedRecipe(null)
      setProductName('')
      setServings(2)
      setTargetPrice('')
      setSelectedIngredients([])

    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error saving recipe:')
      alert('Gagal menyimpan resep: ' + ((error as Error).message || String(error)))
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
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form - Lazy Loaded */}
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
          />

          {/* Generated Recipe Display */}
          <div className="space-y-6">
            {loading && (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto animate-pulse">
                      <ChefHat className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">AI sedang meracik resep...</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tunggu sebentar ya, ini butuh waktu 10-30 detik
                      </p>
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
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Resep akan muncul di sini</p>
                    <p className="text-sm mt-1">
                      Isi form di sebelah kiri dan klik "Generate Resep dengan AI"
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

'use client'

import { ChefHat, Sparkles, Zap, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { typedInsert } from '@/lib/supabase-client'
import { loadDraft, clearDraft } from '@/lib/utils/recipe-helpers'
import { useSupabase } from '@/providers/SupabaseProvider'


import type { Insert, Row } from '@/types/database'

import GeneratedRecipeDisplay from './GeneratedRecipeDisplay'
import { HppEstimator } from './HppEstimator'
import RecipeGeneratorForm from './RecipeGeneratorForm'
import RecipePreviewCard from './RecipePreviewCard'
import { SmartIngredientSelector } from './SmartIngredientSelector'



import type { GeneratedRecipe, AvailableIngredient } from './types'

// AI Recipe Generator Layout - Enhanced Interactive Version
// Improved UX with live preview, quick mode, and better guidance



// Import components normally (lightweight UI components)

const AIRecipeGeneratorPage = () => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const { supabase } = useSupabase()

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
  const [mode, setMode] = useState<'complete' | 'quick'>('quick')

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const wizardSteps = [
    { id: 1, title: 'Detail Produk', description: 'Informasi dasar produk' },
    { id: 2, title: 'Pilih Bahan', description: 'Bahan yang akan digunakan' },
    { id: 3, title: 'Review & Generate', description: 'Periksa dan buat resep' }
  ]



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

   // Sprint 1: Load draft on mount
   useEffect(() => {
     const draft = loadDraft()
     if (draft) {
       toast({
         title: '📝 Draft ditemukan!',
         description: 'Mau lanjutin draft sebelumnya?',
         action: (
           <Button size="sm" onClick={() => {
             setProductName(draft.productName)
             setProductType(draft.productType)
             setServings(draft.servings)
             setSelectedIngredients(draft.selectedIngredients)
             if (draft.targetPrice) { setTargetPrice(draft.targetPrice) }
           }}>
             Restore
           </Button>
         )
       })
     }
   }, [toast])

   const fetchIngredients = useCallback(async () => {
     const { data, error } = await supabase
       .from('ingredients')
       .select('*')
       .order('name')
       .returns<Array<Row<'ingredients'>>>()

     if (!error && data) {
        const ingredients = data.map((item): AvailableIngredient => ({
          id: item['id'],
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
          userId: user['id']
        })
      })

      if (!response.ok) {
        const errorData = await response.json() as { error?: string }
        throw new Error(errorData.error ?? 'Failed to generate recipe')
      }

      const data = await response.json() as { recipe: GeneratedRecipe }
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
  }, [productName, productType, servings, targetPrice, dietaryRestrictions, selectedIngredients, toast, supabase])

  const handleSaveRecipe = useCallback(async () => {
    if (!generatedRecipe) { return }

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      // Save recipe to database
      const recipeInsert: Insert<'recipes'> = {
        user_id: user['id'],
        name: generatedRecipe.name,
        category: generatedRecipe.category,
        servings: generatedRecipe.servings,
        prep_time: generatedRecipe.prep_time_minutes,
        cook_time: generatedRecipe.bake_time_minutes,
        description: generatedRecipe.description,
        instructions: JSON.stringify(generatedRecipe.instructions), // Convert to JSON string
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
            recipe_id: recipe['id'],
            ingredient_id: ingredient['id'],
            quantity: ing.quantity,
            unit: ing.unit,
            user_id: user['id']
          }
        })
        .filter((value): value is Insert<'recipe_ingredients'> => value !== null)

      if (recipeIngredients.length > 0) {
      const { error: ingredientsError } = await typedInsert(supabase as never, 'recipe_ingredients', recipeIngredients)

        if (ingredientsError) { throw ingredientsError }
      }

      toast({
        title: '✅ Resep berhasil disimpan!',
        description: 'Resep sudah tersimpan di database Anda',
      })

      // Reset form & clear draft
      setGeneratedRecipe(null)
      setProductName('')
      setServings(2)
      setTargetPrice('')
      setSelectedIngredients([])

      clearDraft() // Sprint 1: Clear saved draft

    } catch (error: unknown) {
      apiLogger.error({ error }, 'Error saving recipe:')
      toast({
        title: 'Gagal menyimpan resep',
        description: (error as Error).message || 'Terjadi kesalahan',
        variant: 'destructive',
       })
     }
   }, [generatedRecipe, availableIngredients, toast, supabase])

  const handleGenerateAgain = useCallback(() => {
    setGeneratedRecipe(null)
  }, [])

  // Wizard navigation
  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return productName.trim().length >= 3 && productType !== '' && servings >= 1 && servings <= 100
      case 2:
        return selectedIngredients.length >= 3
      case 3:
        return true
      default:
        return false
    }
  }, [currentStep, productName, productType, servings, selectedIngredients])

  const handleNextStep = useCallback(() => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }, [canProceedToNextStep, currentStep, totalSteps])

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleStepClick = useCallback((stepId: number) => {
    // Allow going back to previous steps
    if (stepId < currentStep) {
      setCurrentStep(stepId)
    }
    // Allow going to next step only if current step is valid
    else if (stepId === currentStep + 1 && canProceedToNextStep()) {
      setCurrentStep(stepId)
    }
   }, [currentStep, canProceedToNextStep])

   const getStepClassName = (stepId: number) => {
    if (stepId < currentStep) {return 'bg-primary border-primary text-primary-foreground'}
    if (stepId === currentStep) {return 'border-primary text-primary bg-primary/10'}
    return 'border-muted-foreground/30 text-muted-foreground'
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center">
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
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Generator Resep AI
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                ✨ Buat resep UMKM profesional dengan AI dalam hitungan detik
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-muted/50 p-1.5 rounded-xl border">
            <button
              onClick={() => setMode('quick')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'quick'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <Zap className="h-4 w-4" />
              Mode Cepat
            </button>
            <button
              onClick={() => setMode('complete')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${mode === 'complete'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              <ChefHat className="h-4 w-4" />
              Mode Lengkap
            </button>
          </div>
        </div>

        {/* Wizard Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {wizardSteps.map((step, index) => (
                <div key={step['id']} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 cursor-pointer transition-all ${getStepClassName(step['id'])}`}
                    onClick={() => handleStepClick(step['id'])}
                  >
                    {step['id'] < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step['id']}</span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className={`text-sm font-medium ${
                      step['id'] <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  {index < wizardSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step['id'] < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Step Content */}
          <div className="space-y-6">
            {/* Step 1: Product Details */}
            {currentStep === 1 && (
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
            )}

            {/* Step 2: Ingredient Selection */}
            {currentStep === 2 && !generatedRecipe && (
              <SmartIngredientSelector
                  availableIngredients={availableIngredients.map(ing => ({
                    id: ing['id'],
                    name: ing.name,
                    unit: ing.unit,
                    price_per_unit: ing.price_per_unit,
                    current_stock: ing.current_stock ?? 0,
                    ...(ing.minimum_stock !== undefined && { minimum_stock: ing.minimum_stock })
                  }))}
                selectedIngredients={selectedIngredients}
                onSelectionChange={setSelectedIngredients}
                productType={productType}
              />
            )}

            {/* Step 3: Review & Generate */}
            {currentStep === 3 && !generatedRecipe && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Siap Generate Resep!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI akan membuat resep profesional berdasarkan input Anda
                      </p>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={loading}
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Zap className="h-4 w-4 mr-2 animate-spin" />
                          Generating Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Resep dengan AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: HPP Estimator & Preview */}
          <div className="space-y-6">
            {/* Sprint 1: HPP Estimator */}
            {!generatedRecipe && !loading && (
               <HppEstimator
                 selectedIngredients={availableIngredients
                   .filter(ing => selectedIngredients.includes(ing['id']))
                   .map(ing => ({
                     id: ing['id'],
                     name: ing.name,
                     unit: ing.unit,
                     price_per_unit: ing.price_per_unit,
                     current_stock: ing.current_stock ?? 0
                   }))}
                 servings={servings}
                 {...(targetPrice && { targetPrice: parseFloat(targetPrice) })}
               />
            )}
            {loading && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="py-16">
                  <div className="text-center space-y-8">
                    {/* Animated Chef Icon */}
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto shadow-2xl">
                        <ChefHat className="h-12 w-12 text-white animate-pulse" />
                      </div>
                      <div className="absolute inset-0 h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/80 mx-auto animate-ping opacity-30" />
                      <div className="absolute inset-2 h-20 w-20 rounded-full bg-white/20 mx-auto animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    {/* Main Message */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                        ✨ AI sedang meracik resep...
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Kami sedang membuat resep profesional yang disesuaikan dengan kebutuhan bisnis Anda
                      </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Progress</span>
                        <span>Memproses...</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse" style={{ width: '60%' }} />
                      </div>
                    </div>

                    {/* Detailed Progress Steps */}
                    <div className="space-y-4 max-w-lg mx-auto">
                      <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-primary/20">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">✅ Input Tervalidasi</div>
                          <div className="text-xs text-muted-foreground">Semua data produk telah diperiksa</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border-2 border-primary/30">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 animate-spin">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm">⚡ AI Sedang Berpikir</div>
                          <div className="text-xs text-muted-foreground">Menganalisis bahan dan komposisi optimal</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-muted">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-xs font-bold">3</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm text-muted-foreground">Menghitung HPP</div>
                          <div className="text-xs text-muted-foreground">Menentukan biaya produksi akurat</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-muted">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-muted-foreground text-xs font-bold">4</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-sm text-muted-foreground">Finalisasi Resep</div>
                          <div className="text-xs text-muted-foreground">Menyusun instruksi lengkap</div>
                        </div>
                      </div>
                    </div>

                    {/* Fun Loading Animation */}
                    <div className="flex justify-center gap-1">
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                      <div className="h-2 w-2 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: '600ms' }} />
                    </div>

                    {/* Estimated Time */}
                    <div className="text-xs text-muted-foreground bg-muted/30 px-4 py-2 rounded-full inline-block">
                      ⏱️ Estimasi selesai dalam 15-30 detik
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

        {/* Wizard Navigation */}
        {!generatedRecipe && (
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="text-sm text-muted-foreground">
              Langkah {currentStep} dari {totalSteps}
            </div>

            <Button
              onClick={handleNextStep}
              disabled={currentStep >= totalSteps || !canProceedToNextStep()}
              className="flex items-center gap-2"
            >
              Selanjutnya
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default AIRecipeGeneratorPage

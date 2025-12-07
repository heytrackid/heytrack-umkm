/**
 * Custom hook for AI Recipe Generator logic
 * Extracted from AIRecipeGeneratorLayout for better maintainability
 * 
 * Enhanced with:
 * - Web Worker for heavy processing
 * - Caching layer for results
 * - Progress tracking with streaming updates
 * - Recipe variations support
 * - Batch generation
 * - Recipe history
 */
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
    useGenerateRecipeEnhanced,
    type GenerateRecipeParams,
    type VariationType
} from '@/hooks/api/useAIRecipeEnhanced'
import { useAuth, useAuthMe } from '@/hooks/index'
import { useIngredientsList } from '@/hooks/useIngredients'
import { useCreateRecipeWithIngredients } from '@/hooks/useRecipes'
import { useRecipeWorker } from '@/hooks/useRecipeWorker'
import { handleError } from '@/lib/error-handling'
import { saveToHistory } from './RecipeHistory'

import type { Insert } from '@/types/database'
import type { AvailableIngredient, GeneratedRecipe } from './types'

export interface AIRecipeFormState {
  productName: string
  productType: string
  servings: number
  targetPrice: string
  dietaryRestrictions: string[]
  selectedIngredients: string[]
  customIngredients: string[]
  specialInstructions: string
}

const initialFormState: AIRecipeFormState = {
  productName: '',
  productType: 'main-dish',
  servings: 12,
  targetPrice: '',
  dietaryRestrictions: [],
  selectedIngredients: [],
  customIngredients: [],
  specialInstructions: ''
}

export function useAIRecipeGenerator() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { data: authData } = useAuthMe()
  const router = useRouter()
  const { data: ingredients = [] } = useIngredientsList()

  // Generation state
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [uiError, setUiError] = useState<string | null>(null)

  // Form state
  const [formState, setFormState] = useState<AIRecipeFormState>(initialFormState)

  // Enhanced mutations with progress tracking
  const {
    generate: generateRecipe,
    isPending: isGeneratingRecipe,
    progress: generationProgress,
    resetProgress,
    generateVariation,
    generateBatch,
    cancelGeneration,
    isWorkerProcessing
  } = useGenerateRecipeEnhanced((data: GeneratedRecipe) => {
    setGeneratedRecipe(data)
    // Save to history
    saveToHistory(data, {
      productName: formState.productName,
      productType: formState.productType,
      servings: formState.servings
    })
  })

  // Web Worker for heavy calculations
  const worker = useRecipeWorker()

  const createRecipeWithIngredients = useCreateRecipeWithIngredients()

  // Transform ingredients to AvailableIngredient format
  const availableIngredients = useMemo(() => {
    return (ingredients || []).map(ing => ({
      id: ing.id,
      name: ing.name,
      current_stock: ing.current_stock ?? 0,
      unit: ing.unit,
      price_per_unit: ing.price_per_unit,
      minimum_stock: ing.min_stock
    })) as AvailableIngredient[]
  }, [ingredients])

  // Validation
  const isProductNameValid = formState.productName.trim().length >= 3
  const isIngredientsValid = (formState.selectedIngredients.length + formState.customIngredients.length) >= 3
  const isServingsValid = formState.servings >= 1
  const isTargetPriceValid = formState.targetPrice === '' || parseFloat(formState.targetPrice) > 0
  const isFormValid = isProductNameValid && isIngredientsValid && isServingsValid

  // Handle auth redirect
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      handleError(new Error('Authentication required'), 'AI Recipe Generator: auth check', true, 'Sesi Anda telah berakhir. Silakan login kembali.')
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Form update helpers
  const updateFormField = useCallback(<K extends keyof AIRecipeFormState>(
    field: K,
    value: AIRecipeFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetForm = useCallback(() => {
    setFormState(initialFormState)
    setGeneratedRecipe(null)
    setActiveTab('input')
  }, [])

  // Generate recipe
  const handleGenerate = useCallback(async () => {
    if (!isProductNameValid) {
      handleError(new Error('Validation: Nama produk harus minimal 3 karakter'), 'AI Recipe Generator: validation', true, 'Nama produk harus minimal 3 karakter')
      return
    }

    if (!isIngredientsValid) {
      handleError(new Error('Validation: Minimal 3 bahan diperlukan untuk generate resep'), 'AI Recipe Generator: validation', true, 'Minimal 3 bahan diperlukan untuk generate resep')
      return
    }

    if (!isServingsValid) {
      handleError(new Error('Validation: Jumlah porsi harus lebih dari 0'), 'AI Recipe Generator: validation', true, 'Jumlah porsi harus lebih dari 0')
      return
    }

    if (formState.targetPrice && !isTargetPriceValid) {
      handleError(new Error('Validation: Target harga harus berupa angka positif'), 'AI Recipe Generator: validation', true, 'Target harga harus berupa angka positif')
      return
    }

    setGeneratedRecipe(null)
    setActiveTab('preview')
    resetProgress()

    const params: GenerateRecipeParams = {
      name: formState.productName,
      type: formState.productType,
      servings: formState.servings,
      targetPrice: formState.targetPrice ? parseFloat(formState.targetPrice) : 0,
      dietaryRestrictions: formState.dietaryRestrictions,
      preferredIngredients: formState.selectedIngredients,
      customIngredients: formState.customIngredients,
      specialInstructions: formState.specialInstructions.trim() || ''
    }
    generateRecipe(params)
  }, [formState, isProductNameValid, isIngredientsValid, isServingsValid, isTargetPriceValid, generateRecipe, resetProgress])

  // Save recipe
  const handleSaveRecipe = useCallback(async () => {
    if (!generatedRecipe) return
    const userId = (authData as { userId?: string })?.userId
    if (!userId) {
      throw new Error('User not authenticated')
    }

    try {

      const recipeData: Insert<'recipes'> = {
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

      const ingredientsData = generatedRecipe.ingredients
        .map((ing) => {
          const ingredient = availableIngredients.find(
            i => i.name.toLowerCase() === ing.name.toLowerCase()
          )

          if (!ingredient) return null

          return {
            ingredient_id: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit,
            notes: ''
          }
        })
        .filter((value): value is { ingredient_id: string; quantity: number; unit: string; notes: string } => value !== null)

      await createRecipeWithIngredients.mutateAsync({
        recipe: recipeData,
        ingredients: ingredientsData
      })

      resetForm()
    } catch (error: unknown) {
      const errorMessage = error as Error

      if (errorMessage.message.includes('authentication')) {
        handleError(errorMessage, 'AI Recipe Generator: save recipe', true, 'Sesi Anda telah habis. Silakan login kembali.')
      } else if (errorMessage.message.includes('database') || errorMessage.message.includes('insert')) {
        handleError(errorMessage, 'AI Recipe Generator: save recipe', true, 'Gagal menyimpan resep ke database. Silakan coba lagi.')
      } else {
        handleError(errorMessage, 'AI Recipe Generator: save recipe', true, 'Terjadi kesalahan saat menyimpan resep.')
      }
    }
  }, [generatedRecipe, availableIngredients, createRecipeWithIngredients, authData, resetForm])

  // Draft management
  const saveDraft = useCallback(() => {
    const draft = {
      ...formState,
      timestamp: new Date().toISOString()
    }

    try {
      localStorage.setItem('recipe-generator-draft', JSON.stringify(draft))
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch {
      // Silently fail for localStorage issues
    }
  }, [formState])

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem('recipe-generator-draft')
      if (saved) {
        const draft = JSON.parse(saved)
        setFormState({
          productName: draft.productName || '',
          productType: draft.productType || 'main-dish',
          servings: draft.servings || 12,
          targetPrice: draft.targetPrice || '',
          dietaryRestrictions: draft.dietaryRestrictions || [],
          selectedIngredients: draft.selectedIngredients || [],
          customIngredients: draft.customIngredients || [],
          specialInstructions: draft.specialInstructions || ''
        })
        setLastSaved(new Date(draft.timestamp))
        return true
      }
    } catch {
      // Silently fail
    }
    return false
  }, [])

  // Auto-save effect
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges && (formState.productName || formState.selectedIngredients.length > 0 || formState.customIngredients.length > 0)) {
        saveDraft()
      }
    }, 5000)

    return () => clearInterval(autoSaveInterval)
  }, [hasUnsavedChanges, formState.productName, formState.selectedIngredients, formState.customIngredients, saveDraft])

  // Track unsaved changes
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (formState.productName || formState.selectedIngredients.length > 0 || formState.customIngredients.length > 0) {
      setTimeout(() => setHasUnsavedChanges(true), 0)
    }
  }, [formState])

  // Load draft on mount
  useEffect(() => {
    const hasDraft = loadDraft()
    if (hasDraft) {
      setTimeout(() => setHasUnsavedChanges(false), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Generate recipe variation
  const handleGenerateVariation = useCallback(async (variationType: VariationType) => {
    if (!generatedRecipe) return null

    const result = await generateVariation(
      generatedRecipe,
      variationType,
      availableIngredients.map(ing => ({
        name: ing.name,
        price_per_unit: ing.price_per_unit
      }))
    )

    return result
  }, [generatedRecipe, generateVariation, availableIngredients])

  // Batch generation
  const handleBatchGenerate = useCallback(async (paramsList: GenerateRecipeParams[]) => {
    return generateBatch(paramsList)
  }, [generateBatch])

  // Restore recipe from history
  const handleRestoreRecipe = useCallback((recipe: GeneratedRecipe) => {
    setGeneratedRecipe(recipe)
    setActiveTab('preview')
  }, [])

  return {
    // Auth state
    isAuthLoading,
    isAuthenticated,

    // Form state
    formState,
    updateFormField,
    resetForm,

    // Validation
    isFormValid,
    isProductNameValid,
    isIngredientsValid,
    isServingsValid,
    isTargetPriceValid,

    // Data
    availableIngredients,
    generatedRecipe,

    // UI state
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    lastSaved,
    uiError,
    setUiError,

    // Actions
    handleGenerate,
    handleSaveRecipe,
    saveDraft,

    // Enhanced features
    handleGenerateVariation,
    handleBatchGenerate,
    handleRestoreRecipe,
    cancelGeneration,

    // Progress tracking
    generationProgress,
    resetProgress,

    // Mutation state
    isGenerating: isGeneratingRecipe,
    isSaving: createRecipeWithIngredients.isPending,
    isWorkerProcessing,

    // Worker utilities
    matchIngredients: worker.matchIngredients,
    calculateCosts: worker.calculateCosts
  }
}

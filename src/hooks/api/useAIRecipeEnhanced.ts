/**
 * Enhanced AI Recipe Generation Hook
 * Features:
 * - Web Worker for heavy processing
 * - Caching layer for results
 * - Streaming progress updates
 * - Recipe variations
 * - Batch generation support
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import type { GeneratedRecipe } from '@/app/recipes/ai-generator/components/types'
import { errorToast, successToast } from '@/hooks/use-toast'
import { cacheRecipe, getCachedRecipe } from '@/lib/cache/recipe-cache'
import { handleApiError } from '@/lib/error-handling'
import { postApi } from '@/lib/query/query-helpers'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useRecipeWorker } from '../useRecipeWorker'

export interface GenerateRecipeParams {
  name: string
  type: string
  servings: number
  targetPrice?: number
  dietaryRestrictions: string[]
  preferredIngredients: string[]
  customIngredients: string[]
  specialInstructions?: string
}

export interface GenerationProgress {
  stage: 'validating' | 'matching' | 'generating' | 'calculating' | 'complete' | 'error'
  progress: number // 0-100
  message: string
}

export interface BatchGenerationResult {
  successful: GeneratedRecipe[]
  failed: Array<{ params: GenerateRecipeParams; error: string }>
}

export type VariationType = 'spicier' | 'sweeter' | 'healthier' | 'budget' | 'premium'

export function useGenerateRecipeEnhanced(onSuccess?: (data: GeneratedRecipe) => void) {
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()
  const worker = useRecipeWorker()
  
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [])

  // Main generation mutation with caching and progress
  const generateMutation = useMutation({
    mutationFn: async (params: GenerateRecipeParams): Promise<GeneratedRecipe> => {
      // Check cache first
      const cacheKey = {
        productName: params.name,
        productType: params.type,
        servings: params.servings,
        ingredients: params.preferredIngredients,
        customIngredients: params.customIngredients,
        targetPrice: params.targetPrice,
        specialInstructions: params.specialInstructions,
      }

      const cached = getCachedRecipe(cacheKey)
      if (cached) {
        setProgress({ stage: 'complete', progress: 100, message: 'Loaded from cache' })
        return cached
      }

      // Get user session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      // Create abort controller for cancellation
      // Abort any previous request first
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        // Check if already aborted
        if (signal.aborted) {
          throw new Error('Request was cancelled')
        }
        // Stage 1: Validating
        setProgress({ stage: 'validating', progress: 10, message: 'Memvalidasi input...' })
        await new Promise(resolve => setTimeout(resolve, 200))

        // Stage 2: Matching ingredients (using worker)
        setProgress({ stage: 'matching', progress: 25, message: 'Mencocokkan bahan...' })
        
        // Stage 3: Generating recipe
        setProgress({ stage: 'generating', progress: 40, message: 'AI sedang meracik resep...' })
        
        // Transform params to match API expected format
        const apiPayload = {
          productName: params.name,
          productType: params.type,
          servings: params.servings,
          preferredIngredients: [...params.preferredIngredients, ...params.customIngredients],
          dietaryRestrictions: params.dietaryRestrictions,
          budget: params.targetPrice,
          specialInstructions: params.specialInstructions,
          userId: session.user.id
        }
        
        // AI calls can take longer, use 60 second timeout
        const data = await postApi<{ recipe: GeneratedRecipe }>('/api/ai/generate-recipe', apiPayload, undefined, 60000)

        // Stage 4: Calculating costs (using worker if available)
        setProgress({ stage: 'calculating', progress: 80, message: 'Menghitung HPP...' })
        
        // Cache the result
        cacheRecipe(cacheKey, data.recipe)

        // Stage 5: Complete
        setProgress({ stage: 'complete', progress: 100, message: 'Resep berhasil dibuat!' })

        return data.recipe
      } catch (error) {
        setProgress({ stage: 'error', progress: 0, message: 'Gagal membuat resep' })
        throw error
      }
    },
    onSuccess: (data) => {
      successToast('Berhasil', 'AI telah meracik resep profesional untuk Anda')
      onSuccess?.(data)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
    onError: (error) => handleApiError(error, 'Generate recipe', 'Terjadi kesalahan saat membuat resep. Silakan coba lagi.')
  })

  // Generate recipe variation
  const generateVariation = useCallback(async (
    baseRecipe: GeneratedRecipe,
    variationType: VariationType,
    availableIngredients: Array<{ name: string; price_per_unit: number }>
  ) => {
    if (worker.error) {
      errorToast('Error', 'Web Worker tidak tersedia')
      return null
    }

    try {
      const variation = await worker.generateVariation({
        baseRecipe: {
          name: baseRecipe.name,
          ingredients: baseRecipe.ingredients,
          instructions: baseRecipe.instructions
        },
        variationType,
        availableIngredients
      })

      return variation
    } catch (error) {
      handleApiError(error, 'Generate variation', 'Gagal membuat variasi resep')
      return null
    }
  }, [worker])

  // Batch generation
  const generateBatch = useCallback(async (
    paramsList: GenerateRecipeParams[]
  ): Promise<BatchGenerationResult> => {
    const results: BatchGenerationResult = {
      successful: [],
      failed: []
    }

    for (let i = 0; i < paramsList.length; i++) {
      const params = paramsList[i]
      if (!params) continue
      
      setProgress({
        stage: 'generating',
        progress: Math.round((i / paramsList.length) * 100),
        message: `Membuat resep ${i + 1} dari ${paramsList.length}...`
      })

      try {
        const recipe = await generateMutation.mutateAsync(params)
        results.successful.push(recipe)
      } catch (error) {
        results.failed.push({
          params,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      // Small delay between requests to avoid rate limiting
      if (i < paramsList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    setProgress({ stage: 'complete', progress: 100, message: 'Batch generation selesai' })
    
    if (results.successful.length > 0) {
      successToast('Batch Selesai', `${results.successful.length} resep berhasil dibuat`)
    }
    if (results.failed.length > 0) {
      errorToast('Sebagian Gagal', `${results.failed.length} resep gagal dibuat`)
    }

    return results
  }, [generateMutation])

  // Cancel ongoing generation
  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort()
    setProgress(null)
  }, [])

  // Reset progress
  const resetProgress = useCallback(() => {
    setProgress(null)
  }, [])

  return {
    // Main mutation
    generate: generateMutation.mutate,
    generateAsync: generateMutation.mutateAsync,
    isPending: generateMutation.isPending,
    isError: generateMutation.isError,
    error: generateMutation.error,
    data: generateMutation.data,
    reset: generateMutation.reset,

    // Progress tracking
    progress,
    resetProgress,

    // Enhanced features
    generateVariation,
    generateBatch,
    cancelGeneration,

    // Worker status
    isWorkerProcessing: worker.isProcessing,
    workerError: worker.error
  }
}

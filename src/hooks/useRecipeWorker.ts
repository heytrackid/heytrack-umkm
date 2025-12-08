/**
 * Hook for using Recipe Generator Web Worker
 * Offloads heavy calculations from main thread
 */
import { useCallback, useEffect, useRef, useState } from 'react'

import type {
    CostCalculationInput,
    CostCalculationResult,
    IngredientMatchInput,
    MatchedIngredient,
    RecipeWorkerInput,
    VariationInput
} from '@/workers/recipe-generator.worker'

interface WorkerResponse<T> {
  success: boolean
  type: string
  data?: T
  error?: string
}

interface UseRecipeWorkerReturn {
  isProcessing: boolean
  error: string | null
  matchIngredients: (input: IngredientMatchInput) => Promise<MatchedIngredient[]>
  calculateCosts: (input: CostCalculationInput) => Promise<CostCalculationResult>
  generateVariation: (input: VariationInput) => Promise<{
    name: string
    description: string
    ingredient_changes: Array<{ original: string; modified: string; reason: string }>
    instruction_changes: string[]
  }>
}

export function useRecipeWorker(): UseRecipeWorkerReturn {
  const workerRef = useRef<Worker | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pendingResolvers = useRef<Map<string, {
    resolve: (value: unknown) => void
    reject: (reason: unknown) => void
  }>>(new Map())
  const setErrorRef = useRef(setError)

  // Update ref when setError changes
  useEffect(() => {
    setErrorRef.current = setError
  }, [])

  // Initialize worker
  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    try {
      workerRef.current = new Worker(
        new URL('../workers/recipe-generator.worker.ts', import.meta.url),
        { type: 'module' }
      )

      workerRef.current.onmessage = (e: MessageEvent<WorkerResponse<unknown>>) => {
        const { success, type, data, error: workerError } = e.data
        const resolver = pendingResolvers.current.get(type)

        if (resolver) {
          if (success) {
            resolver.resolve(data)
          } else {
            resolver.reject(new Error(workerError ?? 'Worker task failed'))
          }
          pendingResolvers.current.delete(type)
        }

        if (mounted) {
          setIsProcessing(pendingResolvers.current.size > 0)
        }
      }

      workerRef.current.onerror = (e) => {
        const errorMessage = e.message
        // Reject all pending tasks
        for (const [, resolver] of pendingResolvers.current) {
          resolver.reject(new Error('Worker error: ' + errorMessage))
        }
        pendingResolvers.current.clear()
        if (mounted) {
          setIsProcessing(false)
          setErrorRef.current(errorMessage)
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Web Worker not supported in this browser'
      if (mounted) {
        setErrorRef.current(errorMsg)
      }
    }

    return () => {
      mounted = false
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const postTask = useCallback(<T>(type: RecipeWorkerInput['type'], payload: unknown): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }

      setIsProcessing(true)
      setError(null)

      pendingResolvers.current.set(type, {
        resolve: resolve as (value: unknown) => void,
        reject
      })

      workerRef.current.postMessage({ type, payload })
    })
  }, [])

  const matchIngredients = useCallback(
    (input: IngredientMatchInput) => postTask<MatchedIngredient[]>('match-ingredients', input),
    [postTask]
  )

  const calculateCosts = useCallback(
    (input: CostCalculationInput) => postTask<CostCalculationResult>('calculate-costs', input),
    [postTask]
  )

  const generateVariation = useCallback(
    (input: VariationInput) => postTask<{
      name: string
      description: string
      ingredient_changes: Array<{ original: string; modified: string; reason: string }>
      instruction_changes: string[]
    }>('generate-variations', input),
    [postTask]
  )

  return {
    isProcessing,
    error,
    matchIngredients,
    calculateCosts,
    generateVariation
  }
}

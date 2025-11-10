'use client'

import { useCallback, useEffect, useRef, useState } from 'react'


/**
 * Hook for using HPP Calculator Web Worker
 * Offloads heavy calculations to prevent UI blocking
 */



interface HppCalculationInput {
  ingredients: Array<{
    quantity: number
    price_per_unit: number
  }>
  operationalCost: number
  batchSize: number
}

interface HppCalculationResult {
  material_cost: number
  operational_cost_per_unit: number
  total_cost: number
  cost_per_unit: number
  breakdown: {
    materials: number
    operational: number
  }
}

export function useHppCalculatorWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize worker
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../workers/hpp-calculator.worker.ts', import.meta.url)
      )
    }

    return () => {
      // Cleanup worker
      workerRef.current?.terminate()
    }
  }, [])

  const calculate = useCallback(
    (input: HppCalculationInput): Promise<HppCalculationResult> => new Promise((resolve, reject) => {
        if (!workerRef.current) {
          // Fallback to synchronous calculation if worker not available
          const materialCost = input.ingredients.reduce(
            (sum, ing) => sum + ing.quantity * ing.price_per_unit,
            0
          )
          const operationalCostPerUnit =
            input.batchSize > 0 ? input.operationalCost / input.batchSize : 0
          const totalCost = materialCost + input.operationalCost
          const costPerUnit =
            input.batchSize > 0 ? totalCost / input.batchSize : totalCost

          resolve({
            material_cost: materialCost,
            operational_cost_per_unit: operationalCostPerUnit,
            total_cost: totalCost,
            cost_per_unit: costPerUnit,
            breakdown: {
              materials: materialCost,
              operational: input.operationalCost
            }
          })
          return
        }

        setIsCalculating(true)
        setError(null)

        const handleMessage = (e: MessageEvent) => {
          setIsCalculating(false)
          if (e['data'].success) {
            resolve(e['data']['data'])
          } else {
            const errorMsg = e['data'].error ?? 'Calculation failed'
            setError(errorMsg)
            reject(new Error(errorMsg))
          }
          workerRef.current?.removeEventListener('message', handleMessage)
        }

        workerRef.current.addEventListener('message', handleMessage)
        workerRef.current.postMessage(input)
      }),
    []
  )

  return {
    calculate,
    isCalculating,
    error
  }
}

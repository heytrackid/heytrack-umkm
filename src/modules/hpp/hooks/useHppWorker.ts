'use client'

import { useEffect, useRef, useState } from 'react'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('ClientFile')
import type { HppCalculationResult, MaterialBreakdown } from '@/modules/hpp/types/index'




// Input data for worker calculation
interface HppCalculationData {
  ingredients: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    unit_price: number
  }>
  operationalCosts?: Array<{
    id: string
    name: string
    amount: number
    category: string
  }>
  batchSize?: number
}

// Extended result with additional breakdown fields
interface HppWorkerResult extends Omit<HppCalculationResult, 'materialBreakdown'> {
  total_hpp: number
  cost_per_unit: number
  ingredient_cost: number
  operational_cost: number
  batch_size: number
  ingredient_breakdown: MaterialBreakdown[]
  operational_breakdown: Array<{
    cost_id: string
    cost_name: string
    amount: number
    category: string
  }>
  calculated_at: string
}

export function useHppWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker === 'undefined') {
      logger.warn({}, 'Web Workers not supported in this browser')
      return undefined
    }

    try {
      // Initialize worker
      workerRef.current = new Worker('/workers/hpp-calculator.worker.js')

      workerRef.current.onmessage = (e) => {
        const { type } = e['data']

        if (type === 'READY') {
          setIsReady(true)
          logger.info('HPP Worker initialized successfully')
        }
      }

      workerRef.current.onerror = (error) => {
        logger.error({ error }, 'HPP Worker error')
        setIsReady(false)
      }

      return () => {
        workerRef.current?.terminate()
      }
    } catch (error) {
      logger.error({ error }, 'Failed to initialize HPP Worker')
      return undefined
    }
  }, [])

  const calculateHPP = (data: HppCalculationData): Promise<HppWorkerResult> => new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      setIsCalculating(true)

      const handleMessage = (e: MessageEvent) => {
        const { type, data: result, error } = e['data']

        if (type === 'CALCULATE_HPP_SUCCESS') {
          setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'ERROR') {
          setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          reject(new Error(error))
        }
      }

      workerRef.current.addEventListener('message', handleMessage)
      workerRef.current.postMessage({
        type: 'CALCULATE_HPP',
        data
      })
    })

  const calculateBatchHPP = (recipes: Array<{ id: string; name: string }>): Promise<HppWorkerResult[]> => new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      setIsCalculating(true)

      const handleMessage = (e: MessageEvent) => {
        const { type, data: result, error } = e['data']

        if (type === 'CALCULATE_BATCH_HPP_SUCCESS') {
          setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'ERROR') {
          setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          reject(new Error(error))
        }
      }

      workerRef.current.addEventListener('message', handleMessage)
      workerRef.current.postMessage({
        type: 'CALCULATE_BATCH_HPP',
        data: { recipes }
      })
    })

  const calculateWAC = (purchases: Array<{ ingredient_id: string; quantity: number; unit_price: number; total_value: number }>): Promise<{ wac: number; total_quantity: number; total_value: number }> => new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      setIsCalculating(true)

      const handleMessage = (e: MessageEvent) => {
        const { type, data: result, error } = e['data']

        if (type === 'CALCULATE_WAC_SUCCESS') {
          setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'ERROR') {
          setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          reject(new Error(error))
        }
      }

      workerRef.current.addEventListener('message', handleMessage)
      workerRef.current.postMessage({
        type: 'CALCULATE_WAC',
        data: { purchases }
      })
    })

  return {
    isReady,
    isCalculating,
    calculateHPP,
    calculateBatchHPP,
    calculateWAC
  }
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { apiLogger } from '@/lib/logger'

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

interface HppCalculationResult {
  total_hpp: number
  cost_per_unit: number
  ingredient_cost: number
  operational_cost: number
  batch_size: number
  ingredient_breakdown: any[]
  operational_breakdown: any[]
  calculated_at: string
}

export function useHppWorker() {
  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    // Check if Web Workers are supported
    if (typeof Worker === 'undefined') {
      apiLogger.warn('Web Workers not supported in this browser')
      return
    }

    try {
      // Initialize worker
      workerRef.current = new Worker('/workers/hpp-calculator.worker.js')

      workerRef.current.onmessage = (e) => {
        const { type } = e.data

        if (type === 'READY') {
          void setIsReady(true)
          apiLogger.info('HPP Worker initialized successfully')
        }
      }

      workerRef.current.onerror = (error) => {
        apiLogger.error({ err: error }, 'HPP Worker error')
        void setIsReady(false)
      }

      return () => {
        workerRef.current?.terminate()
      }
    } catch (err) {
      apiLogger.error({ error: err }, 'Failed to initialize HPP Worker')
    }
  }, [])

  const calculateHPP = (data: HppCalculationData): Promise<HppCalculationResult> => new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      void setIsCalculating(true)

      const handleMessage = (e: MessageEvent) => {
        const { type, data: result, error } = e.data

        if (type === 'CALCULATE_HPP_SUCCESS') {
          void setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'ERROR') {
          void setIsCalculating(false)
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

  const calculateBatchHPP = (recipes: any[]): Promise<any[]> => new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      void setIsCalculating(true)

      const handleMessage = (e: MessageEvent) => {
        const { type, data: result, error } = e.data

        if (type === 'CALCULATE_BATCH_HPP_SUCCESS') {
          void setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'ERROR') {
          void setIsCalculating(false)
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

  const calculateWAC = (purchases: any[]): Promise<any> => new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not ready'))
        return
      }

      void setIsCalculating(true)

      const handleMessage = (e: MessageEvent) => {
        const { type, data: result, error } = e.data

        if (type === 'CALCULATE_WAC_SUCCESS') {
          void setIsCalculating(false)
          workerRef.current?.removeEventListener('message', handleMessage)
          resolve(result)
        } else if (type === 'ERROR') {
          void setIsCalculating(false)
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

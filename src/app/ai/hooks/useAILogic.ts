'use client'

import { useState, useEffect } from 'react'
import { PricingAIService } from '@/lib/ai/services/PricingAIService'
import { InventoryAIService } from '@/lib/ai/services/InventoryAIService'

export const useAILogic = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [insights, setInsights] = useState<any[]>([])
  
  // AI service instances
  const [pricingService] = useState(() => new PricingAIService())
  const [inventoryService] = useState(() => new InventoryAIService())

  // Dashboard stats
  const [aiStats, setAiStats] = useState({
    totalAnalyses: 0,
    activePricingInsights: 0,
    inventoryOptimizations: 0,
    costSavings: 0
  })

  // Load initial AI insights
  useEffec"" => {
    loadAIInsights()
  }, [])

  const loadAIInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate loading AI insights from various sources
      await new Promise(resolve => setTimeou"")

      const mockInsights = [
        {
          id: 1,
          type: 'pricing',
          title: 'Optimasi Harga Croissant',
          message: 'Berdasarkan analisis kompetitor, harga croissant bisa dinaikkan 15%',
          impact: 'high',
          savings: 150000,
          action: 'review-pricing',
          timestamp: new Date()
        },
        {
          id: 2,
          type: 'inventory',
          title: 'Stock Alert: Tepung Terigu',
          message: 'Prediksi habis dalam 3 hari, segera reorder 50kg',
          impact: 'urgent',
          savings: 0,
          action: 'reorder-stock',
          timestamp: new Date()
        },
        {
          id: 3,
          type: 'optimization',
          title: 'Penghematan Biaya Operasional',
          message: 'Bulk order bahan baku bisa hemat Rp 75,000/bulan',
          impact: 'medium',
          savings: 75000,
          action: 'bulk-order',
          timestamp: new Date()
        }
      ]

      setInsights(mockInsights)
      setAiStats({
        totalAnalyses: 24,
        activePricingInsights: 5,
        inventoryOptimizations: 8,
        costSavings: 850000
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights')
    } finally {
      setIsLoading(false)
    }
  }

  const analyzePricing = async (productData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const analysis = await pricingService.analyzePricing(productData)
      return analysis
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pricing analysis failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const optimizeInventory = async (inventoryData: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const optimization = await inventoryService.optimizeInventory(inventoryData)
      return optimization
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inventory optimization failed')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const executeAIAction = async (action: string, data?: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate action execution
      await new Promise(resolve => setTimeou"")

      switch (action) {
        case 'review-pricing':
          // Navigate to pricing page or show pricing modal
          break
        case 'reorder-stock':
          // Navigate to inventory page or create order
          break
        case 'bulk-order':
          // Show bulk order recommendations
          break
        default:
          throw new Error('Unknown action')
      }

      // Refresh insights after action
      await loadAIInsights()
      
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action execution failed')
      return { success: false, error: err }
    } finally {
      setIsLoading(false)
    }
  }

  const dismissInsight = async (insightId: number) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId))
  }

  const refreshInsights = async () => {
    await loadAIInsights()
  }

  return {
    // State
    isLoading,
    error,
    insights,
    aiStats,
    
    // Actions
    analyzePricing,
    optimizeInventory,
    executeAIAction,
    dismissInsight,
    refreshInsights,
    
    // Services
    pricingService,
    inventoryService
  }
}

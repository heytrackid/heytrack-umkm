'use client'

import { useMemo, useCallback } from 'react'
import { useRecipes } from '@/hooks'
import { useHPPSnapshots } from '@/hooks/api/useHPPSnapshots'
import type { Database } from '@/types'

type Recipe = Database['public']['Tables']['recipes']['Row']

export interface HPPAnalysis {
  recipe_id: string
  recipe_name: string
  current_hpp?: number
  previous_hpp?: number
  hpp_change: number
  hpp_change_percentage: number
  material_cost?: number
  labor_cost: number
  overhead_cost?: number
  margin_percentage: number
  selling_price: number
  profitability_status: 'profitable' | 'break_even' | 'loss' | 'no_data'
  alerts: HPPAlert[]
  hasData: boolean
}

export interface HPPAlert {
  id: string
  type: 'cost_increase' | 'margin_decline' | 'unprofitable' | 'high_overhead' | 'no_data'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  impact: number
  recommendation: string
  created_at: string
}

export interface HPPAutomationResult {
  analyses: HPPAnalysis[]
  total_alerts: number
  critical_alerts: number
  profitability_score: number
  recommendations: string[]
  recipes_with_data: number
  recipes_without_data: number
}

/**
 * Hook for automated HPP analysis and alerts
 */
export function useHPPAutomation() {
  const { data: recipes, loading: recipesLoading } = useRecipes()

  // Get HPP snapshots for all recipes (we'll need to call this for each recipe)
  // For now, let's create a simplified version that works with available data

  const hppAnalysis = useMemo((): HPPAutomationResult => {
    if (!recipes || recipesLoading) {
      return {
        analyses: [],
        total_alerts: 0,
        critical_alerts: 0,
        profitability_score: 0,
        recommendations: [],
        recipes_with_data: 0,
        recipes_without_data: 0
      }
    }

    const analyses: HPPAnalysis[] = []
    const allAlerts: HPPAlert[] = []
    const recommendations: string[] = []

    recipes.forEach((recipe: Recipe) => {
      const sellingPrice = recipe.selling_price || 0
      const productionCost = recipe.cost_per_unit || 0
      const marginPercentage = sellingPrice > 0 ? ((sellingPrice - productionCost) / sellingPrice) * 100 : 0

      let profitabilityStatus: 'profitable' | 'break_even' | 'loss' | 'no_data' = 'no_data'
      let hasData = false

      if (sellingPrice > 0 && productionCost > 0) {
        hasData = true
        profitabilityStatus = marginPercentage > 5 ? 'profitable' :
                           marginPercentage >= 0 ? 'break_even' : 'loss'
      }

      // Generate alerts based on available data
      const alerts: HPPAlert[] = []

      // No data alert
      if (!hasData) {
        alerts.push({
          id: `no_data_${recipe.id}`,
          type: 'no_data',
          severity: 'medium',
          message: `Belum ada data HPP untuk resep ${recipe.name}`,
          impact: 0,
          recommendation: 'Lakukan kalkulasi HPP pertama untuk resep ini',
          created_at: new Date().toISOString()
        })
      }

      // Margin alerts
      if (hasData) {
        if (marginPercentage < 10 && marginPercentage >= 0) {
          alerts.push({
            id: `low_margin_${recipe.id}`,
            type: 'margin_decline',
            severity: marginPercentage < 5 ? 'high' : 'medium',
            message: `Margin keuntungan rendah: ${marginPercentage.toFixed(1)}%`,
            impact: marginPercentage,
            recommendation: 'Pertimbangkan penyesuaian harga jual',
            created_at: new Date().toISOString()
          })
        }

        if (profitabilityStatus === 'loss') {
          alerts.push({
            id: `loss_${recipe.id}`,
            type: 'unprofitable',
            severity: 'critical',
            message: `Resep ${recipe.name} mengalami kerugian`,
            impact: productionCost - sellingPrice,
            recommendation: 'Evaluasi harga jual atau efisiensi biaya',
            created_at: new Date().toISOString()
          })
        }
      }

      allAlerts.push(...alerts)

      analyses.push({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        current_hpp: productionCost,
        previous_hpp: undefined, // Would need historical data
        hpp_change: 0, // Would need historical data
        hpp_change_percentage: 0, // Would need historical data
        material_cost: undefined, // Would need detailed breakdown
        labor_cost: 0, // Would need labor cost tracking
        overhead_cost: undefined, // Would need overhead allocation
        margin_percentage: marginPercentage,
        selling_price: sellingPrice,
        profitability_status: profitabilityStatus,
        alerts,
        hasData
      })
    })

    // Generate recommendations
    const noDataCount = allAlerts.filter(alert => alert.type === 'no_data').length
    const lossCount = allAlerts.filter(alert => alert.type === 'unprofitable').length
    const lowMarginCount = allAlerts.filter(alert => alert.type === 'margin_decline').length

    if (noDataCount > 0) {
      recommendations.push(`${noDataCount} resep belum memiliki data HPP - lakukan kalkulasi HPP`)
    }
    if (lossCount > 0) {
      recommendations.push(`${lossCount} resep mengalami kerugian - evaluasi harga dan biaya`)
    }
    if (lowMarginCount > 0) {
      recommendations.push(`${lowMarginCount} resep memiliki margin rendah - optimalkan harga jual`)
    }
    if (recommendations.length === 0) {
      recommendations.push('Semua resep dalam kondisi baik - pertahankan performa')
    }

    // Calculate metrics
    const totalAlerts = allAlerts.length
    const criticalAlerts = allAlerts.filter(alert => alert.severity === 'critical').length
    const profitableRecipes = analyses.filter(a => a.profitability_status === 'profitable').length
    const recipesWithData = analyses.filter(a => a.hasData).length
    const recipesWithoutData = analyses.length - recipesWithData
    const profitabilityScore = recipesWithData > 0 ? (profitableRecipes / recipesWithData) * 100 : 0

    return {
      analyses,
      total_alerts: totalAlerts,
      critical_alerts: criticalAlerts,
      profitability_score: profitabilityScore,
      recommendations,
      recipes_with_data: recipesWithData,
      recipes_without_data: recipesWithoutData
    }
  }, [recipes, recipesLoading])

  const getRecipeAnalysis = useCallback((recipeId: string) => {
    return hppAnalysis.analyses.find(analysis => analysis.recipe_id === recipeId)
  }, [hppAnalysis.analyses])

  const getAlertsBySeverity = useCallback((severity: HPPAlert['severity']) => {
    return hppAnalysis.analyses.flatMap(analysis => analysis.alerts).filter(alert => alert.severity === severity)
  }, [hppAnalysis.analyses])

  return {
    hppAnalysis,
    getRecipeAnalysis,
    getAlertsBySeverity,
    loading: recipesLoading,
    refetch: () => window.location.reload() // Simple refetch for now
  }
}

/**
 * Hook for individual recipe HPP analysis with detailed snapshots
 */
export function useRecipeHPPAnalysis(recipeId: string) {
  const { data: snapshotData, isLoading } = useHPPSnapshots({
    recipeId,
    period: '90d',
    enabled: !!recipeId
  })

  const analysis = useMemo(() => {
    if (!snapshotData?.data || snapshotData.data.length === 0) {
      return null
    }

    const snapshots = snapshotData.data
    snapshots.sort((a, b) => new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime())

    const current = snapshots[0]
    const previous = snapshots[1]

    const hppChange = previous ? current.hpp_value - previous.hpp_value : 0
    const hppChangePercentage = previous ? (hppChange / previous.hpp_value) * 100 : 0

    return {
      current_snapshot: current,
      previous_snapshot: previous,
      hpp_change: hppChange,
      hpp_change_percentage: hppChangePercentage,
      trend: hppChangePercentage > 5 ? 'increasing' :
             hppChangePercentage < -5 ? 'decreasing' : 'stable',
      total_snapshots: snapshots.length
    }
  }, [snapshotData])

  return {
    analysis,
    loading: isLoading
  }
}

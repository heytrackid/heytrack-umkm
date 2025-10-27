'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'

interface Recipe {
  id: string
  name: string
  category: string
  selling_price: number | null
  margin_percentage: number | null
  ingredients: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    unit_price: number
  }>
  operational_costs: number
  total_cost: number
}

interface HppCalculation {
  id: string
  recipe_id: string
  cost_per_unit: number
  total_hpp: number
  ingredient_cost: number
  operational_cost: number
  calculated_at: string
}

export function useUnifiedHpp() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')

  // Fetch all recipes
  const { data: recipesData, isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes-list'],
    queryFn: async () => {
      const response = await fetch('/api/recipes?limit=100')
      if (!response.ok) {throw new Error('Failed to fetch recipes')}
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch HPP overview
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['hpp-overview'],
    queryFn: async () => {
      const response = await fetch('/api/hpp/overview')
      if (!response.ok) {throw new Error('Failed to fetch overview')}
      return response.json()
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  })

  // Fetch selected recipe details
  const { data: recipeData, isLoading: recipeLoading } = useQuery({
    queryKey: ['recipe-detail', selectedRecipeId],
    queryFn: async () => {
      if (!selectedRecipeId) {return null}
      
      const response = await fetch(`/api/recipes/${selectedRecipeId}`)
      if (!response.ok) {throw new Error('Failed to fetch recipe')}
      const data = await response.json()
      
      // Calculate total cost from ingredients
      let ingredientCost = 0
      if (data.recipe_ingredients) {
        ingredientCost = data.recipe_ingredients.reduce((sum: number, ri: any) => {
          const quantity = ri.quantity || 0
          // Use WAC if available, otherwise use current price
          const unitPrice = ri.ingredients?.weighted_average_cost || ri.ingredients?.price_per_unit || 0
          return sum + (quantity * unitPrice)
        }, 0)
      }
      
      // Get operational costs (15% of material cost or minimum 2500)
      const operationalCost = Math.max(ingredientCost * 0.15, 2500)
      
      return {
        id: data.id,
        name: data.name,
        category: data.category,
        selling_price: data.selling_price,
        margin_percentage: data.margin_percentage,
        ingredients: data.recipe_ingredients?.map((ri: any) => ({
          id: ri.ingredient_id,
          name: ri.ingredients?.name || 'Unknown',
          quantity: ri.quantity || 0,
          unit: ri.unit || 'unit',
          unit_price: ri.ingredients?.weighted_average_cost || ri.ingredients?.price_per_unit || 0
        })) || [],
        operational_costs: operationalCost,
        total_cost: ingredientCost + operationalCost
      }
    },
    enabled: !!selectedRecipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch comparison data
  const { data: comparisonData } = useQuery({
    queryKey: ['hpp-comparison'],
    queryFn: async () => {
      const response = await fetch('/api/hpp/comparison')
      if (!response.ok) {throw new Error('Failed to fetch comparison')}
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Fetch alerts
  const { data: alertsData } = useQuery({
    queryKey: ['hpp-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/hpp/alerts?limit=5&is_read=false')
      if (!response.ok) {throw new Error('Failed to fetch alerts')}
      return response.json()
    },
    staleTime: 30 * 1000, // 30 seconds (alerts should be fresher)
    refetchOnWindowFocus: false
  })

  // Calculate HPP
  const calculateHpp = useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await fetch('/api/hpp/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId })
      })
      
      if (!response.ok) {throw new Error('Failed to calculate HPP')}
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-detail'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-comparison'] })
      
      toast({
        title: 'Berhasil ✓',
        description: 'Biaya produksi berhasil dihitung'
      })
    },
    onError: (error) => {
      apiLogger.error({ err: error }, 'Failed to calculate HPP')
      toast({
        title: 'Error',
        description: 'Gagal menghitung biaya produksi',
        variant: 'destructive'
      })
    }
  })

  // Update recipe price
  const updatePrice = useMutation({
    mutationFn: async ({ recipeId, price, margin }: { recipeId: string; price: number; margin: number }) => {
      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selling_price: price,
          margin_percentage: margin
        })
      })
      
      if (!response.ok) {throw new Error('Failed to update price')}
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe-detail'] })
      queryClient.invalidateQueries({ queryKey: ['recipes-list'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-comparison'] })
      
      toast({
        title: 'Tersimpan ✓',
        description: 'Harga jual berhasil disimpan'
      })
    },
    onError: (error) => {
      apiLogger.error({ err: error }, 'Failed to update price')
      toast({
        title: 'Error',
        description: 'Gagal menyimpan harga jual',
        variant: 'destructive'
      })
    }
  })

  // Mark alert as read
  const markAlertAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
        method: 'PATCH'
      })
      if (!response.ok) {throw new Error('Failed to mark alert as read')}
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
      queryClient.invalidateQueries({ queryKey: ['hpp-overview'] })
    }
  })

  return {
    // Data
    recipes: recipesData?.recipes || [],
    overview: overviewData,
    recipe: recipeData,
    comparison: comparisonData?.recipes || [],
    alerts: alertsData?.alerts || [],
    
    // Loading states
    isLoading: recipesLoading || overviewLoading,
    recipeLoading,
    
    // Actions
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,
    updatePrice,
    markAlertAsRead
  }
}

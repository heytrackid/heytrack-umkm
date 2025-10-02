'use client'

import { useState, useEffect } from 'react'
import { useHPPCalculations, useRecipes } from '@/hooks/useDatabase'
import { useCurrency } from '@/hooks/useCurrency'

export const useHPPLogic = () => {
  const { recipes, loading, calculateHPP } = useHPPCalculations()
  const { update: updateRecipe } = useRecipes()
  const { formatCurrency } = useCurrency()
  
  // Pricing states
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('placeholder')
  const [targetMargin, setTargetMargin] = useState(40)
  const [productCost, setProductCost] = useState(0)
  const [recommendedPrice, setRecommendedPrice] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId && selectedRecipeId !== 'placeholder')

  // Update product cost when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      setProductCost(selectedRecipe.production_cost || 0)
      setTargetMargin(selectedRecipe.margin || 40)
    }
  }, [selectedRecipe])

  // Calculate recommended price
  useEffect(() => {
    if (productCost > 0) {
      const price = productCost / (1 - targetMargin / 100)
      setRecommendedPrice(Math.round(price))
    }
  }, [productCost, targetMargin])

  const handleUpdateRecipePrice = async () => {
    if (!selectedRecipeId || recommendedPrice <= 0) return
    
    try {
      setIsUpdating(true)
      await updateRecipe(selectedRecipeId, {
        selling_price: recommendedPrice,
        margin_percentage: targetMargin,
        updated_at: new Date().toISOString(),
      })
      
      // Show success (you can add toast notification here)
      alert('Recipe updated successfully!')
    } catch (error: any) {
      console.error('Error updating recipe:', error)
      alert('Failed to update recipe')
    } finally {
      setIsUpdating(false)
    }
  }

  const marginCategories = [
    { range: '20-30%', label: 'Margin Minimum', color: 'destructive', desc: 'Hanya untuk cover biaya' },
    { range: '30-50%', label: 'Margin Sehat', color: 'secondary', desc: 'Standard industri' },
    { range: '50-70%', label: 'Margin Optimal', color: 'default', desc: 'Keuntungan maksimal' },
    { range: '>70%', label: 'Margin Premium', color: 'default', desc: 'Produk eksklusif' },
  ]

  // Calculate summary stats
  const summaryStats = {
    totalRecipes: recipes.length,
    highMarginRecipes: recipes.filter(r => r.margin > 30).length,
    mediumMarginRecipes: recipes.filter(r => r.margin >= 15 && r.margin <= 30).length,
    lowMarginRecipes: recipes.filter(r => r.margin < 15).length,
  }

  return {
    // Core data
    recipes,
    loading,
    selectedRecipe,
    summaryStats,
    
    // Pricing states
    selectedRecipeId,
    setSelectedRecipeId,
    targetMargin,
    setTargetMargin,
    productCost,
    setProductCost,
    recommendedPrice,
    isUpdating,
    
    // Constants
    marginCategories,
    
    // Functions
    handleUpdateRecipePrice,
    formatCurrency,
    
    // Helper functions
    getMarginBadgeVariant: (margin: number) => 
      margin > 30 ? 'default' : margin > 15 ? 'secondary' : 'destructive',
    
    getMarginStatus: (margin: number) => 
      margin > 30 ? 'Sangat Baik' : margin > 15 ? 'Cukup Baik' : 'Perlu Review'
  }
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { enhancedAutomationEngine } from '@/lib/enhanced-automation-engine'
import { uiLogger } from '@/lib/logger'
import { AlertTriangle, Calculator, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'

// Extracted components
import { AnalysisInsights } from './AnalysisInsights'
import { CostBreakdownCard } from './CostBreakdownCard'
import { PricingAnalysisCard } from './PricingAnalysisCard'
import { PricingSuggestionsComponent } from './PricingSuggestions'
import { StockAvailability } from './StockAvailability'

interface HPPResult {
  hpp_breakdown: {
    ingredient_cost: number
    overhead_cost: number
    labor_cost: number
    packaging_cost: number
    total_cost: number
    cost_per_serving: number
  }
  pricing_analysis: {
    current_price: number
    current_margin: number
    break_even_price: number
    competitor_price_range: { min: number, max: number }
  }
  pricing_suggestions: {
    economy: { price: number, margin: number, rationale: string }
    standard: { price: number, margin: number, rationale: string }
    premium: { price: number, margin: number, rationale: string }
  }
  availability: {
    can_produce: boolean
    production_capacity: number
    limiting_ingredients: string[]
    stock_warnings: string[]
  }
  margin_analysis: {
    is_profitable: boolean
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
    current_margin: number
    recommended_margin: number
  }
}

interface AdvancedHPPCalculatorProps {
  recipeId: string
  recipeName: string
  onPriceUpdate?: (price: number) => void
}

export default function AdvancedHPPCalculator({
  recipeId,
  recipeName,
  onPriceUpdate
}: AdvancedHPPCalculatorProps) {
  const [hppResult, setHppResult] = useState<HPPResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPricing, setSelectedPricing] = useState<'economy' | 'standard' | 'premium'>('standard')
  const [customPrice, setCustomPrice] = useState('')

  useEffect(() => {
    if (recipeId) {
      calculateAdvancedHPP()
    }
  }, [recipeId])

  const calculateAdvancedHPP = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await enhancedAutomationEngine.calculateAdvancedHPP(recipeId)
      setHppResult
      setCustomPrice(result.pricing_analysis.current_price.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate HPP')
      uiLogger.error({ err }, 'HPP calculation error')
    } finally {
      setLoading(false)
    }
  }

  const applyPricingSuggestion = (pricingTier: 'economy' | 'standard' | 'premium') => {
    if (!hppResult) {return}

    const suggestion = hppResult.pricing_suggestions[pricingTier]
    setCustomPrice(suggestion.price.toString())
    setSelectedPricing(pricingTier)

    if (onPriceUpdate) {
      onPriceUpdate(suggestion.price)
    }
  }

  const handleCustomPriceChange = (value: string) => {
    setCustomPrice(value)
    const price = parseFloat
    if (!isNaN(price) && onPriceUpdate) {
      onPriceUpdate(price)
    }
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 50) {return 'text-gray-600 dark:text-gray-400'}
    if (margin >= 30) {return 'text-gray-600 dark:text-gray-400'}
    return 'text-gray-600 dark:text-gray-400'
  }

  const getRiskLevelColor = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW': return 'text-gray-600 dark:text-gray-400'
      case 'MEDIUM': return 'text-gray-600 dark:text-gray-400'
      case 'HIGH': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Advanced HPP Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Calculating HPP...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Advanced HPP Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Calculation Error</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={calculateAdvancedHPP} size="sm">
                Retry Calculation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hppResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Advanced HPP Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium">Ready to Calculate</p>
            <p className="text-sm text-muted-foreground mb-4">
              Select a recipe to calculate advanced HPP
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Advanced HPP: {recipeName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={hppResult.margin_analysis.is_profitable ? 'default' : 'destructive'}>
              {hppResult.margin_analysis.is_profitable ? 'Profitable' : 'Unprofitable'}
            </Badge>
            <Button variant="outline" size="sm" onClick={calculateAdvancedHPP}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalculate
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="availability">Stock</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Cost Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CostBreakdownCard hppBreakdown={hppResult.hpp_breakdown} />
              <PricingAnalysisCard
                pricingAnalysis={hppResult.pricing_analysis}
                marginAnalysis={hppResult.margin_analysis}
                getMarginColor={getMarginColor}
                getRiskLevelColor={getRiskLevelColor}
              />
            </div>
          </TabsContent>

          {/* Pricing Suggestions Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <PricingSuggestionsComponent
              pricingSuggestions={hppResult.pricing_suggestions}
              selectedPricing={selectedPricing}
              customPrice={customPrice}
              costPerServing={hppResult.hpp_breakdown.cost_per_serving}
              onSelectPricing={applyPricingSuggestion}
              onCustomPriceChange={handleCustomPriceChange}
              getMarginColor={getMarginColor}
            />
          </TabsContent>

          {/* Stock Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <StockAvailability availability={hppResult.availability} />
          </TabsContent>

          {/* Analysis & Insights Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <AnalysisInsights
              marginAnalysis={hppResult.margin_analysis}
              pricingAnalysis={hppResult.pricing_analysis}
              hppBreakdown={hppResult.hpp_breakdown}
              pricingSuggestions={hppResult.pricing_suggestions}
              availability={hppResult.availability}
              getMarginColor={getMarginColor}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
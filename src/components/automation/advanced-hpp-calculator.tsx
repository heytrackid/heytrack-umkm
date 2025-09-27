'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Package,
  BarChart3,
  Lightbulb,
  Target,
  RefreshCw,
  Info
} from 'lucide-react'
import { enhancedAutomationEngine } from '@/lib/enhanced-automation-engine'

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

function AdvancedHPPCalculator({
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
      setHppResult(result)
      setCustomPrice(result.pricing_analysis.current_price.toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate HPP')
      console.error('HPP calculation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const applyPricingSuggestion = (pricingTier: 'economy' | 'standard' | 'premium') => {
    if (!hppResult) return
    
    const suggestion = hppResult.pricing_suggestions[pricingTier]
    setCustomPrice(suggestion.price.toString())
    setSelectedPricing(pricingTier)
    
    if (onPriceUpdate) {
      onPriceUpdate(suggestion.price)
    }
  }

  const handleCustomPriceChange = (value: string) => {
    setCustomPrice(value)
    const price = parseFloat(value)
    if (!isNaN(price) && onPriceUpdate) {
      onPriceUpdate(price)
    }
  }

  const getMarginColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600'
    if (margin >= 30) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskLevelColor = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW': return 'text-green-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'HIGH': return 'text-red-600'
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
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium">Calculation Error</p>
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
              {/* Cost Breakdown */}
              <Card className="p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3">
                  <DollarSign className="h-4 w-4" />
                  Cost Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ingredient Cost:</span>
                    <span className="font-mono">Rp {hppResult.hpp_breakdown.ingredient_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overhead (15%):</span>
                    <span className="font-mono">Rp {hppResult.hpp_breakdown.overhead_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor Cost (20%):</span>
                    <span className="font-mono">Rp {hppResult.hpp_breakdown.labor_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging (5%):</span>
                    <span className="font-mono">Rp {hppResult.hpp_breakdown.packaging_cost.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span className="font-mono">Rp {hppResult.hpp_breakdown.total_cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-blue-600">
                    <span>Cost per Serving:</span>
                    <span className="font-mono">Rp {hppResult.hpp_breakdown.cost_per_serving.toLocaleString()}</span>
                  </div>
                </div>
              </Card>

              {/* Current Pricing Analysis */}
              <Card className="p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3">
                  <BarChart3 className="h-4 w-4" />
                  Current Pricing
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span className="font-mono">Rp {hppResult.pricing_analysis.current_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Margin:</span>
                    <span className={`font-mono ${getMarginColor(hppResult.pricing_analysis.current_margin)}`}>
                      {hppResult.pricing_analysis.current_margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Break-even Price:</span>
                    <span className="font-mono">Rp {hppResult.pricing_analysis.break_even_price.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Competitor Range:</span>
                      <span>Rp {hppResult.pricing_analysis.competitor_price_range.min.toLocaleString()} - {hppResult.pricing_analysis.competitor_price_range.max.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="mt-4 p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 ${getRiskLevelColor(hppResult.margin_analysis.risk_level)}`} />
                    <span className="font-medium text-sm">
                      Risk Level: {hppResult.margin_analysis.risk_level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {hppResult.margin_analysis.is_profitable 
                      ? 'Recipe is profitable with current pricing'
                      : 'Recipe needs price adjustment to be profitable'
                    }
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Suggestions Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['economy', 'standard', 'premium'] as const).map((tier) => {
                  const suggestion = hppResult.pricing_suggestions[tier]
                  return (
                    <Card 
                      key={tier}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedPricing === tier ? 'ring-2 ring-primary bg-muted' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => applyPricingSuggestion(tier)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{tier}</h4>
                        <Badge variant={tier === 'premium' ? 'default' : 'outline'}>
                          {suggestion.margin}% margin
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold mb-2">
                        Rp {suggestion.price.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {suggestion.rationale}
                      </p>
                      <Button 
                        variant={selectedPricing === tier ? 'default' : 'outline'} 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation()
                          applyPricingSuggestion(tier)
                        }}
                      >
                        {selectedPricing === tier ? 'Selected' : 'Apply Price'}
                      </Button>
                    </Card>
                  )
                })}
              </div>

              {/* Custom Pricing */}
              <Card className="p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3">
                  <Target className="h-4 w-4" />
                  Custom Pricing
                </h4>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor="customPrice" className="text-sm">Custom Price</Label>
                    <Input
                      id="customPrice"
                      type="number"
                      placeholder="Enter custom price"
                      value={customPrice}
                      onChange={(e) => handleCustomPriceChange(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Calculated Margin</Label>
                    <div className="p-2 border rounded-md bg-muted mt-1">
                      {customPrice && !isNaN(parseFloat(customPrice)) ? (
                        <span className={`font-mono ${getMarginColor(
                          ((parseFloat(customPrice) - hppResult.hpp_breakdown.cost_per_serving) / parseFloat(customPrice)) * 100
                        )}`}>
                          {(((parseFloat(customPrice) - hppResult.hpp_breakdown.cost_per_serving) / parseFloat(customPrice)) * 100).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Stock Availability Tab */}
          <TabsContent value="availability" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Production Capacity */}
              <Card className="p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3">
                  <Package className="h-4 w-4" />
                  Production Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {hppResult.availability.can_produce ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-medium">
                      {hppResult.availability.can_produce ? 'Can Produce' : 'Cannot Produce'}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">Max Batches: </span>
                    <span className="font-mono font-medium">{hppResult.availability.production_capacity}</span>
                  </div>

                  {!hppResult.availability.can_produce && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                      <p className="text-sm text-destructive font-medium mb-1">Production Blocked</p>
                      <p className="text-xs text-destructive/80">
                        Insufficient ingredients to produce this recipe
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Stock Issues */}
              <Card className="p-4">
                <h4 className="flex items-center gap-2 font-medium mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  Stock Alerts
                </h4>
                <div className="space-y-2">
                  {hppResult.availability.limiting_ingredients.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-destructive mb-1">Insufficient Stock:</p>
                      <ul className="text-sm space-y-1">
                        {hppResult.availability.limiting_ingredients.map((ingredient, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="h-1 w-1 bg-destructive rounded-full"></span>
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hppResult.availability.stock_warnings.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-orange-600 mb-1">Stock Warnings:</p>
                      <ul className="text-sm space-y-1">
                        {hppResult.availability.stock_warnings.map((warning, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="h-1 w-1 bg-orange-500 rounded-full"></span>
                            {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {hppResult.availability.limiting_ingredients.length === 0 && 
                   hppResult.availability.stock_warnings.length === 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">All ingredients available</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis & Insights Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <Card className="p-4">
              <h4 className="flex items-center gap-2 font-medium mb-4">
                <Lightbulb className="h-4 w-4" />
                Smart Insights & Recommendations
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profitability Analysis */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Profitability Analysis</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        hppResult.margin_analysis.is_profitable ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span>
                        {hppResult.margin_analysis.is_profitable 
                          ? 'Recipe is profitable at current price' 
                          : 'Recipe needs price adjustment'
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Current Margin:</span>
                      <span className={getMarginColor(hppResult.margin_analysis.current_margin)}>
                        {hppResult.margin_analysis.current_margin.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Target Margin:</span>
                      <span>{hppResult.margin_analysis.recommended_margin}%</span>
                    </div>
                  </div>
                </div>

                {/* Market Positioning */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Market Positioning</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Competitive Range:</span>
                      <div className="mt-1">
                        <div className="flex justify-between text-xs">
                          <span>Min</span>
                          <span>Current</span>
                          <span>Max</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full relative mt-1">
                          <div 
                            className="absolute h-full bg-blue-500 rounded-full"
                            style={{
                              left: `${((hppResult.pricing_analysis.current_price - hppResult.pricing_analysis.competitor_price_range.min) / 
                                (hppResult.pricing_analysis.competitor_price_range.max - hppResult.pricing_analysis.competitor_price_range.min)) * 100}%`,
                              width: '4px'
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Rp {hppResult.pricing_analysis.competitor_price_range.min.toLocaleString()}</span>
                          <span>Rp {hppResult.pricing_analysis.competitor_price_range.max.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="mt-6 p-4 bg-muted border rounded-lg">
                <h5 className="font-medium text-sm mb-2">Recommended Actions:</h5>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {!hppResult.margin_analysis.is_profitable && (
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-foreground rounded-full"></span>
                      Increase selling price to at least Rp {hppResult.pricing_analysis.break_even_price.toLocaleString()}
                    </li>
                  )}
                  {hppResult.margin_analysis.current_margin < hppResult.margin_analysis.recommended_margin && (
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-foreground rounded-full"></span>
                      Consider pricing at Rp {hppResult.pricing_suggestions.standard.price.toLocaleString()} for optimal margin
                    </li>
                  )}
                  {!hppResult.availability.can_produce && (
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-foreground rounded-full"></span>
                      Restock limiting ingredients before production
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <span className="h-1 w-1 bg-foreground rounded-full"></span>
                    Monitor ingredient costs for HPP optimization opportunities
                  </li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default AdvancedHPPCalculator
export { AdvancedHPPCalculator }

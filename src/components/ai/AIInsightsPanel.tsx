/**
 * AI-Powered Insights Panel
 * Displays intelligent business insights with OpenRouter AI
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Zap,
  Target,
  Star,
  Sparkles
} from 'lucide-react'

import { useAIPowered } from '@/hooks/useAIPowered'
import { useCurrency } from '@/hooks/useCurrency'

interface AIInsightsPanelProps {
  businessData: {
    recipes?: any[]
    ingredients?: any[]
    orders?: any[]
    customers?: any[]
    financials?: any
  }
  onInsightAction?: (insight: any, action: string) => void
  className?: string
}

export function AIInsightsPanel({ 
  businessData, 
  onInsightAction,
  className 
}: AIInsightsPanelProps) {
  const { formatCurrency } = useCurrency()
  const ai = useAIPowered()
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Auto-generate insights when business data changes
  useEffect(() => {
    if (businessData.recipes || businessData.ingredients) {
      generateInsights()
    }
  }, [businessData])

  // Auto-refresh insights every 5 minutes if enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateInsights()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const generateInsights = async () => {
    try {
      await ai.generateSmartInsights(businessData)
    } catch (error) {
      console.error('Failed to generate AI insights:', error)
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    const level = ai.getConfidenceLevel(confidence)
    const colors = {
      high: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      medium: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
      low: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    }
    
    return (
      <Badge className={colors[level]}>
        <Star className="h-3 w-3 mr-1" />
        {Math.round(confidence * 100)}% confidence
      </Badge>
    )
  }

  const renderPricingInsights = () => {
    const { data, loading, error } = ai.pricing

    if (loading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 animate-pulse" />
              <span>Menganalisis pricing dengan AI...</span>
            </div>
            <Progress value={65} className="mt-2" />
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            AI Pricing Analysis Error: {error}
          </AlertDescription>
        </Alert>
      )
    }

    if (!data) return null

    return (
      <div className="space-y-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span>AI Pricing Recommendations</span>
              </CardTitle>
              {getConfidenceBadge(ai.pricing.confidence)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recommendedPrice && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {formatCurrency(data.recommendedPrice.min)}
                  </div>
                  <p className="text-sm text-muted-foreground">Minimum</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {formatCurrency(data.recommendedPrice.optimal)}
                  </div>
                  <p className="text-sm text-muted-foreground">Optimal</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {formatCurrency(data.recommendedPrice.max)}
                  </div>
                  <p className="text-sm text-muted-foreground">Maximum</p>
                </div>
              </div>
            )}

            <Separator />

            {data.actionItems && data.actionItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                  Action Items
                </h4>
                <ul className="space-y-1">
                  {data.actionItems.map((item: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <Target className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {data.opportunities && data.opportunities.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-gray-600 dark:text-gray-400">Opportunities</h4>
                <ul className="space-y-1">
                  {data.opportunities.map((opp: string, index: number) => (
                    <li key={index} className="text-sm text-green-700">• {opp}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.risks && data.risks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-gray-600 dark:text-gray-400">Risks</h4>
                <ul className="space-y-1">
                  {data.risks.map((risk: string, index: number) => (
                    <li key={index} className="text-sm text-red-700">• {risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderInventoryInsights = () => {
    const { data, loading, error } = ai.inventory

    if (loading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 animate-pulse" />
              <span>Mengoptimasi inventory dengan AI...</span>
            </div>
            <Progress value={45} className="mt-2" />
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            AI Inventory Analysis Error: {error}
          </AlertDescription>
        </Alert>
      )
    }

    if (!data) return null

    return (
      <div className="space-y-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span>AI Inventory Optimization</span>
              </CardTitle>
              {getConfidenceBadge(ai.inventory.confidence)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.criticalItems && data.criticalItems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center text-gray-600 dark:text-gray-400">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Critical Items ({data.criticalItems.length})
                </h4>
                <div className="space-y-2">
                  {data.criticalItems.slice(0, 5).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{item.ingredient}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.recommendedOrder} units</p>
                        <p className="text-sm">{formatCurrency(item.estimatedCost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.demandForecast && (
              <div>
                <h4 className="font-semibold mb-2">Demand Forecast</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-xl font-bold">{data.demandForecast.nextWeek}%</div>
                    <p className="text-sm text-muted-foreground">Next Week</p>
                  </div>
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-xl font-bold">{data.demandForecast.nextMonth}%</div>
                    <p className="text-sm text-muted-foreground">Next Month</p>
                  </div>
                </div>
              </div>
            )}

            {data.costImpact && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Cost Impact</h4>
                <div className="flex justify-between items-center">
                  <span>Potential Savings:</span>
                  <span className="text-gray-600 dark:text-gray-400 font-bold">
                    {formatCurrency(data.costImpact.savings)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCustomerInsights = () => {
    const { data, loading, error } = ai.customer

    if (loading) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 animate-pulse" />
              <span>Menganalisis customer behavior dengan AI...</span>
            </div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            AI Customer Analysis Error: {error}
          </AlertDescription>
        </Alert>
      )
    }

    if (!data) return null

    return (
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span>AI Customer Analytics</span>
            </CardTitle>
            {getConfidenceBadge(ai.customer.confidence)}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer insights coming soon...</p>
        </CardContent>
      </Card>
    )
  }

  const renderOverview = () => {
    const hasInsights = ai.hasAnyData
    const isGenerating = ai.isAnyLoading

    return (
      <div className="space-y-4">
        {/* AI Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span>AI Business Intelligence</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={hasInsights ? 'default' : 'secondary'}>
                  {hasInsights ? 'Active' : 'Ready'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateInsights}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Insights
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardDescription>
              Powered by Grok 4 Fast (FREE) via OpenRouter • Specialized for Indonesian F&B business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasInsights && !isGenerating && (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Click"Generate Insights" to get AI-powered business recommendations
                </p>
                <p className="text-sm text-muted-foreground">
                  AI akan menganalisis recipes, ingredients, dan data bisnis lainnya untuk memberikan insights yang actionable
                </p>
              </div>
            )}

            {hasInsights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <h3 className="font-semibold">Pricing Optimization</h3>
                  <p className="text-sm text-muted-foreground">
                    {ai.pricing.data ? 'Analysis Ready' : 'No Data'}
                  </p>
                </div>
                <div className="text-center">
                  <Package className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <h3 className="font-semibold">Inventory Intelligence</h3>
                  <p className="text-sm text-muted-foreground">
                    {ai.inventory.data ? 'Optimization Ready' : 'No Data'}
                  </p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                  <h3 className="font-semibold">Customer Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    {ai.customer.data ? 'Insights Ready' : 'No Data'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {hasInsights && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Price Analysis
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Stock Alert
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Customer Segments
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cost Optimization
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="pricing">
          {renderPricingInsights()}
        </TabsContent>

        <TabsContent value="inventory">
          {renderInventoryInsights()}
        </TabsContent>

        <TabsContent value="customers">
          {renderCustomerInsights()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIInsightsPanel
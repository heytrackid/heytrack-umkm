import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Target,
  Activity,
  Zap,
  CheckCircle,
  Info,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface SmartIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  total: number
  volatility?: 'low' | 'medium' | 'high'
  trend?: 'rising' | 'stable' | 'falling'
  alternatives?: string[]
  seasonality?: boolean
}

interface PricingInsight {
  type: 'warning' | 'opportunity' | 'info'
  title: string
  message: string
  impact?: string
  action?: string
}

interface MarketAnalysis {
  competitorRange: { min: number; max: number }
  marketPosition: 'below' | 'within' | 'above'
  recommendedAdjustment?: number
}

interface SmartPricingInsightsProps {
  ingredients: SmartIngredient[]
  currentPrice: number
  suggestedPrice: number
  totalCost: number
  margin: number
  insights: PricingInsight[]
  marketAnalysis?: MarketAnalysis
}

export function SmartPricingInsights({
  ingredients,
  currentPrice,
  suggestedPrice,
  totalCost,
  margin,
  insights,
  marketAnalysis
}: SmartPricingInsightsProps) {
  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'high': return 'text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-800'
      case 'medium': return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900'
      case 'low': return 'text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-gray-950'
      default: return 'text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-950'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <ArrowUpRight className="h-3 w-3 text-gray-600 dark:text-gray-400" />
      case 'falling': return <ArrowDownRight className="h-3 w-3 text-gray-500 dark:text-gray-500" />
      default: return <Activity className="h-3 w-3 text-gray-400 dark:text-gray-600" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return <Info className="h-4 w-4 text-gray-500 dark:text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Market Analysis */}
      {marketAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Analisis Pasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Rentang Kompetitor:</span>
              <span className="font-medium">
                Rp {marketAnalysis.competitorRange.min.toLocaleString()} - Rp {marketAnalysis.competitorRange.max.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Posisi Anda:</span>
              <Badge variant="outline" className="text-gray-600 dark:text-gray-400">
                {marketAnalysis.marketPosition === 'below' && 'Di Bawah Pasar'}
                {marketAnalysis.marketPosition === 'within' && 'Sesuai Pasar'}
                {marketAnalysis.marketPosition === 'above' && 'Di Atas Pasar'}
              </Badge>
            </div>
            {marketAnalysis.recommendedAdjustment && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rekomendasi Penyesuaian:</p>
                <p className="text-sm font-medium">
                  {marketAnalysis.recommendedAdjustment > 0 ? '+' : ''}
                  Rp {marketAnalysis.recommendedAdjustment.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ingredient Volatility Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analisis Bahan Baku
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ingredients.filter(ing => ing.volatility || ing.trend).map((ingredient) => (
              <div key={ingredient.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-950">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ingredient.name}</span>
                  {ingredient.trend && getTrendIcon(ingredient.trend)}
                  {ingredient.seasonality && (
                    <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-500">
                      Musiman
                    </Badge>
                  )}
                </div>
                {ingredient.volatility && (
                  <Badge className={`text-xs ${getVolatilityColor(ingredient.volatility)}`}>
                    Volatilitas {ingredient.volatility}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          
          {ingredients.some(ing => ing.alternatives?.length) && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">Alternatif tersedia:</p>
              {ingredients
                .filter(ing => ing.alternatives?.length)
                .map((ingredient) => (
                  <div key={ingredient.id} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span className="font-medium">{ingredient.name}:</span> {ingredient.alternatives?.join(', ')}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Insight Cerdas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <Alert key={index} className="p-3">
                <div className="flex items-start gap-2">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium text-sm mb-1">{insight.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{insight.message}</div>
                      {insight.impact && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Dampak: {insight.impact}
                        </div>
                      )}
                      {insight.action && (
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
                          💡 {insight.action}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pricing Recommendation Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Rekomendasi Harga
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Harga Optimal:</span>
            <span className="font-medium">Rp {suggestedPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Margin Optimal:</span>
            <span className="font-medium">{margin.toFixed(1)}%</span>
          </div>
          {currentPrice > 0 && currentPrice !== suggestedPrice && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Penyesuaian:</span>
              <span className={`font-medium ${currentPrice < suggestedPrice ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-500'}`}>
                {currentPrice < suggestedPrice ? '+' : ''}
                Rp {(suggestedPrice - currentPrice).toLocaleString()}
              </span>
            </div>
          )}
          
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-3 w-3" />
              <span>Berdasarkan analisis volatilitas, tren pasar, dan margin optimal</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SmartPricingInsights
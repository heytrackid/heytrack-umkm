'use client'

import { Card } from '@/components/ui/card'
import { BarChart3, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface PricingAnalysis {
  current_price: number
  current_margin: number
  break_even_price: number
  competitor_price_range: { min: number, max: number }
}

interface MarginAnalysis {
  is_profitable: boolean
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface PricingAnalysisCardProps {
  pricingAnalysis: PricingAnalysis
  marginAnalysis: MarginAnalysis
  getMarginColor: (margin: number) => string
  getRiskLevelColor: (risk: 'LOW' | 'MEDIUM' | 'HIGH') => string
}

/**
 * Current pricing analysis card component
 */
export function PricingAnalysisCard({
  pricingAnalysis,
  marginAnalysis,
  getMarginColor,
  getRiskLevelColor
}: PricingAnalysisCardProps) {
  return (
    <Card className="p-4">
      <h4 className="flex items-center gap-2 font-medium mb-3">
        <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        Current Pricing
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Current Price:</span>
          <span className="font-mono">{formatCurrency(pricingAnalysis.current_price)}</span>
        </div>
        <div className="flex justify-between">
          <span>Current Margin:</span>
          <span className={`font-mono ${getMarginColor(pricingAnalysis.current_margin)}`}>
            {pricingAnalysis.current_margin.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span>Break-even Price:</span>
          <span className="font-mono">{formatCurrency(pricingAnalysis.break_even_price)}</span>
        </div>
        <hr />
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Competitor Range:</span>
            <span>{formatCurrency(pricingAnalysis.competitor_price_range.min)} - {formatCurrency(pricingAnalysis.competitor_price_range.max)}</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="mt-4 p-3 rounded-lg bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={`h-4 w-4 ${getRiskLevelColor(marginAnalysis.risk_level)}`} />
          <span className="font-medium text-sm">
            Risk Level: {marginAnalysis.risk_level}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {marginAnalysis.is_profitable
            ? 'Recipe is profitable with current pricing'
            : 'Recipe needs price adjustment to be profitable'
          }
        </p>
      </div>
    </Card>
  )
}

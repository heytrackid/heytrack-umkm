'use client'

import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface MarginAnalysis {
  is_profitable: boolean
  current_margin: number
  recommended_margin: number
}

interface PricingAnalysis {
  current_price: number
  competitor_price_range: { min: number, max: number }
}

interface HPPBreakdown {
  cost_per_serving: number
}

interface PricingSuggestions {
  standard: { price: number }
}

interface Availability {
  can_produce: boolean
}

interface AnalysisInsightsProps {
  marginAnalysis: MarginAnalysis
  pricingAnalysis: PricingAnalysis
  hppBreakdown: HPPBreakdown
  pricingSuggestions: PricingSuggestions
  availability: Availability
  getMarginColor: (margin: number) => string
}

/**
 * Analysis and insights component with recommendations
 */
export function AnalysisInsights({
  marginAnalysis,
  pricingAnalysis,
  hppBreakdown,
  pricingSuggestions,
  availability,
  getMarginColor
}: AnalysisInsightsProps) {
  return (
    <Card className="p-4">
      <h4 className="flex items-center gap-2 font-medium mb-4">
        <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        Smart Insights & Recommendations
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profitability Analysis */}
        <div className="space-y-3">
          <h5 className="font-medium text-sm">Profitability Analysis</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                marginAnalysis.is_profitable ? 'bg-gray-100 dark:bg-gray-8000' : 'bg-gray-100 dark:bg-gray-8000'
              }`}></div>
              <span>
                {marginAnalysis.is_profitable
                  ? 'Recipe is profitable at current price'
                  : 'Recipe needs price adjustment'
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span>Current Margin:</span>
              <span className={getMarginColor(marginAnalysis.current_margin)}>
                {marginAnalysis.current_margin.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span>Target Margin:</span>
              <span>{marginAnalysis.recommended_margin}%</span>
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
                    className="absolute h-full bg-gray-100 dark:bg-gray-8000 rounded-full"
                    style={{
                      left: `${((pricingAnalysis.current_price - pricingAnalysis.competitor_price_range.min) /
                        (pricingAnalysis.competitor_price_range.max - pricingAnalysis.competitor_price_range.min)) * 100}%`,
                      width: '4px'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{formatCurrency(pricingAnalysis.competitor_price_range.min)}</span>
                  <span>{formatCurrency(pricingAnalysis.competitor_price_range.max)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Recommended Actions:</h5>
        <ul className="space-y-1 text-sm text-blue-700">
          {!marginAnalysis.is_profitable && (
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 bg-blue-600 rounded-full"></span>
              Increase selling price to at least {formatCurrency(Math.round(pricingAnalysis.current_price + hppBreakdown.cost_per_serving))}
            </li>
          )}
          {marginAnalysis.current_margin < marginAnalysis.recommended_margin && (
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 bg-blue-600 rounded-full"></span>
              Consider pricing at {formatCurrency(pricingSuggestions.standard.price)} for optimal margin
            </li>
          )}
          {!availability.can_produce && (
            <li className="flex items-center gap-2">
              <span className="h-1 w-1 bg-blue-600 rounded-full"></span>
              Restock limiting ingredients before production
            </li>
          )}
          <li className="flex items-center gap-2">
            <span className="h-1 w-1 bg-blue-600 rounded-full"></span>
            Monitor ingredient costs for HPP optimization opportunities
          </li>
        </ul>
      </div>
    </Card>
  )
}

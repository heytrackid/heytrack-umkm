'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PieChart } from 'lucide-react'
import type { HPPCalculationResult } from '../services/EnhancedHPPCalculationService'

interface CostBreakdownCardProps {
  calculationResult: HPPCalculationResult
  formatCurrency: (amount: number) => string
  includeOperationalCosts: boolean
}

/**
 * Cost breakdown visualization card component
 */
export function CostBreakdownCard({ calculationResult, formatCurrency, includeOperationalCosts }: CostBreakdownCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Rincian Biaya
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bahan Baku</span>
              <span className="text-sm">
                {formatCurrency(calculationResult.costBreakdown.materialCost)}
                ({calculationResult.costBreakdown.materialPercentage.toFixed(1)}%)
              </span>
            </div>
            <Progress
              value={calculationResult.costBreakdown.materialPercentage}
              className="h-2"
            />

            {includeOperationalCosts && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Biaya Operasional</span>
                  <span className="text-sm">
                    {formatCurrency(calculationResult.costBreakdown.operationalCost)}
                    ({calculationResult.costBreakdown.operationalPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress
                  value={calculationResult.costBreakdown.operationalPercentage}
                  className="h-2"
                />
              </>
            )}
          </div>

          {/* Ingredient breakdown */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Rincian Per Bahan:</h4>
            <div className="space-y-2">
              {calculationResult.costBreakdown.ingredientBreakdown.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{ingredient.ingredientName}</span>
                  <div className="flex items-center gap-2">
                    <span>{formatCurrency(ingredient.cost)}</span>
                    <Badge variant="outline" className="text-xs">
                      {ingredient.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Calculator, DollarSign, Percent, TrendingUp } from '@/components/icons'

import { Card, CardContent } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

import type { RecipeWithCosts } from '@/modules/hpp/hooks/useUnifiedHpp'

interface HppQuickSummaryProps {
  recipe: RecipeWithCosts
}

export const HppQuickSummary = ({ recipe }: HppQuickSummaryProps): JSX.Element => {
  const { formatCurrency } = useCurrency()

  const profit = (recipe.selling_price ?? 0) - recipe.total_cost
  const marginPercent = recipe.selling_price && recipe.selling_price > 0
    ? ((profit / recipe.selling_price) * 100)
    : 0

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total HPP */}
          <div className="text-center p-4 bg-card rounded-lg border">
            <Calculator className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(recipe.total_cost)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total HPP</div>
          </div>

          {/* Harga Jual */}
          <div className="text-center p-4 bg-card rounded-lg border">
            <DollarSign className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(recipe.selling_price ?? 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Harga Jual</div>
          </div>

          {/* Profit */}
          <div className="text-center p-4 bg-card rounded-lg border">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(profit)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Profit</div>
          </div>

          {/* Margin */}
          <div className="text-center p-4 bg-card rounded-lg border">
            <Percent className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <div className="text-2xl font-bold text-foreground">
              {marginPercent.toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Margin</div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span className="font-medium">{recipe.name}</span> • Per 1 porsi/unit
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface PricingSuggestion {
  price: number
  margin: number
  rationale: string
}

interface PricingSuggestions {
  economy: PricingSuggestion
  standard: PricingSuggestion
  premium: PricingSuggestion
}

interface PricingSuggestionsProps {
  pricingSuggestions: PricingSuggestions
  selectedPricing: 'economy' | 'standard' | 'premium'
  customPrice: string
  costPerServing: number
  onSelectPricing: (tier: 'economy' | 'standard' | 'premium') => void
  onCustomPriceChange: (value: string) => void
  getMarginColor: (margin: number) => string
}

/**
 * Pricing suggestions component with tiers and custom pricing
 */
export function PricingSuggestionsComponent({
  pricingSuggestions,
  selectedPricing,
  customPrice,
  costPerServing,
  onSelectPricing,
  onCustomPriceChange,
  getMarginColor
}: PricingSuggestionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['economy', 'standard', 'premium'] as const).map((tier) => {
          const suggestion = pricingSuggestions[tier]
          return (
            <Card
              key={tier}
              className={`p-4 cursor-pointer transition-colors ${
                selectedPricing === tier ? 'ring-2 ring-blue-500 bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectPricing(tier)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">{tier}</h4>
                <Badge variant={tier === 'premium' ? 'default' : 'outline'}>
                  {suggestion.margin}% margin
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-2">
                {formatCurrency(suggestion.price)}
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
                  onSelectPricing(tier)
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
          <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          Custom Pricing
        </h4>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label htmlFor="customPrice" className="text-sm">Custom Price</Label>
            <Input
              id="customPrice"
              type="number"

              value={customPrice}
              onChange={(e) => onCustomPriceChange(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label className="text-sm">Calculated Margin</Label>
            <div className="p-2 border rounded-md bg-gray-50 mt-1">
              {customPrice && !isNaN(parseFloat) ? (
                <span className={`font-mono ${getMarginColor(
                  ((parseFloat - costPerServing) / parseFloat) * 100
                )}`}>
                  {(((parseFloat - costPerServing) / parseFloat) * 100).toFixed(1)}%
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

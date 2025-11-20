import { Scale } from '@/components/icons'
import { memo, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useSettings } from '@/contexts/settings-context'

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  price_per_unit: number
  weighted_average_cost?: number
}

interface ProductionScalerProps {
  baseBatchSize: number
  ingredients: Ingredient[]
  onBatchSizeChange?: (newBatchSize: number, scaledIngredients: Ingredient[], totalCost: number) => void
}

/**
 * Production Scaler Component
 * Allows adjusting batch size with proportional ingredient scaling
 */
export const ProductionScaler = memo(({
  baseBatchSize,
  ingredients,
  onBatchSizeChange
}: ProductionScalerProps) => {
  const { formatCurrency } = useSettings()
  const [batchSize, setBatchSize] = useState(baseBatchSize)
  const [customBatchSize, setCustomBatchSize] = useState(baseBatchSize.toString())

  // Calculate scaled ingredients and costs
  const scaledData = useMemo(() => {
    const scaleFactor = batchSize / baseBatchSize

    const scaledIngredients = ingredients.map(ing => ({
      ...ing,
      scaledQuantity: ing.quantity * scaleFactor,
      scaledCost: (ing.weighted_average_cost || ing.price_per_unit || 0) * ing.quantity * scaleFactor
    }))

    const totalCost = scaledIngredients.reduce((sum, ing) => sum + ing.scaledCost, 0)
    const costPerUnit = batchSize > 0 ? totalCost / batchSize : 0

    return {
      scaledIngredients,
      totalCost,
      costPerUnit,
      scaleFactor
    }
  }, [batchSize, baseBatchSize, ingredients])

  const handleBatchSizeChange = (value: number[]) => {
    const newBatchSize = value[0]
    setBatchSize(newBatchSize)
    setCustomBatchSize(newBatchSize.toString())
    onBatchSizeChange?.(newBatchSize, scaledData.scaledIngredients, scaledData.totalCost)
  }

  const handleCustomBatchSizeChange = (value: string) => {
    setCustomBatchSize(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      setBatchSize(numValue)
      onBatchSizeChange?.(numValue, scaledData.scaledIngredients, scaledData.totalCost)
    }
  }

  const presetBatchSizes = [baseBatchSize, baseBatchSize * 2, baseBatchSize * 5, baseBatchSize * 10]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Production Scaling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Batch Size Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="batch-size">Batch Size</Label>
            <div className="flex items-center gap-2">
              <Input
                id="batch-size"
                type="number"
                value={customBatchSize}
                onChange={(e) => handleCustomBatchSizeChange(e.target.value)}
                className="w-20"
                min="0.1"
                step="0.1"
              />
              <span className="text-sm text-muted-foreground">units</span>
            </div>
          </div>

          <Slider
            value={[batchSize]}
            onValueChange={handleBatchSizeChange}
            min={baseBatchSize * 0.1}
            max={baseBatchSize * 20}
            step={baseBatchSize * 0.1}
            className="w-full"
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {presetBatchSizes.map((size) => (
              <Button
                key={size}
                variant={batchSize === size ? "default" : "outline"}
                size="sm"
                onClick={() => handleBatchSizeChange([size])}
              >
                {size}x
              </Button>
            ))}
          </div>
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold">{formatCurrency(scaledData.totalCost)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cost per Unit</p>
            <p className="text-lg font-semibold">{formatCurrency(scaledData.costPerUnit)}</p>
          </div>
        </div>

        {/* Scaled Ingredients */}
        <div className="space-y-2">
          <h4 className="font-medium">Scaled Ingredients</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {scaledData.scaledIngredients.map((ing) => (
              <div key={ing.id} className="flex justify-between items-center text-sm">
                <span>{ing.name}</span>
                <div className="text-right">
                  <span>{ing.scaledQuantity.toFixed(2)} {ing.unit}</span>
                  <span className="ml-2 text-muted-foreground">
                    ({formatCurrency(ing.scaledCost)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scale Factor Info */}
        <div className="text-xs text-muted-foreground text-center">
          Scale factor: {scaledData.scaleFactor.toFixed(2)}x
          {scaledData.scaleFactor !== 1 && (
            <span className="ml-1">
              ({scaledData.scaleFactor > 1 ? '+' : ''}{((scaledData.scaleFactor - 1) * 100).toFixed(0)}%)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

ProductionScaler.displayName = 'ProductionScaler'
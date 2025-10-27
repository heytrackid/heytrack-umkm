/**
 * Web Worker for HPP Calculations
 * Offloads heavy calculations from main thread
 */

interface HppCalculationInput {
  ingredients: Array<{
    quantity: number
    price_per_unit: number
  }>
  operationalCost: number
  batchSize: number
}

interface HppCalculationResult {
  materialCost: number
  operationalCostPerUnit: number
  totalCost: number
  costPerUnit: number
  breakdown: {
    materials: number
    operational: number
  }
}

self.onmessage = (e: MessageEvent<HppCalculationInput>) => {
  const { ingredients, operationalCost, batchSize } = e.data

  try {
    // Calculate material cost
    const materialCost = ingredients.reduce(
      (sum, ingredient) => sum + ingredient.quantity * ingredient.price_per_unit,
      0
    )

    // Calculate operational cost per unit
    const operationalCostPerUnit = batchSize > 0 ? operationalCost / batchSize : 0

    // Calculate total cost
    const totalCost = materialCost + operationalCost

    // Calculate cost per unit
    const costPerUnit = batchSize > 0 ? totalCost / batchSize : totalCost

    const result: HppCalculationResult = {
      materialCost,
      operationalCostPerUnit,
      totalCost,
      costPerUnit,
      breakdown: {
        materials: materialCost,
        operational: operationalCost
      }
    }

    self.postMessage({ success: true, data: result })
  } catch (err) {
    self.postMessage({
      success: false,
      _error: err instanceof Error ? err.message : 'Calculation failed'
    })
  }
}

export {}

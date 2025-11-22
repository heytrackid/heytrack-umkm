/**
 * Advanced HPP Calculator Web Worker
 * Handles complex HPP calculations with WAC, labor, and overhead allocation
 * Offloads heavy calculations from main thread for better performance
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
  material_cost: number
  operational_cost_per_unit: number
  total_cost: number
  cost_per_unit: number
  breakdown: {
    materials: number
    operational: number
  }
}

self.onmessage = (e: MessageEvent<HppCalculationInput>) => {
  const input = e.data

  try {
    const result = calculateHpp(input)
    self.postMessage({ success: true, data: result })
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'HPP calculation failed'
    })
  }
}

function calculateHpp(input: HppCalculationInput): HppCalculationResult {
  const { ingredients, operationalCost, batchSize } = input

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

  return {
    material_cost: materialCost,
    operational_cost_per_unit: operationalCostPerUnit,
    total_cost: totalCost,
    cost_per_unit: costPerUnit,
    breakdown: {
      materials: materialCost,
      operational: operationalCost
    }
  }
}





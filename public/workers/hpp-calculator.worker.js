// HPP Calculator Web Worker
// Offload heavy calculations to prevent UI blocking

self.addEventListener('message', (e) => {
  const { type, data } = e.data

  try {
    switch (type) {
      case 'CALCULATE_HPP':
        const result = calculateHPP(data)
        self.postMessage({ type: 'CALCULATE_HPP_SUCCESS', data: result })
        break

      case 'CALCULATE_BATCH_HPP':
        const batchResults = calculateBatchHPP(data)
        self.postMessage({ type: 'CALCULATE_BATCH_HPP_SUCCESS', data: batchResults })
        break

      case 'CALCULATE_WAC':
        const wacResult = calculateWAC(data)
        self.postMessage({ type: 'CALCULATE_WAC_SUCCESS', data: wacResult })
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message
    })
  }
})

// Calculate HPP for a single recipe
function calculateHPP({ ingredients, operationalCosts, batchSize = 1 }) {
  // Calculate ingredient costs
  let totalIngredientCost = 0
  const ingredientBreakdown = []

  for (const ingredient of ingredients) {
    const cost = (ingredient.quantity || 0) * (ingredient.unit_price || 0)
    totalIngredientCost += cost
    
    ingredientBreakdown.push({
      id: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      unit_price: ingredient.unit_price,
      total_cost: cost
    })
  }

  // Calculate operational costs
  let totalOperationalCost = 0
  const operationalBreakdown = []

  for (const cost of operationalCosts || []) {
    const amount = cost.amount || 0
    totalOperationalCost += amount
    
    operationalBreakdown.push({
      id: cost.id,
      name: cost.name,
      amount: amount,
      category: cost.category
    })
  }

  // Calculate totals
  const totalCost = totalIngredientCost + totalOperationalCost
  const costPerUnit = batchSize > 0 ? totalCost / batchSize : totalCost

  return {
    total_hpp: totalCost,
    cost_per_unit: costPerUnit,
    ingredient_cost: totalIngredientCost,
    operational_cost: totalOperationalCost,
    batch_size: batchSize,
    ingredient_breakdown: ingredientBreakdown,
    operational_breakdown: operationalBreakdown,
    calculated_at: new Date().toISOString()
  }
}

// Calculate HPP for multiple recipes
function calculateBatchHPP({ recipes }) {
  const results = []

  for (const recipe of recipes) {
    try {
      const result = calculateHPP({
        ingredients: recipe.ingredients || [],
        operationalCosts: recipe.operational_costs || [],
        batchSize: recipe.batch_size || 1
      })

      results.push({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        ...result,
        success: true
      })
    } catch (error) {
      results.push({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        success: false,
        error: error.message
      })
    }
  }

  return results
}

// Calculate Weighted Average Cost
function calculateWAC({ purchases }) {
  if (!purchases || purchases.length === 0) {
    return {
      wac: 0,
      total_quantity: 0,
      total_cost: 0,
      purchase_count: 0
    }
  }

  let totalCost = 0
  let totalQuantity = 0

  for (const purchase of purchases) {
    const quantity = purchase.quantity || 0
    const price = purchase.unit_price || 0
    
    totalCost += quantity * price
    totalQuantity += quantity
  }

  const wac = totalQuantity > 0 ? totalCost / totalQuantity : 0

  return {
    wac,
    total_quantity: totalQuantity,
    total_cost: totalCost,
    purchase_count: purchases.length,
    calculated_at: new Date().toISOString()
  }
}

// Signal that worker is ready
self.postMessage({ type: 'READY' })

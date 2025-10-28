// HPP Calculator Web Worker
// Performs heavy calculations off the main thread to prevent UI blocking

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

// Listen for messages from the main thread
self.onmessage = function(e: MessageEvent<HppCalculationInput>) {
  try {
    const { ingredients, operationalCost, batchSize } = e.data;

    // Perform the calculation
    const materialCost = ingredients.reduce(
      (sum, ing) => sum + ing.quantity * ing.price_per_unit,
      0
    );
    
    const operationalCostPerUnit = batchSize > 0 ? operationalCost / batchSize : 0;
    const totalCost = materialCost + operationalCost;
    const costPerUnit = batchSize > 0 ? totalCost / batchSize : totalCost;

    const result: HppCalculationResult = {
      materialCost,
      operationalCostPerUnit,
      totalCost,
      costPerUnit,
      breakdown: {
        materials: materialCost,
        operational: operationalCost
      }
    };

    // Send result back to main thread
    self.postMessage({
      success: true,
      data: result
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};
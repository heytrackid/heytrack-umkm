// Production Batch Optimization Logic
export class BatchOptimizationService {
  /**
   * Calculate optimal batch sizes based on strategy
   */
  calculateOptimalBatchSizes(
    totalQuantity: number,
    recipe: any,
    config: {
      batch_size_strategy: 'fixed' | 'optimal' | 'order_based'
      default_batch_size: number
      min_batch_efficiency: number
    },
    limits: {
      max_batch_size: number
      min_batch_size: number
    }
  ): number[] {
    const strategy = config.batch_size_strategy
    const defaultSize = config.default_batch_size

    switch (strategy) {
      case 'fixed':
        return this.calculateFixedBatches(totalQuantity, defaultSize)

      case 'optimal':
        return this.calculateOptimalBatches(totalQuantity, recipe, limits.min_batch_size, limits.max_batch_size)

      case 'order_based':
        return this.calculateOrderBasedBatches(totalQuantity, defaultSize, limits.max_batch_size)

      default:
        return [Math.min(totalQuantity, defaultSize)]
    }
  }

  private calculateFixedBatches(totalQuantity: number, batchSize: number): number[] {
    const batches: number[] = []
    let remaining = totalQuantity

    while (remaining > 0) {
      batches.push(Math.min(remaining, batchSize))
      remaining -= batchSize
    }

    return batches
  }

  private calculateOptimalBatches(
    totalQuantity: number,
    recipe: any,
    minSize: number,
    maxSize: number
  ): number[] {
    // Find the batch size that minimizes waste and maximizes efficiency
    const optimalSize = this.findOptimalBatchSize(totalQuantity, recipe, minSize, maxSize)
    return this.calculateFixedBatches(totalQuantity, optimalSize)
  }

  private calculateOrderBasedBatches(
    totalQuantity: number,
    preferredSize: number,
    maxSize: number
  ): number[] {
    // Create batches that align with typical order sizes
    const batches: number[] = []
    let remaining = totalQuantity

    while (remaining > 0) {
      let batchSize = preferredSize

      // If remaining quantity is small, make a smaller batch
      if (remaining < preferredSize * 0.7) {
        batchSize = remaining
      }
      // If remaining is close to preferredSize, use it all
      else if (remaining < preferredSize * 1.3) {
        batchSize = remaining
      }
      // Otherwise use preferred size or max size
      else {
        batchSize = Math.min(preferredSize, maxSize)
      }

      batches.push(batchSize)
      remaining -= batchSize
    }

    return batches
  }

  private findOptimalBatchSize(
    totalQuantity: number,
    recipe: any,
    minSize: number,
    maxSize: number
  ): number {
    // Simple heuristic: find size that minimizes waste
    let bestSize = minSize
    let minWaste = totalQuantity

    for (let size = minSize; size <= maxSize; size += 5) {
      const numBatches = Math.ceil(totalQuantity / size)
      const totalProduced = numBatches * size
      const waste = totalProduced - totalQuantity

      if (waste < minWaste) {
        minWaste = waste
        bestSize = size
      }
    }

    return bestSize
  }
}

export const batchOptimizationService = new BatchOptimizationService()

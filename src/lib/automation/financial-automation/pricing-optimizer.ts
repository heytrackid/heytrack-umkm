import { formatCurrency } from '@/lib/currency'

import type { PriceOption, PricingOptimizationResult } from './types'

/**
 * Pricing Optimizer Module
 * Handles pricing optimization and analysis
 */


export class PricingOptimizer {
  /**
   * Optimize pricing with price elasticity analysis
   */
  static optimizePricing(
    currentPrice: number,
    currentVolume: number,
    costPerUnit: number,
    priceElasticity = -1.2 // Default price elasticity for food products
  ): PricingOptimizationResult {
    const currentProfit = (currentPrice - costPerUnit) * currentVolume
    const priceOptions: PriceOption[] = []

    // Test price variations from -20% to +30%
    for (let priceChange = -0.2; priceChange <= 0.3; priceChange += 0.05) {
      const newPrice = currentPrice * (1 + priceChange)
      const volumeChange = priceElasticity * priceChange
      const newVolume = currentVolume * (1 + volumeChange)
      const newProfit = (newPrice - costPerUnit) * newVolume

      priceOptions.push({
        price: Math.round(newPrice),
        priceChange: Math.round(priceChange * 100),
        volume: Math.round(newVolume),
        volumeChange: Math.round(volumeChange * 100),
        profit: Math.round(newProfit),
        profitChange: Math.round(((newProfit - currentProfit) / currentProfit) * 100)
      })
    }

    const optimalPrice = priceOptions.reduce((best, current) =>
      current.profit > best.profit ? current : best
    )

    return {
      currentMetrics: {
        price: currentPrice,
        volume: currentVolume,
        profit: currentProfit
      },
      optimalPrice,
      allOptions: priceOptions.sort((a, b) => b.profit - a.profit),
      recommendation: `Optimal price: ${formatCurrency(optimalPrice.price, { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 })} (${optimalPrice.priceChange > 0 ? '+' : ''}${optimalPrice.priceChange}% change)`
    }
  }
}

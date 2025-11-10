import type { BreakEvenResult } from '@/lib/automation/financial-automation/types'

/**
 * Break-even Analyzer Module
 * Handles break-even analysis calculations
 */


export class BreakEvenAnalyzer {
  /**
   * Calculate break-even analysis
   */
  static calculateBreakEven(
    fixedCosts: number,
    variableCostPerUnit: number,
    pricePerUnit: number
  ): BreakEvenResult {
    const contributionMargin = pricePerUnit - variableCostPerUnit
    const contributionMarginRatio = contributionMargin / pricePerUnit

    if (contributionMargin <= 0) {
      return {
        error: 'Cannot break even - price must be higher than variable cost per unit',
        breakEvenUnits: 0,
        breakEvenRevenue: 0,
        contributionMargin: 0,
        contributionMarginRatio: 0,
        safetyMargin: {
          units: 0,
          revenue: 0
        }
      }
    }

    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin)
    const breakEvenRevenue = breakEvenUnits * pricePerUnit

    return {
      breakEvenUnits,
      breakEvenRevenue,
      contributionMargin,
      contributionMarginRatio: contributionMarginRatio * 100,
      safetyMargin: {
        units: breakEvenUnits * 1.2, // 20% safety margin
        revenue: breakEvenRevenue * 1.2
      }
    }
  }

  /**
   * Calculate break-even with multiple products
   */
  static calculateMultiProductBreakEven(
    products: Array<{
      fixedCosts: number
      variableCostPerUnit: number
      pricePerUnit: number
      expectedSalesVolume: number
    }>
  ): BreakEvenResult & {
    productBreakEvens: Array<{
      productIndex: number
      breakEvenUnits: number
      breakEvenRevenue: number
    }>
  } {
    const totalFixedCosts = products.reduce((sum, p) => sum + p.fixedCosts, 0)
    const weightedContributionMargin = products.reduce((sum, p) => {
      const contribution = p.pricePerUnit - p.variableCostPerUnit
      return sum + (contribution * p.expectedSalesVolume)
    }, 0) / products.reduce((sum, p) => sum + p.expectedSalesVolume, 0)

    const baseResult = this.calculateBreakEven(
      totalFixedCosts,
      weightedContributionMargin,
      weightedContributionMargin + products.reduce((sum, p) => sum + p.variableCostPerUnit, 0) / products.length
    )

    const productBreakEvens = products.map((product, index) => {
      const contributionMargin = product.pricePerUnit - product.variableCostPerUnit
      const breakEvenUnits = contributionMargin > 0 ? Math.ceil(product.fixedCosts / contributionMargin) : 0
      const breakEvenRevenue = breakEvenUnits * product.pricePerUnit

      return {
        productIndex: index,
        breakEvenUnits,
        breakEvenRevenue
      }
    })

    return {
      ...baseResult,
      productBreakEvens
    }
  }

  /**
   * Calculate break-even sensitivity analysis
   */
  static calculateBreakEvenSensitivity(
    fixedCosts: number,
    variableCostPerUnit: number,
    pricePerUnit: number,
    sensitivityRange = 0.1
  ) {
    const scenarios = []
    const baseBreakEven = this.calculateBreakEven(fixedCosts, variableCostPerUnit, pricePerUnit)

    if (baseBreakEven.error) {return { error: baseBreakEven.error, scenarios: [] }}

    // Price sensitivity
    for (let change = -sensitivityRange; change <= sensitivityRange; change += sensitivityRange / 5) {
      const newPrice = pricePerUnit * (1 + change)
      const scenario = this.calculateBreakEven(fixedCosts, variableCostPerUnit, newPrice)
      if (!scenario.error) {
        scenarios.push({
          type: 'price',
          changePercent: change * 100,
          breakEvenUnits: scenario.breakEvenUnits,
          breakEvenRevenue: scenario.breakEvenRevenue,
          impact: ((scenario.breakEvenUnits - baseBreakEven.breakEvenUnits) / baseBreakEven.breakEvenUnits) * 100
        })
      }
    }

    // Cost sensitivity
    for (let change = -sensitivityRange; change <= sensitivityRange; change += sensitivityRange / 5) {
      const newFixedCosts = fixedCosts * (1 + change)
      const scenario = this.calculateBreakEven(newFixedCosts, variableCostPerUnit, pricePerUnit)
      if (!scenario.error) {
        scenarios.push({
          type: 'fixed_cost',
          changePercent: change * 100,
          breakEvenUnits: scenario.breakEvenUnits,
          breakEvenRevenue: scenario.breakEvenRevenue,
          impact: ((scenario.breakEvenUnits - baseBreakEven.breakEvenUnits) / baseBreakEven.breakEvenUnits) * 100
        })
      }
    }

    return {
      baseBreakEven,
      scenarios
    }
  }
}

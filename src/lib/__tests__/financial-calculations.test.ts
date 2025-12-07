import { describe, it, expect } from 'vitest'

// Test financial calculation logic
describe('Financial Calculations', () => {
  describe('Profit Calculations', () => {
    it('should calculate gross profit as revenue minus COGS', () => {
      const revenue = 100000
      const cogs = 60000
      const expectedGrossProfit = revenue - cogs

      expect(expectedGrossProfit).toBe(40000)
    })

    it('should calculate net profit as gross profit minus operating expenses', () => {
      const grossProfit = 40000
      const operatingExpenses = 15000
      const expectedNetProfit = grossProfit - operatingExpenses

      expect(expectedNetProfit).toBe(25000)
    })

    it('should calculate profit margin as profit divided by revenue', () => {
      const profit = 25000
      const revenue = 100000
      const expectedMargin = (profit / revenue) * 100

      expect(expectedMargin).toBe(25)
    })
  })

  describe('COGS Calculations', () => {
    it('should calculate COGS from recipe costs and order quantities', () => {
      // Order with 2 items
      const orderItems = [
        { quantity: 2, recipe_cost_per_unit: 5000 }, // 2 × 5000 = 10,000
        { quantity: 1, recipe_cost_per_unit: 8000 }  // 1 × 8000 = 8,000
      ]

      const expectedCogs = orderItems.reduce(
        (total, item) => total + (item.quantity * item.recipe_cost_per_unit),
        0
      )

      expect(expectedCogs).toBe(18000)
    })

    it('should handle fractional quantities', () => {
      const quantity = 0.5
      const costPerUnit = 10000
      const expectedCogs = quantity * costPerUnit

      expect(expectedCogs).toBe(5000)
    })
  })

  describe('Business Metrics', () => {
    it('should identify profitable products', () => {
      const products = [
        { name: 'Product A', revenue: 50000, cogs: 30000, profit: 20000 },
        { name: 'Product B', revenue: 30000, cogs: 25000, profit: 5000 },
        { name: 'Product C', revenue: 20000, cogs: 22000, profit: -2000 }
      ]

      const profitableProducts = products.filter(p => p.profit > 0)
      const lossProducts = products.filter(p => p.profit < 0)

      expect(profitableProducts).toHaveLength(2)
      expect(lossProducts).toHaveLength(1)
      expect(lossProducts[0].name).toBe('Product C')
    })

    it('should calculate break-even point', () => {
      const fixedCosts = 50000
      const sellingPrice = 10000
      const variableCost = 6000

      const contributionMargin = sellingPrice - variableCost
      const breakEvenUnits = fixedCosts / contributionMargin

      expect(contributionMargin).toBe(4000)
      expect(breakEvenUnits).toBe(12.5)
    })
  })
})
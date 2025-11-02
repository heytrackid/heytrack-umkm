import type { SaleData, ExpenseData, Ingredient, FinancialMetrics } from '@/lib/automation/types'

/**
 * Metrics Calculator Module
 * Handles core financial metrics calculation
 */


export class MetricsCalculator {
  /**
   * Calculate comprehensive financial metrics
   */
  static calculateFinancialMetrics(
    sales: SaleData[],
    expenses: ExpenseData[],
    inventory: Ingredient[]
  ): FinancialMetrics {
    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0)
    const totalCOGS = sales.reduce((sum, s) => sum + s.cost, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const grossProfit = totalRevenue - totalCOGS
    const netProfit = grossProfit - totalExpenses

    // Inventory value calculation
    const inventoryValue = inventory.reduce((sum, i) => sum + (i.current_stock || 0) * (i.price_per_unit || 0), 0)

    return {
      revenue: totalRevenue,
      grossProfit,
      netProfit,
      grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      inventoryValue
    }
  }

  /**
   * Filter data by date range (last 30 days by default)
   */
  static filterRecentData<T extends { date: string }>(
    data: T[],
    days = 30
  ): T[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return data.filter(item => new Date(item.date) >= cutoffDate)
  }

  /**
   * Calculate inventory value
   */
  static calculateInventoryValue(inventory: Ingredient[]): number {
    return inventory.reduce((sum, i) => sum + (i.current_stock || 0) * (i.price_per_unit || 0), 0)
  }

  /**
   * Calculate total expenses
   */
  static calculateTotalExpenses(expenses: ExpenseData[]): number {
    return expenses.reduce((sum, e) => sum + e.amount, 0)
  }

  /**
   * Calculate total revenue and COGS
   */
  static calculateRevenueAndCOGS(sales: SaleData[]): { revenue: number; cogs: number } {
    const revenue = sales.reduce((sum, s) => sum + s.amount, 0)
    const cogs = sales.reduce((sum, s) => sum + s.cost, 0)
    return { revenue, cogs }
  }
}

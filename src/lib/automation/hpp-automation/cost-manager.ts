/**
 * Cost Manager Module
 * Manages operational costs and auto-allocation
 */

import type { OperationalCost } from './types'

export class CostManager {
  private operationalCosts: Map<string, OperationalCost> = new Map()

  constructor() {
    this.loadDefaultOperationalCosts()
  }

  /**
   * Load default operational costs for Indonesian UMKM
   */
  private loadDefaultOperationalCosts(): void {
    const defaultCosts: OperationalCost[] = [
      {
        id: 'labor_hourly_rate',
        category: 'labor',
        name: 'Upah Kerja per Jam',
        amount: 50000, // Rp 50k/hour
        period: 'hourly',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      },
      {
        id: 'overhead_electricity',
        category: 'overhead',
        name: 'Listrik',
        amount: 2000, // Rp 2k base cost
        period: 'per_batch',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      },
      {
        id: 'overhead_gas',
        category: 'overhead',
        name: 'Gas',
        amount: 1500,
        period: 'per_batch',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      },
      {
        id: 'overhead_rent',
        category: 'overhead',
        name: 'Sewa Tempat (Alokasi)',
        amount: 500,
        period: 'per_batch',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        autoAllocate: true
      }
    ]

    defaultCosts.forEach(cost => {
      this.operationalCosts.set(cost.id, cost)
    })
  }

  /**
   * Get all operational costs
   */
  getOperationalCosts(): OperationalCost[] {
    return Array.from(this.operationalCosts.values())
  }

  /**
   * Get operational cost by ID
   */
  getOperationalCost(costId: string): OperationalCost | undefined {
    return this.operationalCosts.get(costId)
  }

  /**
   * Update operational cost
   */
  updateOperationalCost(costId: string, newAmount: number): OperationalCost | null {
    const cost = this.operationalCosts.get(costId)
    if (!cost) {
      return null
    }

    cost.amount = newAmount
    cost.lastUpdated = new Date().toISOString()

    return cost
  }

  /**
   * Add new operational cost
   */
  addOperationalCost(cost: OperationalCost): void {
    this.operationalCosts.set(cost.id, cost)
  }

  /**
   * Remove operational cost
   */
  removeOperationalCost(costId: string): boolean {
    return this.operationalCosts.delete(costId)
  }

  /**
   * Get operational cost amount by key
   */
  getOperationalCostAmount(key: string, defaultValue: number = 0): number {
    const cost = this.operationalCosts.get(key)
    return cost?.amount || defaultValue
  }

  /**
   * Get costs that should auto-allocate
   */
  getAutoAllocateCosts(): OperationalCost[] {
    return Array.from(this.operationalCosts.values()).filter(cost => cost.autoAllocate)
  }

  /**
   * Toggle auto-allocation for a cost
   */
  toggleAutoAllocation(costId: string): boolean {
    const cost = this.operationalCosts.get(costId)
    if (!cost) {
      return false
    }

    cost.autoAllocate = !cost.autoAllocate
    return cost.autoAllocate
  }

  /**
   * Get costs by category
   */
  getCostsByCategory(category: OperationalCost['category']): OperationalCost[] {
    return Array.from(this.operationalCosts.values()).filter(cost => cost.category === category)
  }

  /**
   * Calculate total operational costs
   */
  getTotalOperationalCosts(): number {
    return Array.from(this.operationalCosts.values())
      .filter(cost => cost.isActive)
      .reduce((total, cost) => total + cost.amount, 0)
  }

  /**
   * Reset to default costs
   */
  resetToDefaults(): void {
    this.operationalCosts.clear()
    this.loadDefaultOperationalCosts()
  }
}

/**
 * Capacity Manager Module
 * Handles production capacity calculation and optimization
 */

import type { Equipment, Staffing, ProductionCapacity } from './types'

export class CapacityManager {
  /**
   * Calculate production capacity and bottlenecks
   */
  static calculateProductionCapacity(
    equipment: Equipment[],
    staffing: Staffing[]
  ): ProductionCapacity {
    const equipmentCapacity = equipment.reduce((total, eq) => total + (eq.capacity * eq.availability / 100), 0)

    const staffCapacity = staffing.reduce((total, staff) => total + (staff.count * staff.productivity), 0)

    const bottleneck = equipmentCapacity < staffCapacity ? 'equipment' : 'staffing'
    const maxCapacity = Math.min(equipmentCapacity, staffCapacity)

    return {
      maxCapacity,
      bottleneck,
      equipmentCapacity,
      staffCapacity,
      utilizationRate: 85, // Assume 85% practical utilization
      recommendations: this.generateCapacityRecommendations(bottleneck, equipmentCapacity, staffCapacity)
    }
  }

  /**
   * Generate capacity optimization recommendations
   */
  private static generateCapacityRecommendations(
    bottleneck: string,
    equipmentCapacity: number,
    staffCapacity: number
  ): string[] {
    const recommendations: string[] = []

    if (bottleneck === 'equipment') {
      recommendations.push('🏭 Equipment is the bottleneck - consider:')
      recommendations.push('  • Equipment upgrade or additional units')
      recommendations.push('  • Better maintenance scheduling')
      recommendations.push('  • Process optimization to reduce equipment dependency')
    } else {
      recommendations.push('👥 Staffing is the bottleneck - consider:')
      recommendations.push('  • Additional staff during peak hours')
      recommendations.push('  • Cross-training for flexibility')
      recommendations.push('  • Process automation where possible')
    }

    const utilizationGap = Math.abs(equipmentCapacity - staffCapacity) / Math.max(equipmentCapacity, staffCapacity)
    if (utilizationGap > 0.2) {
      recommendations.push(`⚖️ Large capacity imbalance (${(utilizationGap*100).toFixed(0)}%) - balance resources for optimal efficiency`)
    }

    return recommendations
  }
}

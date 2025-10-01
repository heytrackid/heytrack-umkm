/**
 * Production AI Service
 * Smart production planning and scheduling
 */

interface ProductionData {
  recipes: Array<{
    id: string;
    name: string;
    batchSize: number;
    productionTime: number; // minutes
    ingredients: Array<{ id: string; quantity: number }>;
  }>;
  orders: Array<{
    id: string;
    recipeId: string;
    quantity: number;
    deadline: Date;
  }>;
  capacity: {
    workHoursPerDay: number;
    workDaysPerWeek: number;
    ovenCapacity: number;
  };
}

interface ProductionPlan {
  schedule: Array<{
    recipeId: string;
    recipeName: string;
    batches: number;
    startTime: Date;
    endTime: Date;
    priority: 'urgent' | 'high' | 'normal';
  }>;
  resourceAllocation: {
    ovenUtilization: number;
    laborHours: number;
    efficiency: number;
  };
  ingredientRequirements: Record<string, number>;
  bottlenecks: Array<{
    type: 'capacity' | 'ingredient' | 'time';
    description: string;
    impact: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

export class ProductionAIService {
  /**
   * Generate optimal production schedule
   */
  async generateProductionSchedule(data: ProductionData): Promise<ProductionPlan> {
    // Sort orders by deadline (FIFO with deadline priority)
    const sortedOrders = [...data.orders].sort((a, b) => 
      a.deadline.getTime() - b.deadline.getTime()
    );

    const schedule: ProductionPlan['schedule'] = [];
    const ingredientNeeds: Record<string, number> = {};
    let currentTime = new Date();

    for (const order of sortedOrders) {
      const recipe = data.recipes.find(r => r.id === order.recipeId);
      if (!recipe) continue;

      const batchesNeeded = Math.ceil(order.quantity / recipe.batchSize);
      const productionDuration = (batchesNeeded * recipe.productionTime) / 60; // hours

      // Calculate priority based on deadline
      const hoursUntilDeadline = (order.deadline.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
      let priority: 'urgent' | 'high' | 'normal';
      
      if (hoursUntilDeadline < 24) priority = 'urgent';
      else if (hoursUntilDeadline < 48) priority = 'high';
      else priority = 'normal';

      const endTime = new Date(currentTime.getTime() + (productionDuration * 60 * 60 * 1000));

      schedule.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        batches: batchesNeeded,
        startTime: new Date(currentTime),
        endTime,
        priority
      });

      // Track ingredient requirements
      recipe.ingredients.forEach(ing => {
        if (!ingredientNeeds[ing.id]) {
          ingredientNeeds[ing.id] = 0;
        }
        ingredientNeeds[ing.id] += ing.quantity * batchesNeeded;
      });

      currentTime = endTime;
    }

    const bottlenecks = this.identifyBottlenecks(data, schedule);
    const resourceAllocation = this.calculateResourceAllocation(schedule, data.capacity);
    const recommendations = this.generateRecommendations(bottlenecks, resourceAllocation);

    return {
      schedule,
      resourceAllocation,
      ingredientRequirements: ingredientNeeds,
      bottlenecks,
      recommendations
    };
  }

  /**
   * Optimize batch sizes for efficiency
   */
  optimizeBatchSizes(
    orderQuantity: number,
    standardBatchSize: number,
    ovenCapacity: number
  ): {
    batches: number;
    totalProduction: number;
    wastePercentage: number;
    recommendation: string;
  } {
    const minBatches = Math.ceil(orderQuantity / standardBatchSize);
    const totalProduction = minBatches * standardBatchSize;
    const waste = totalProduction - orderQuantity;
    const wastePercentage = (waste / totalProduction) * 100;

    let recommendation = '';
    if (wastePercentage > 15) {
      recommendation = `High waste (${wastePercentage.toFixed(1)}%). Consider adjusting batch size or finding additional orders to utilize excess.`;
    } else if (minBatches > ovenCapacity) {
      recommendation = `Batch count (${minBatches}) exceeds oven capacity (${ovenCapacity}). Schedule multiple production runs.`;
    } else {
      recommendation = `Optimal batch configuration. Waste is acceptable at ${wastePercentage.toFixed(1)}%.`;
    }

    return {
      batches: minBatches,
      totalProduction,
      wastePercentage,
      recommendation
    };
  }

  /**
   * Calculate production cost
   */
  calculateProductionCost(
    ingredientCosts: Record<string, number>,
    laborCostPerHour: number,
    overheadCostPerHour: number,
    productionTimeHours: number
  ): {
    ingredientCost: number;
    laborCost: number;
    overheadCost: number;
    totalCost: number;
    costPerUnit: number;
  } {
    const ingredientCost = Object.values(ingredientCosts).reduce((sum, cost) => sum + cost, 0);
    const laborCost = laborCostPerHour * productionTimeHours;
    const overheadCost = overheadCostPerHour * productionTimeHours;
    const totalCost = ingredientCost + laborCost + overheadCost;

    return {
      ingredientCost,
      laborCost,
      overheadCost,
      totalCost,
      costPerUnit: totalCost // Adjust based on batch size
    };
  }

  /**
   * Suggest production improvements
   */
  suggestImprovements(
    currentEfficiency: number,
    targetEfficiency: number = 85
  ): Array<{
    area: string;
    currentState: string;
    suggestion: string;
    potentialGain: string;
  }> {
    const suggestions = [];

    if (currentEfficiency < targetEfficiency) {
      const gap = targetEfficiency - currentEfficiency;
      
      suggestions.push({
        area: 'Process Efficiency',
        currentState: `${currentEfficiency.toFixed(1)}% efficiency`,
        suggestion: 'Implement mise en place (preparation stations) to reduce setup time',
        potentialGain: `+${(gap * 0.3).toFixed(1)}% efficiency`
      });

      suggestions.push({
        area: 'Equipment Utilization',
        currentState: 'Sequential production',
        suggestion: 'Overlap preparation of next batch while current batch is baking',
        potentialGain: `+${(gap * 0.4).toFixed(1)}% efficiency`
      });

      suggestions.push({
        area: 'Staff Training',
        currentState: 'Variable skill levels',
        suggestion: 'Standardize recipes and provide training videos',
        potentialGain: `+${(gap * 0.3).toFixed(1)}% efficiency`
      });
    }

    return suggestions;
  }

  /**
   * Identify production bottlenecks
   */
  private identifyBottlenecks(
    data: ProductionData,
    schedule: ProductionPlan['schedule']
  ): ProductionPlan['bottlenecks'] {
    const bottlenecks: ProductionPlan['bottlenecks'] = [];

    // Check capacity constraints
    const totalHours = schedule.reduce((sum, item) => {
      const duration = (item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const availableHoursPerWeek = data.capacity.workHoursPerDay * data.capacity.workDaysPerWeek;

    if (totalHours > availableHoursPerWeek) {
      bottlenecks.push({
        type: 'capacity',
        description: `Production schedule requires ${totalHours.toFixed(1)} hours but only ${availableHoursPerWeek} hours available`,
        impact: 'Unable to meet all deadlines',
        suggestion: 'Consider overtime, hiring temporary staff, or outsourcing some production'
      });
    }

    // Check for urgent orders
    const urgentCount = schedule.filter(s => s.priority === 'urgent').length;
    if (urgentCount > 0) {
      bottlenecks.push({
        type: 'time',
        description: `${urgentCount} urgent orders with tight deadlines`,
        impact: 'High stress on production team, potential quality issues',
        suggestion: 'Prioritize urgent orders and consider premium pricing for rush orders'
      });
    }

    return bottlenecks;
  }

  /**
   * Calculate resource allocation
   */
  private calculateResourceAllocation(
    schedule: ProductionPlan['schedule'],
    capacity: ProductionData['capacity']
  ): ProductionPlan['resourceAllocation'] {
    const totalHours = schedule.reduce((sum, item) => {
      const duration = (item.endTime.getTime() - item.startTime.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const availableHours = capacity.workHoursPerDay * capacity.workDaysPerWeek;
    const utilizationPercentage = (totalHours / availableHours) * 100;

    return {
      ovenUtilization: Math.min(100, utilizationPercentage),
      laborHours: totalHours,
      efficiency: Math.min(100, 85 + (Math.random() * 10)) // Simulated efficiency
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    bottlenecks: ProductionPlan['bottlenecks'],
    resourceAllocation: ProductionPlan['resourceAllocation']
  ): string[] {
    const recommendations: string[] = [];

    if (bottlenecks.length > 0) {
      recommendations.push(`${bottlenecks.length} bottleneck(s) identified - review suggestions to optimize production`);
    }

    if (resourceAllocation.ovenUtilization > 90) {
      recommendations.push('High oven utilization - consider investing in additional equipment');
    } else if (resourceAllocation.ovenUtilization < 60) {
      recommendations.push('Low oven utilization - opportunity to take on more orders');
    }

    if (resourceAllocation.efficiency < 80) {
      recommendations.push('Production efficiency below target - implement process improvements');
    }

    recommendations.push('Schedule regular equipment maintenance to prevent downtime');
    recommendations.push('Consider batch production for similar recipes to reduce setup time');

    return recommendations;
  }
}

// Export singleton instance
export const productionAI = new ProductionAIService();

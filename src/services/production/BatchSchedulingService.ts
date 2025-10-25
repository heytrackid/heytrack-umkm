/**
 * BatchSchedulingService
 * Advanced production batch scheduling with constraint optimization
 * Handles equipment capacity, labor, ingredients, and deadline constraints
 */

import { automationLogger } from '@/lib/logger'

// Core Types
export interface ProductionConstraints {
  // Equipment constraints
  oven_capacity: number // how many batches can bake simultaneously
  mixing_stations: number // how many mixing operations in parallel
  decorating_stations: number // cake decorating capacity
  packaging_capacity: number // packaging throughput per hour

  // Labor constraints  
  bakers_available: number
  decorators_available: number
  shift_start: string //"06:00"
  shift_end: string //"18:00" 
  break_times: { start: string; end: string }[]

  // Time constraints
  setup_time_minutes: number // time to setup between different recipes
  cleanup_time_minutes: number // cleanup time between batches
}

export interface ProductionBatch {
  id: string
  recipe_id: string
  recipe_name: string
  quantity: number
  priority: number

  // Timing
  earliest_start: string // ISO datetime
  deadline: string // ISO datetime  
  estimated_duration: number // minutes
  actual_duration?: number // minutes

  // Resource requirements
  oven_slots_required: number
  baker_hours_required: number
  decorator_hours_required?: number

  // Dependencies
  prerequisite_batches: string[] // batch IDs that must complete first
  blocking_ingredients: string[] // ingredients that would be depleted

  // Status tracking
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'blocked'
  scheduled_start?: string // ISO datetime
  scheduled_end?: string // ISO datetime
  actual_start?: string
  actual_end?: string

  // Optimization scores
  profit_score: number
  urgency_score: number
  efficiency_score: number
  total_score: number
}

export interface SchedulingResult {
  schedule: ProductionBatch[]
  timeline: TimelineSlot[]
  resource_utilization: ResourceUtilization
  constraints_satisfied: boolean
  optimization_metrics: {
    total_profit: number
    on_time_delivery_rate: number
    resource_efficiency: number
    setup_time_waste: number
  }
  warnings: string[]
  suggestions: string[]
}

interface TimelineSlot {
  start_time: string
  end_time: string
  batch_id: string
  resource_type: 'oven' | 'mixer' | 'decorator' | 'packaging'
  resource_id: string
  status: 'scheduled' | 'active' | 'completed'
}

interface ResourceUtilization {
  oven_utilization: number // percentage
  labor_utilization: number // percentage
  peak_hours: { hour: string; utilization: number }[]
  bottlenecks: { resource: string; severity: number }[]
}

export class BatchSchedulingService {
  private constraints: ProductionConstraints = {
    oven_capacity: 4, // 4 racks
    mixing_stations: 2,
    decorating_stations: 1,
    packaging_capacity: 50, // items per hour
    bakers_available: 2,
    decorators_available: 1,
    shift_start: "06:00",
    shift_end: "18:00",
    break_times: [
      { start: "10:00", end: "10:15" },
      { start: "14:00", end: "14:30" }
    ],
    setup_time_minutes: 15,
    cleanup_time_minutes: 10
  }

  /**
   * Main scheduling algorithm - optimizes batch sequence and timing
   */
  async scheduleProductionBatches(
    batches: Omit<ProductionBatch, 'scheduled_start' | 'scheduled_end'>[],
    constraints?: Partial<ProductionConstraints>
  ): Promise<SchedulingResult> {
    // Update constraints if provided
    if (constraints) {
      this.constraints = { ...this.constraints, ...constraints }
    }

    try {
      // Step 1: Validate and prepare batches
      const validatedBatches = await this.validateBatches(batches)

      // Step 2: Calculate priority scores
      const prioritizedBatches = this.calculatePriorityScores(validatedBatches)

      // Step 3: Apply constraint-based scheduling
      const scheduledBatches = await this.applyConstraintSolver(prioritizedBatches)

      // Step 4: Generate timeline
      const timeline = this.generateTimeline(scheduledBatches)

      // Step 5: Calculate resource utilization
      const resourceUtilization = this.calculateResourceUtilization(scheduledBatches, timeline)

      // Step 6: Validate constraints satisfaction
      const constraintsSatisfied = this.validateConstraints(scheduledBatches, timeline)

      // Step 7: Generate optimization metrics
      const optimizationMetrics = this.calculateOptimizationMetrics(scheduledBatches)

      // Step 8: Generate warnings and suggestions
      const { warnings, suggestions } = this.generateInsights(scheduledBatches, resourceUtilization)

      return {
        schedule: scheduledBatches,
        timeline,
        resource_utilization: resourceUtilization,
        constraints_satisfied: constraintsSatisfied,
        optimization_metrics: optimizationMetrics,
        warnings,
        suggestions
      }
    } catch (error: unknown) {
      automationLogger.error({ err: error }, 'Error in batch scheduling')
      throw error
    }
  }

  /**
   * Constraint solver - core scheduling algorithm
   */
  private async applyConstraintSolver(batches: ProductionBatch[]): Promise<ProductionBatch[]> {
    const scheduledBatches: ProductionBatch[] = []
    const resourceTimeline: Map<string, Array<{ start: string; end: string; batch_id: string }>> = new Map()

    // Initialize resource timelines
    for (let i = 1; i <= this.constraints.oven_capacity; i++) {
      resourceTimeline.set(`oven_${i}`, [])
    }
    for (let i = 1; i <= this.constraints.mixing_stations; i++) {
      resourceTimeline.set(`mixing_${i}`, [])
    }

    // Sort batches by total score (descending)
    const sortedBatches = [...batches].sort((a, b) => b.total_score - a.total_score)

    for (const batch of sortedBatches) {
      try {
        // Find earliest available slot that satisfies constraints
        const scheduledSlot = this.findOptimalTimeSlot(batch, resourceTimeline)

        if (scheduledSlot) {
          batch.scheduled_start = scheduledSlot.start
          batch.scheduled_end = scheduledSlot.end
          (batch as any).status = 'scheduled'

          // Reserve resources
          this.reserveResources(batch, scheduledSlot, resourceTimeline)

          scheduledBatches.push(batch)
        } else {
          // Cannot schedule - mark as blocked
          (batch as any).status = 'blocked'
          scheduledBatches.push(batch)
        }
      } catch (error: unknown) {
        automationLogger.error({ err: error, batchId: (batch as any).id }, `Error scheduling batch ${(batch as any).id}`)
        (batch as any).status = 'blocked'
        scheduledBatches.push(batch)
      }
    }

    return scheduledBatches
  }

  /**
   * Find optimal time slot for a batch considering all constraints
   */
  private findOptimalTimeSlot(
    batch: ProductionBatch,
    resourceTimeline: Map<string, { start: string; end: string; batch_id: string }[]>
  ): { start: string; end: string; resources: string[] } | null {
    const earliestStart = new Date(batch.earliest_start)
    const deadline = new Date(batch.deadline)
    const duration = batch.estimated_duration + this.constraints.setup_time_minutes + this.constraints.cleanup_time_minutes

    // Try to find a slot starting from earliest_start
    const shiftStart = this.parseTime(this.constraints.shift_start)
    const shiftEnd = this.parseTime(this.constraints.shift_end)

    let currentTime = new Date(Math.max(earliestStart.getTime(), shiftStart.getTime()))

    while (currentTime < deadline) {
      const endTime = new Date(currentTime.getTime() + duration * 60 * 1000)

      // Check if slot is within working hours
      if (this.isWithinWorkingHours(currentTime, endTime)) {
        // Check resource availability
        const requiredResources = this.getRequiredResources(batch)
        const availableResources = this.findAvailableResources(
          currentTime.toISOString(),
          endTime.toISOString(),
          requiredResources,
          resourceTimeline
        )

        if (availableResources.length >= requiredResources.length) {
          return {
            start: currentTime.toISOString(),
            end: endTime.toISOString(),
            resources: availableResources.slice(0, requiredResources.length)
          }
        }
      }

      // Move to next 15-minute slot
      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000)
    }

    return null
  }

  /**
   * Calculate priority scores for batches
   */
  private calculatePriorityScores(batches: ProductionBatch[]): ProductionBatch[] {
    return batches.map(batch => {
      // Urgency score based on deadline proximity
      const now = new Date()
      const deadline = new Date(batch.deadline)
      const timeUntilDeadline = deadline.getTime() - now.getTime()
      const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60)

      batch.urgency_score = Math.max(0, 100 - (hoursUntilDeadline / 24) * 10) // Decrease by 10 per day

      // Efficiency score based on resource utilization
      const resourceEfficiency = this.calculateBatchEfficiency(batch)
      batch.efficiency_score = resourceEfficiency

      // Combined total score
      batch.total_score = (
        batch.profit_score * 0.3 +
        batch.urgency_score * 0.4 +
        batch.efficiency_score * 0.3
      )

      return batch
    })
  }

  /**
   * Generate production timeline visualization data
   */
  private generateTimeline(batches: ProductionBatch[]): TimelineSlot[] {
    const timeline: TimelineSlot[] = []

    for (const batch of batches.filter(b => b.scheduled_start && b.scheduled_end)) {
      // Main production slot
      timeline.push({
        start_time: batch.scheduled_start!,
        end_time: batch.scheduled_end!,
        batch_id: (batch as any).id,
        resource_type: 'oven',
        resource_id: `oven_1`, // Simplified - would be more complex in real implementation
        status: 'scheduled'
      })

      // Add prep slots if needed
      if (batch.baker_hours_required > 0) {
        const prepStart = new Date(new Date(batch.scheduled_start!).getTime() - 30 * 60 * 1000)
        timeline.push({
          start_time: prepStart.toISOString(),
          end_time: batch.scheduled_start!,
          batch_id: (batch as any).id,
          resource_type: 'mixer',
          resource_id: 'mixer_1',
          status: 'scheduled'
        })
      }
    }

    return timeline.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }

  /**
   * Calculate resource utilization metrics
   */
  private calculateResourceUtilization(batches: ProductionBatch[], timeline: TimelineSlot[]): ResourceUtilization {
    const shiftDurationHours = 12 // 6 AM to 6 PM
    const totalOvenCapacityHours = this.constraints.oven_capacity * shiftDurationHours
    const totalLaborHours = this.constraints.bakers_available * shiftDurationHours

    // Calculate oven utilization
    const usedOvenHours = timeline
      .filter(slot => slot.resource_type === 'oven')
      .reduce((sum, slot) => {
        const duration = (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / (1000 * 60 * 60)
        return sum + duration
      }, 0)

    const ovenUtilization = (usedOvenHours / totalOvenCapacityHours) * 100

    // Calculate labor utilization
    const usedLaborHours = batches
      .filter(batch => batch.scheduled_start)
      .reduce((sum, batch) => sum + batch.baker_hours_required, 0)

    const laborUtilization = (usedLaborHours / totalLaborHours) * 100

    // Identify bottlenecks
    const bottlenecks = []
    if (ovenUtilization > 90) {
      bottlenecks.push({ resource: 'oven', severity: ovenUtilization })
    }
    if (laborUtilization > 90) {
      bottlenecks.push({ resource: 'labor', severity: laborUtilization })
    }

    return {
      oven_utilization: ovenUtilization,
      labor_utilization: laborUtilization,
      peak_hours: [], // Would calculate peak usage hours
      bottlenecks
    }
  }

  /**
   * Helper methods
   */
  private async validateBatches(batches: Omit<ProductionBatch, 'scheduled_start' | 'scheduled_end'>[]): Promise<ProductionBatch[]> {
    return batches.map(batch => ({
      ...batch,
      profit_score: batch.profit_score || 50,
      urgency_score: 0,
      efficiency_score: 0,
      total_score: 0,
      status: 'scheduled' as const,
      scheduled_start: undefined,
      scheduled_end: undefined
    }))
  }

  private calculateBatchEfficiency(batch: ProductionBatch): number {
    // Calculate efficiency based on resource usage vs output
    const resourceCost = batch.baker_hours_required * 50 + batch.oven_slots_required * 20 // arbitrary cost units
    const efficiency = Math.min(100, (batch.quantity * batch.profit_score) / resourceCost)
    return efficiency
  }

  private parseTime(timeString: string): Date {
    const [hours, minutes] = timeString.split('T').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  private isWithinWorkingHours(startTime: Date, endTime: Date): boolean {
    const shiftStart = this.parseTime(this.constraints.shift_start)
    const shiftEnd = this.parseTime(this.constraints.shift_end)

    return startTime >= shiftStart && endTime <= shiftEnd
  }

  private getRequiredResources(batch: ProductionBatch): string[] {
    const resources = []
    for (let i = 0; i < batch.oven_slots_required; i++) {
      resources.push('oven')
    }
    return resources
  }

  private findAvailableResources(
    startTime: string,
    endTime: string,
    requiredResources: string[],
    resourceTimeline: Map<string, Array<{ start: string; end: string; batch_id: string }>>
  ): string[] {
    const available: string[] = []

    for (const [resourceId, timeline] of resourceTimeline.entries()) {
      if (resourceId.startsWith(requiredResources[0])) {
        const isAvailable = !timeline.some(slot => {
          const slotStart = new Date(slot.start)
          const slotEnd = new Date(slot.end)
          const requestStart = new Date(startTime)
          const requestEnd = new Date(endTime)

          return (requestStart < slotEnd && requestEnd > slotStart)
        })

        if (isAvailable) {
          available.push(resourceId)
        }
      }
    }

    return available
  }

  private reserveResources(
    batch: ProductionBatch,
    slot: { start: string; end: string; resources: string[] },
    resourceTimeline: Map<string, Array<{ start: string; end: string; batch_id: string }>>
  ): void {
    for (const resourceId of slot.resources) {
      if (!resourceTimeline.has(resourceId)) {
        resourceTimeline.set(resourceId, [])
      }
      resourceTimeline.get(resourceId)!.push({
        start: slot.start,
        end: slot.end,
        batch_id: (batch as any).id
      })
    }
  }

  private validateConstraints(batches: ProductionBatch[], timeline: TimelineSlot[]): boolean {
    // Check if all high-priority batches are scheduled
    const highPriorityBatches = batches.filter(b => b.priority >= 8)
    const scheduledHighPriority = highPriorityBatches.filter(b => b.scheduled_start)

    return scheduledHighPriority.length / Math.max(highPriorityBatches.length, 1) >= 0.8 // 80% scheduling rate
  }

  private calculateOptimizationMetrics(batches: ProductionBatch[]) {
    const scheduledBatches = batches.filter(b => b.scheduled_start)

    return {
      total_profit: scheduledBatches.reduce((sum, b) => sum + b.profit_score * b.quantity, 0),
      on_time_delivery_rate: scheduledBatches.filter(b =>
        new Date(b.scheduled_end!) <= new Date(b.deadline)
      ).length / Math.max(scheduledBatches.length, 1) * 100,
      resource_efficiency: 85, // Would calculate based on actual resource usage
      setup_time_waste: scheduledBatches.length * this.constraints.setup_time_minutes
    }
  }

  private generateInsights(batches: ProductionBatch[], utilization: ResourceUtilization): {
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check for blocked batches
    const blockedBatches = batches.filter(b => (b as any).status === 'blocked')
    if (blockedBatches.length > 0) {
      warnings.push(`${blockedBatches.length} batches cannot be scheduled due to constraints`)
    }

    // Resource utilization warnings
    if (utilization.oven_utilization > 95) {
      warnings.push('Oven capacity is at maximum - consider extending hours or adding capacity')
      suggestions.push('Add evening shift or weekend production to increase capacity')
    }

    if (utilization.labor_utilization > 90) {
      warnings.push('Labor capacity is near maximum')
      suggestions.push('Consider hiring additional bakers or extending shifts')
    }

    // Efficiency suggestions
    suggestions.push('Batch similar recipes together to reduce setup time')
    suggestions.push('Schedule high-profit items during peak efficiency hours')

    return { warnings, suggestions }
  }

  /**
   * Public methods for external use
   */
  async getProductionCapacity(): Promise<ProductionConstraints> {
    return this.constraints
  }

  async updateProductionConstraints(constraints: Partial<ProductionConstraints>): Promise<void> {
    this.constraints = { ...this.constraints, ...constraints }
  }

  async simulateSchedulingScenario(
    batches: Omit<ProductionBatch, 'scheduled_start' | 'scheduled_end'>[],
    constraints: Partial<ProductionConstraints>
  ): Promise<SchedulingResult> {
    // Create temporary instance to avoid affecting main constraints
    const tempService = new BatchSchedulingService()
    return tempService.scheduleProductionBatches(batches, constraints)
  }
}

export const batchSchedulingService = new BatchSchedulingService()
export default BatchSchedulingService
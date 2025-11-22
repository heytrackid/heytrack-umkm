import { dbLogger } from '@/lib/logger'
import type { Insert, Json, Row, Update } from '@/types/database'
import { getErrorMessage, hasKey, isRecord, safeGet, typed } from '@/types/type-utilities'
import { createClient } from '@/utils/supabase/server'
import { PricingAssistantService } from '@/services/orders/PricingAssistantService'
import 'server-only'

type JsonValue = Json



/**
 * Production Batch Service
 * Manages production batch creation and order linking
 * SERVER-ONLY: Uses server client for database operations
 */


/* -------------------------------------------------------------------------- */
/*  DOMAIN TYPES                                                              */
/* -------------------------------------------------------------------------- */

type Recipe = Row<'recipes'>
type Order = Row<'orders'>
type OrderItem = Row<'order_items'>

type OrderItemWithRecipe = OrderItem & {
  recipe: Recipe | null
}
type OrderItemWithBoth = OrderItem & {
  recipe: Recipe | null
  order: Order | null
}

/* -------------------------------------------------------------------------- */
/*  TYPE GUARDS                                                               */
/* -------------------------------------------------------------------------- */


function isOrderItemWithRecipe(item: JsonValue): item is OrderItemWithRecipe {
  return isRecord(item) && hasKey(item, 'recipe_id') && hasKey(item, 'recipe')
}

function isOrderItemWithBoth(item: JsonValue): item is OrderItemWithBoth {
  return isRecord(item) && hasKey(item, 'recipe') && hasKey(item, 'order')
}

export class ProductionBatchService {
  /**
   * Create production batch from confirmed orders
   * Groups orders by recipe for efficient batch production
   */
  static async createBatchFromOrders(
    orderIds: string[],
    userId: string,
    _plannedDate?: string
  ): Promise<{
    success: boolean
    batch_id?: string
    message: string
  }> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get all order items from the specified orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          recipe_id,
          quantity,
          order_id,
          recipe:recipes (
            id,
            name,
            cost_per_unit
          )
        `)
        .in('order_id', orderIds)

      if (itemsError || !orderItems || orderItems.length === 0) {
        return {
          success: false,
          message: 'No order items found for the specified orders'
        }
      }

      // Group by recipe and sum quantities
      const recipeGroups = new Map<string, {
        recipe_id: string
        recipe_name: string
        total_quantity: number
        cost_per_unit: number
        order_count: number
      }>()

      // Filter and validate items
      const validItems = orderItems.filter(isOrderItemWithRecipe)

      for (const item of validItems) {
        const {recipe} = item
        if (!recipe) {continue}

        const existing = recipeGroups.get(item.recipe_id)
        if (existing) {
          existing.total_quantity += item.quantity
          existing.order_count += 1
        } else {
          recipeGroups.set(item.recipe_id, {
            recipe_id: item.recipe_id,
            recipe_name: recipe.name,
            total_quantity: item.quantity,
            cost_per_unit: safeGet(recipe, 'cost_per_unit') ?? 0,
            order_count: 1
          })
        }
      }

      // Create production batch for the most needed recipe
      // In a real system, you might create multiple batches
      const batches = Array.from(recipeGroups.values())
      const primaryBatch = batches.sort((a, b) => b.total_quantity - a.total_quantity)[0]

      if (!primaryBatch) {
        return {
          success: false,
          message: 'No valid recipes found for batch creation'
        }
      }

      // Validate inventory availability for the production batch
      try {
        const inventoryValidation = await PricingAssistantService.validateOrderInventory(
          [{ recipe_id: primaryBatch.recipe_id, quantity: primaryBatch.total_quantity }],
          userId
        )

        if (!inventoryValidation.valid) {
          return {
            success: false,
            message: `Insufficient inventory for production batch: ${inventoryValidation.items.find(i => i.shortfall > 0)?.ingredientName || 'Unknown ingredient'} (shortfall: ${inventoryValidation.items.find(i => i.shortfall > 0)?.shortfall || 0})`
          }
        }

        dbLogger.info({
          batchRecipe: primaryBatch.recipe_name,
          quantity: primaryBatch.total_quantity,
          inventoryValid: inventoryValidation.valid,
          lowStockWarnings: inventoryValidation.lowStockWarnings.length
        }, 'Production batch inventory validation passed')
      } catch (validationError) {
        dbLogger.error({ error: validationError }, 'Inventory validation failed for production batch')
        return {
          success: false,
          message: 'Failed to validate inventory for production batch'
        }
      }

      // Create production batch
      const productionData: Insert<'productions'> = {
        recipe_id: primaryBatch.recipe_id,
        quantity: primaryBatch.total_quantity,
        cost_per_unit: primaryBatch.cost_per_unit,
        total_cost: primaryBatch.cost_per_unit * primaryBatch.total_quantity,
        labor_cost: 0, // To be filled during production
        status: 'PLANNED',
        user_id: userId,
        notes: `Auto-created from ${orderIds.length} order(s)`
      }

      const { data: production, error: prodError } = await supabase
        .from('productions')
        .insert(productionData)
        .select('id')
        .single()

      if (prodError || !production) {
        dbLogger.error({ error: prodError }, 'Failed to create production batch')
        return {
          success: false,
          message: 'Failed to create production batch'
        }
      }

      // Note: production_batch_id doesn't exist in orders table
      // Orders are linked to batches through order_items -> recipes -> productions relationship

      dbLogger.info({
        batchId: production.id,
        recipeId: primaryBatch.recipe_id,
        quantity: primaryBatch.total_quantity,
        orderCount: orderIds.length
      }, 'Production batch created from orders')

      return {
        success: true,
        batch_id: production.id,
        message: `Production batch created for ${primaryBatch.recipe_name} (${primaryBatch.total_quantity} units from ${orderIds.length} orders)`
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to create batch from orders')
      return {
        success: false,
        message: getErrorMessage(error)
      }
    }
  }

  /**
   * Get suggested batches based on pending/confirmed orders
   */
  static async getSuggestedBatches(userId: string): Promise<Array<{
    recipe_id: string
    recipe_name: string
    total_quantity: number
    order_count: number
    estimated_cost: number
    priority: 'HIGH' | 'LOW' | 'MEDIUM'
    supplier_lead_time_days?: number
  }>> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // Get all pending/confirmed orders without production batch
      const { data: orderItems, error } = await supabase
        .from('order_items')
          .select(`
          recipe_id,
          quantity,
          order:orders!inner (
            id,
            status,
            delivery_date
          ),
          recipe:recipes (
            id,
            name,
            cost_per_unit,
            recipe_ingredients (
              ingredient:ingredients (
                id,
                supplier,
                suppliers (
                  lead_time_days
                )
              )
            )
          )
        `)
        .eq('order.user_id', userId)
        .in('order.status', ['PENDING', 'CONFIRMED', 'IN_PROGRESS'])

      if (error || !orderItems || orderItems.length === 0) {
        return []
      }

      // Group by recipe
      const recipeGroups = new Map<string, {
        recipe_id: string
        recipe_name: string
        total_quantity: number
        order_count: number
        estimated_cost: number
        urgent_count: number
        earliest_delivery: string | null
        max_supplier_lead_time: number
      }>()

      // Filter and validate items
      const validItems = orderItems.filter(isOrderItemWithBoth)

      for (const item of validItems) {
        const {recipe} = item
        const {order} = item
        if (!recipe || !order) {continue}

        // Calculate maximum supplier lead time for this recipe
        let maxLeadTimeDays = 0
        const recipeIngredients = (recipe as { recipe_ingredients?: unknown[] }).recipe_ingredients || []
        for (const ri of recipeIngredients) {
          const riTyped = ri as { ingredient?: { suppliers?: { lead_time_days?: number } } }
          if (riTyped.ingredient?.suppliers?.lead_time_days) {
            maxLeadTimeDays = Math.max(maxLeadTimeDays, riTyped.ingredient.suppliers.lead_time_days)
          }
        }

        const existing = recipeGroups.get(item.recipe_id)
        // production_priority doesn't exist in orders table, skip this check
        const isUrgent = false

        if (existing) {
          existing.total_quantity += item.quantity
          existing.order_count += 1
          existing.estimated_cost += (safeGet(recipe, 'cost_per_unit') ?? 0) * item.quantity
          if (isUrgent) {existing.urgent_count += 1}
          const deliveryDate = safeGet(order, 'delivery_date')
          if (deliveryDate && typeof deliveryDate === 'string' && (!existing.earliest_delivery || deliveryDate < existing.earliest_delivery)) {
            existing.earliest_delivery = deliveryDate
          }
          // Update max lead time
          existing.max_supplier_lead_time = Math.max(existing.max_supplier_lead_time || 0, maxLeadTimeDays)
        } else {
          const deliveryDate = safeGet(order, 'delivery_date')
          recipeGroups.set(item.recipe_id, {
            recipe_id: item.recipe_id,
            recipe_name: recipe.name,
            total_quantity: item.quantity,
            order_count: 1,
            estimated_cost: (recipe.cost_per_unit ?? 0) * item.quantity,
            urgent_count: isUrgent ? 1 : 0,
            earliest_delivery: typeof deliveryDate === 'string' ? deliveryDate : null,
            max_supplier_lead_time: maxLeadTimeDays
          })
        }
      }

      // Convert to array and determine priority
      const suggestions = Array.from(recipeGroups.values()).map(group => {
        let priority: 'HIGH' | 'LOW' | 'MEDIUM' = 'LOW'

        // Consider supplier lead time in priority calculation
        const now = new Date()
        let productionDeadline: Date | null = null

        if (group.earliest_delivery) {
          // Production should start at least lead_time_days before delivery
          const deliveryDate = new Date(group.earliest_delivery)
          productionDeadline = new Date(deliveryDate.getTime() - (group.max_supplier_lead_time || 0) * 24 * 60 * 60 * 1000)
        }

        // High priority if:
        // - Many urgent orders
        // - Many orders (>= 3)
        // - Production deadline is within 2 days (considering lead time)
        const daysUntilDeadline = productionDeadline ? (productionDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) : null
        const isUrgentDueToLeadTime = daysUntilDeadline !== null && daysUntilDeadline <= 2

        if (group.urgent_count > 0 || group.order_count >= 3 || isUrgentDueToLeadTime) {
          priority = 'HIGH'
        } else if (group.order_count >= 2) {
          priority = 'MEDIUM'
        }

        dbLogger.debug({
          recipeId: group.recipe_id,
          leadTimeDays: group.max_supplier_lead_time,
          earliestDelivery: group.earliest_delivery,
          productionDeadline: productionDeadline?.toISOString(),
          daysUntilDeadline,
          isUrgentDueToLeadTime,
          finalPriority: priority
        }, 'Production suggestion priority calculation')

        return {
          recipe_id: group.recipe_id,
          recipe_name: group.recipe_name,
          total_quantity: group.total_quantity,
          order_count: group.order_count,
          estimated_cost: group.estimated_cost,
          priority,
          supplier_lead_time_days: group.max_supplier_lead_time
        }
      })

      // Sort by priority and quantity
      return suggestions.sort((a, b) => {
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        if (priorityDiff !== 0) {return priorityDiff}
        return b.total_quantity - a.total_quantity
      })

    } catch (error) {
      dbLogger.error({ error }, 'Failed to get suggested batches')
      return []
    }
  }

  /**
    * Complete production batch and update actual costs
    * Automatically creates financial records for production expenses
    * Includes quality control feedback for supplier performance tracking
    */
  static async completeBatch(
    batchId: string,
    userId: string,
    actualCosts: {
      material_cost?: number
      labor_cost?: number
      overhead_cost?: number
    },
    qualityMetrics?: {
      quality_score?: number // 1-10 scale
      defects_count?: number
      notes?: string
    }
  ): Promise<{
    success: boolean
    message: string
  }> {
    try {
      const client = await createClient()

      const supabase = typed(client)

      // First, get the current production batch data
      const { data: currentBatch, error: fetchError } = await supabase
        .from('productions')
        .select('*, recipe:recipes(name)')
        .eq('id', batchId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !currentBatch) {
        dbLogger.error({ error: fetchError }, 'Failed to fetch production batch')
        return {
          success: false,
          message: 'Production batch not found'
        }
      }

      const updateData: Update<'productions'> = {
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        labor_cost: actualCosts.labor_cost ?? 0,
        actual_labor_cost: actualCosts.labor_cost ?? 0,
        actual_material_cost: actualCosts.material_cost ?? 0,
        actual_overhead_cost: actualCosts.overhead_cost ?? 0,
        actual_total_cost: (actualCosts.material_cost ?? 0) + (actualCosts.labor_cost ?? 0) + (actualCosts.overhead_cost ?? 0),
        batch_status: qualityMetrics?.quality_score ? (qualityMetrics.quality_score >= 7 ? 'PASSED' : 'FAILED') : 'COMPLETED',
        notes: qualityMetrics?.notes ? (currentBatch.notes ? `${currentBatch.notes}\nQuality Notes: ${qualityMetrics.notes}` : `Quality Notes: ${qualityMetrics.notes}`) : currentBatch.notes,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('productions')
        .update(updateData)
        .eq('id', batchId)
        .eq('user_id', userId)

      if (error) {
        dbLogger.error({ error }, 'Failed to complete batch')
        return {
          success: false,
          message: 'Failed to complete production batch'
        }
      }

      // Create financial records for production costs
      const completionDate = new Date().toISOString()
      const batchReference = `PRODUCTION-${batchId.slice(-8)}`

      // 1. Material costs (if provided)
      if (actualCosts.material_cost && actualCosts.material_cost > 0) {
        const materialRecord = {
          type: 'EXPENSE' as const,
          category: 'Material Produksi',
          amount: actualCosts.material_cost,
          description: `Biaya Material - ${currentBatch.recipe?.name || 'Produksi'} (Batch ${batchId.slice(-8)})`,
          reference: `${batchReference}-MATERIAL`,
          date: completionDate,
          user_id: userId,
          created_by: userId,
          updated_by: userId
        }

        const { error: materialError } = await supabase
          .from('financial_records')
          .insert(materialRecord)

        if (materialError) {
          dbLogger.error({ error: materialError }, 'Failed to create material cost financial record')
          // Don't fail the whole operation for financial record creation
        }
      }

      // 2. Labor costs (if provided)
      if (actualCosts.labor_cost && actualCosts.labor_cost > 0) {
        const laborRecord = {
          type: 'EXPENSE' as const,
          category: 'Tenaga Kerja',
          amount: actualCosts.labor_cost,
          description: `Biaya Tenaga Kerja - ${currentBatch.recipe?.name || 'Produksi'} (Batch ${batchId.slice(-8)})`,
          reference: `${batchReference}-LABOR`,
          date: completionDate,
          user_id: userId,
          created_by: userId,
          updated_by: userId
        }

        const { error: laborError } = await supabase
          .from('financial_records')
          .insert(laborRecord)

        if (laborError) {
          dbLogger.error({ error: laborError }, 'Failed to create labor cost financial record')
          // Don't fail the whole operation for financial record creation
        }
      }

      // 3. Overhead costs (if provided)
      if (actualCosts.overhead_cost && actualCosts.overhead_cost > 0) {
        const overheadRecord = {
          type: 'EXPENSE' as const,
          category: 'Overhead Produksi',
          amount: actualCosts.overhead_cost,
          description: `Biaya Overhead - ${currentBatch.recipe?.name || 'Produksi'} (Batch ${batchId.slice(-8)})`,
          reference: `${batchReference}-OVERHEAD`,
          date: completionDate,
          user_id: userId,
          created_by: userId,
          updated_by: userId
        }

        const { error: overheadError } = await supabase
          .from('financial_records')
          .insert(overheadRecord)

        if (overheadError) {
          dbLogger.error({ error: overheadError }, 'Failed to create overhead cost financial record')
          // Don't fail the whole operation for financial record creation
        }
      }

      // Update supplier performance based on quality metrics
      if (qualityMetrics && (qualityMetrics.quality_score || qualityMetrics.defects_count)) {
        try {
          await this.updateSupplierPerformanceFromQuality(
            currentBatch.recipe_id,
            userId,
            qualityMetrics
          )
        } catch (supplierError) {
          dbLogger.error({ error: supplierError }, 'Failed to update supplier performance')
          // Don't fail the whole operation for supplier updates
        }
      }

      dbLogger.info({
        batchId,
        costs: actualCosts,
        qualityScore: qualityMetrics?.quality_score,
        recipeName: currentBatch.recipe?.name
      }, 'Production batch completed with financial records and quality feedback')

      return {
        success: true,
        message: 'Production batch completed successfully with cost allocation and quality tracking'
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to complete batch')
      return {
        success: false,
        message: 'Unexpected error completing batch'
      }
    }
  }

  /**
   * Update supplier performance based on production quality metrics
   */
  private static async updateSupplierPerformanceFromQuality(
    recipeId: string,
    userId: string,
    qualityMetrics: {
      quality_score?: number
      defects_count?: number
      notes?: string
    }
  ): Promise<void> {
    try {
      const client = await createClient()
      const supabase = typed(client)

      // Get recipe ingredients with supplier information
      const { data: recipeIngredients, error } = await supabase
        .from('recipe_ingredients')
        .select(`
          ingredient:ingredients (
            supplier,
            suppliers!inner (
              id,
              name,
              rating,
              total_orders
            )
          )
        `)
        .eq('recipe_id', recipeId)

      if (error || !recipeIngredients) {
        dbLogger.warn({ error }, 'Failed to fetch recipe ingredients for supplier update')
        return
      }

      // Determine if there are quality issues
      const hasQualityIssues = (
        (qualityMetrics.quality_score && qualityMetrics.quality_score < 7) ||
        (qualityMetrics.defects_count && qualityMetrics.defects_count > 0)
      )

      if (!hasQualityIssues) {
        dbLogger.info({ recipeId }, 'No quality issues detected, skipping supplier performance update')
        return
      }

      // Update supplier ratings for ingredients that may have caused quality issues
      const suppliersToUpdate = new Set<string>()

      for (const ri of recipeIngredients) {
        if (ri.ingredient?.suppliers?.[0]?.id) {
          suppliersToUpdate.add(ri.ingredient.suppliers[0].id)
        }
      }

      for (const supplierId of suppliersToUpdate) {
        // Get current supplier data
        const { data: supplier, error: supplierError } = await supabase
          .from('suppliers')
          .select('rating, total_orders')
          .eq('id', supplierId)
          .eq('user_id', userId)
          .single()

        if (supplierError || !supplier) {
          dbLogger.warn({ supplierId, error: supplierError }, 'Failed to fetch supplier for rating update')
          continue
        }

        // Calculate new rating (reduce rating for quality issues)
        const currentRating = supplier.rating || 5.0
        const totalOrders = supplier.total_orders || 1
        const qualityPenalty = 0.2 // Reduce rating by 0.2 for quality issues

        // Weighted average: new rating considers quality feedback
        const newRating = Math.max(1.0, Math.min(5.0,
          (currentRating * totalOrders + (currentRating - qualityPenalty)) / (totalOrders + 1)
        ))

        // Update supplier rating
        const { error: updateError } = await supabase
          .from('suppliers')
          .update({
            rating: Math.round(newRating * 10) / 10, // Round to 1 decimal
            total_orders: totalOrders + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', supplierId)
          .eq('user_id', userId)

        if (updateError) {
          dbLogger.error({ supplierId, error: updateError }, 'Failed to update supplier rating')
        } else {
          dbLogger.info({
            supplierId,
            oldRating: currentRating,
            newRating,
            qualityIssues: true
          }, 'Supplier rating updated due to quality issues')
        }
      }

    } catch (error) {
      dbLogger.error({ error }, 'Failed to update supplier performance from quality metrics')
      throw error
    }
  }
}

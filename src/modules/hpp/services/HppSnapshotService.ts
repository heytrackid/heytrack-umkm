/**
 * HPP Snapshot Service
 * Handles daily snapshots of HPP calculations for trend analysis
 */

import { dbLogger } from '@/lib/logger'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { HPP_CONFIG } from '@/lib/constants/hpp-config'
import type { Database } from '@/types/supabase-generated'

type HppSnapshot = Database['public']['Tables']['hpp_snapshots']['Row']
type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']

export class HppSnapshotService {
  private logger = dbLogger

  /**
   * Create daily snapshot for a recipe
   */
  async createSnapshot(recipeId: string): Promise<HppSnapshot> {
    try {
      this.logger.info({ recipeId }, 'Creating HPP snapshot for recipe')

      const supabase = createServiceRoleClient()

      // Get latest HPP calculation
      const { data: calculation, error: calcError } = await supabase
        .from('hpp_calculations')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single()

      if (calcError || !calculation) {
        throw new Error(`No HPP calculation found for recipe ${recipeId}`)
      }

      // Get recipe details for selling price
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('selling_price, margin_percentage')
        .eq('id', recipeId)
        .single()

      if (recipeError) {
        throw new Error(`Failed to fetch recipe: ${recipeError.message}`)
      }

      // Create snapshot
      const snapshotData = {
        recipe_id: recipeId,
        snapshot_date: new Date().toISOString().split('T')[0],
        hpp_value: calculation.total_hpp,
        material_cost: calculation.material_cost,
        labor_cost: calculation.labor_cost,
        overhead_cost: calculation.overhead_cost,
        selling_price: recipe?.selling_price || null,
        margin_percentage: recipe?.margin_percentage || null,
        notes: 'Daily automated snapshot'
      }

      const { data: snapshot, error: snapshotError } = await supabase
        .from('hpp_snapshots')
        .insert(snapshotData)
        .select()
        .single()

      if (snapshotError) {
        throw new Error(`Failed to create snapshot: ${snapshotError.message}`)
      }

      this.logger.info({ recipeId }, 'HPP snapshot created for recipe')
      return snapshot as HppSnapshot

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to create HPP snapshot for recipe ${recipeId}`)
      throw err
    }
  }

  /**
   * Create snapshots for all active recipes
   */
  async createDailySnapshots(): Promise<{ success: number; failed: number }> {
    try {
      this.logger.info('Creating daily HPP snapshots for all recipes')

      const supabase = createServiceRoleClient()

      // Get all active recipes
      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`)
      }

      let success = 0
      let failed = 0

      for (const recipe of recipes || []) {
        try {
          await this.createSnapshot(recipe.id)
          success++
        } catch (err) {
          this.logger.error({ error: err, recipeId: recipe.id }, 'Failed to create snapshot')
          failed++
        }
      }

      this.logger.info({ success, failed }, 'Daily HPP snapshots completed')
      return { success, failed }

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to create daily HPP snapshots')
      throw err
    }
  }

  /**
   * Get snapshots for a recipe within date range
   */
  async getSnapshots(
    recipeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HppSnapshot[]> {
    try {
      const supabase = createServiceRoleClient()
      
      let query = supabase
        .from('hpp_snapshots')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('snapshot_date', { ascending: false })

      if (startDate) {
        query = query.gte('snapshot_date', startDate)
      }

      if (endDate) {
        query = query.lte('snapshot_date', endDate)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to fetch snapshots: ${error.message}`)
      }

      return (data || []) as HppSnapshot[]

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to get snapshots for recipe ${recipeId}`)
      throw err
    }
  }

  /**
   * Archive old snapshots (older than configured retention days)
   */
  async archiveOldSnapshots(): Promise<number> {
    try {
      this.logger.info('Archiving old HPP snapshots')

      const supabase = createServiceRoleClient()

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - HPP_CONFIG.SNAPSHOT_RETENTION_DAYS)
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('hpp_snapshots')
        .delete()
        .lt('snapshot_date', cutoffDateStr)
        .select()

      if (error) {
        throw new Error(`Failed to archive snapshots: ${error.message}`)
      }

      const archivedCount = data?.length || 0
      this.logger.info({ archivedCount, cutoffDate: cutoffDateStr }, 'Old HPP snapshots archived')
      return archivedCount

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to archive old snapshots')
      throw err
    }
  }
}

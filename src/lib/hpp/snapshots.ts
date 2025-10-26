/**
 * HPP Snapshots Module
 * Snapshot creation, retrieval and comparison for HPP tracking
 */

import { createClient } from '@/utils/supabase/client'
import { dbLogger } from '@/lib/logger'
import { HPPCalculator } from './calculator'
import type { HPPComparison, HPPSnapshot } from './types'

export class HPPSnapshotManager {
  /**
   * Create HPP snapshot for a recipe
   */
  static async createSnapshot(recipeId: string, userId: string): Promise<HPPSnapshot> {
    try {
      const hppResult = await HPPCalculator.calculateHPP(recipeId, userId)

      const supabase = createClient()

      // Get recipe name
      const { data: recipe } = await supabase
        .from('recipes')
        .select('name')
        .eq('id', recipeId)
        .single()

      const snapshot: Omit<HPPSnapshot, 'id'> = {
        recipe_id: recipeId,
        recipe_name: recipe?.name || 'Unknown Recipe',
        user_id: userId,
        total_hpp: hppResult.total_hpp,
        material_cost: hppResult.material_cost,
        operational_cost: hppResult.operational_cost,
        breakdown: hppResult.breakdown,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('hpp_snapshots')
        .insert(snapshot)
        .select()
        .single()

      if (error) throw error

      dbLogger.info({ recipeId, snapshotId: data.id }, 'HPP snapshot created')
      return data
    } catch (error) {
      dbLogger.error({ error: error instanceof Error ? error.message : String(error), recipeId, userId }, 'Failed to create HPP snapshot')
      throw error
    }
  }

  /**
   * Get snapshots for a recipe
   */
  static async getSnapshots(recipeId: string, userId: string, limit: number = 10): Promise<HPPSnapshot[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('hpp_snapshots')
      .select('*')
      .eq('recipe_id', recipeId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  /**
   * Compare HPP snapshots
   */
  static compareSnapshots(current: HPPSnapshot, previous: HPPSnapshot): HPPComparison {
    const changeAmount = current.total_hpp - previous.total_hpp
    const changePercentage = (changeAmount / previous.total_hpp) * 100

    return {
      recipe_id: current.recipe_id,
      recipe_name: current.recipe_name,
      current_hpp: current.total_hpp,
      previous_hpp: previous.total_hpp,
      change_percentage: changePercentage,
      change_amount: changeAmount,
      trend: changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'stable',
      period: 'latest'
    }
  }
}

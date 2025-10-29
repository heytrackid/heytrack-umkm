/**
 * HPP Alert Service
 * Detects and manages HPP-related alerts
 * SERVER-ONLY: Uses service role client for automated tasks
 */

import 'server-only'
import { dbLogger } from '@/lib/logger'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { HPP_CONFIG } from '@/lib/constants/hpp-config'
import type { Database } from '@/types/supabase-generated'

type HppAlert = Database['public']['Tables']['hpp_alerts']['Row']
type HppAlertInsert = Database['public']['Tables']['hpp_alerts']['Insert']

export class HppAlertService {
  private logger = dbLogger

  /**
   * Detect alerts for a specific recipe
   */
  async detectAlertsForRecipe(recipeId: string): Promise<HppAlert[]> {
    try {
      this.logger.info({ recipeId }, 'Detecting HPP alerts for recipe')

      const supabase = createServiceRoleClient()
      const alerts: HppAlert[] = []

      // Get latest and previous snapshots
      const { data: snapshots, error } = await supabase
        .from('hpp_snapshots')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('snapshot_date', { ascending: false })
        .limit(2)

      if (error) {
        throw new Error(`Failed to fetch snapshots: ${error.message}`)
      }

      if (!snapshots || snapshots.length < 2) {
        return alerts // Not enough data for comparison
      }

      const [current, previous] = snapshots

      // Check for price increase
      const priceIncrease = (current.hpp_value - previous.hpp_value) / previous.hpp_value
      if (priceIncrease > HPP_CONFIG.ALERTS.PRICE_INCREASE_THRESHOLD) {
        alerts.push(await this.createAlert({
          recipe_id: recipeId,
          alert_type: 'PRICE_INCREASE',
          severity: priceIncrease > HPP_CONFIG.ALERTS.PRICE_INCREASE_CRITICAL ? 'HIGH' : 'MEDIUM',
          title: 'Kenaikan Biaya Produksi',
          message: `Biaya produksi naik ${(priceIncrease * 100).toFixed(1)}% dari ${previous.hpp_value} ke ${current.hpp_value}`,
          new_value: current.hpp_value,
          old_value: previous.hpp_value,
          threshold: HPP_CONFIG.ALERTS.PRICE_INCREASE_THRESHOLD,
          change_percentage: priceIncrease
        }))
      }

      // Check for low margin
      if (current.margin_percentage && current.margin_percentage < HPP_CONFIG.ALERTS.MARGIN_LOW_THRESHOLD) {
        alerts.push(await this.createAlert({
          recipe_id: recipeId,
          alert_type: 'MARGIN_LOW',
          severity: current.margin_percentage < HPP_CONFIG.ALERTS.MARGIN_CRITICAL_THRESHOLD ? 'CRITICAL' : 'MEDIUM',
          title: 'Margin Keuntungan Rendah',
          message: `Margin keuntungan rendah: ${(current.margin_percentage * 100).toFixed(1)}%`,
          new_value: current.margin_percentage,
          threshold: HPP_CONFIG.ALERTS.MARGIN_LOW_THRESHOLD
        }))
      }

      // Check for cost spike
      const costSpike = (current.material_cost - previous.material_cost) / previous.material_cost
      if (costSpike > HPP_CONFIG.ALERTS.COST_SPIKE_THRESHOLD) {
        alerts.push(await this.createAlert({
          recipe_id: recipeId,
          alert_type: 'COST_SPIKE',
          severity: 'HIGH',
          title: 'Lonjakan Biaya Bahan',
          message: `Biaya bahan naik drastis ${(costSpike * 100).toFixed(1)}%`,
          new_value: current.material_cost,
          old_value: previous.material_cost,
          threshold: HPP_CONFIG.ALERTS.COST_SPIKE_THRESHOLD,
          change_percentage: costSpike
        }))
      }

      this.logger.info({ recipeId, alertCount: alerts.length }, 'HPP alerts detected')
      return alerts

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to detect alerts for recipe ${recipeId}`)
      throw err
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(alertData: HppAlertInsert): Promise<HppAlert> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('hpp_alerts')
        .insert({
          ...alertData,
          is_read: false
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create alert: ${error.message}`)
      }

      return data

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to create alert')
      throw err
    }
  }

  /**
   * Detect alerts for all active recipes
   */
  async detectAlertsForAllRecipes(): Promise<{ success: number; failed: number; totalAlerts: number }> {
    try {
      this.logger.info('Detecting HPP alerts for all recipes')

      const supabase = createServiceRoleClient()

      const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id')
        .eq('is_active', true)

      if (error) {
        throw new Error(`Failed to fetch recipes: ${error.message}`)
      }

      let success = 0
      let failed = 0
      let totalAlerts = 0

      for (const recipe of recipes || []) {
        try {
          const alerts = await this.detectAlertsForRecipe(recipe.id)
          totalAlerts += alerts.length
          success++
        } catch (err) {
          this.logger.error({ error: err, recipeId: recipe.id }, 'Failed to detect alerts')
          failed++
        }
      }

      this.logger.info({ success, failed, totalAlerts }, 'HPP alert detection completed')
      return { success, failed, totalAlerts }

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to detect alerts for all recipes')
      throw err
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string): Promise<void> {
    try {
      const supabase = createServiceRoleClient()
      
      const { error } = await supabase
        .from('hpp_alerts')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) {
        throw new Error(`Failed to mark alert as read: ${error.message}`)
      }

      this.logger.info({ alertId }, 'Alert marked as read')

    } catch (err: unknown) {
      this.logger.error({ error: err }, `Failed to mark alert ${alertId} as read`)
      throw err
    }
  }

  /**
   * Mark all alerts as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('hpp_alerts')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select()

      if (error) {
        throw new Error(`Failed to mark all alerts as read: ${error.message}`)
      }

      const count = data?.length || 0
      this.logger.info({ userId, count }, 'All alerts marked as read')
      return count

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to mark all alerts as read')
      throw err
    }
  }

  /**
   * Get unread alerts for a user
   */
  async getUnreadAlerts(userId: string, limit = 10): Promise<HppAlert[]> {
    try {
      const supabase = createServiceRoleClient()
      
      const { data, error } = await supabase
        .from('hpp_alerts')
        .select(`
          *,
          recipes:recipe_id (
            name
          )
        `)
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to fetch unread alerts: ${error.message}`)
      }

      return (data || []).map((alert: HppAlert & { recipes?: { name?: string } }) => ({
        ...alert,
        recipe_name: alert.recipes?.name
      })) as HppAlert[]

    } catch (err: unknown) {
      this.logger.error({ error: err }, 'Failed to get unread alerts')
      throw err
    }
  }
}

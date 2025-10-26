/**
 * HPP Cron Jobs Module
 * Scheduled jobs for HPP calculations and alerts
 */

import { createServiceRoleClient } from '@/utils/supabase'
import { cronLogger } from '@/lib/logger'
import { calculateHPP, detectHPPAlerts, takeSnapshot, getSnapshots } from '../hpp'
import type { AutomationStatus } from './types'

export class HPPCronJobs {
  /**
   * Create daily HPP snapshots for all recipes
   */
  static async createDailyHPPSnapshots(): Promise<{ snapshotsCreated: number }> {
    try {
      cronLogger.info({}, 'Starting daily HPP snapshots')

      const supabase = createServiceRoleClient()

      // Get all active recipes
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id, name, user_id')
        .eq('is_active', true)

      if (!recipes || recipes.length === 0) {
        cronLogger.info({}, 'No active recipes found')
        return { snapshotsCreated: 0 }
      }

      let snapshotsCreated = 0

      // Create snapshots for each recipe
      for (const recipe of recipes) {
        try {
          await takeSnapshot(recipe.id, recipe.user_id)
          snapshotsCreated++
        } catch (error) {
          cronLogger.error({
            error: error instanceof Error ? error.message : String(error),
            recipeId: recipe.id
          }, 'Error creating HPP snapshot for recipe')
        }
      }

      cronLogger.info({}, 'Daily HPP snapshots completed', { snapshotsCreated })
      return { snapshotsCreated }

    } catch (error) {
      cronLogger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error in daily HPP snapshots')
      throw error
    }
  }

  /**
   * Detect HPP alerts for all users
   */
  static async detectHPPAlertsForAllUsers(): Promise<{ usersProcessed: number; alertsGenerated: number }> {
    try {
      cronLogger.info({}, 'Starting HPP alerts detection for all users')

      const supabase = createServiceRoleClient()

      // Get all active users (simplified - in reality, you'd have a users table)
      const { data: recipes } = await supabase
        .from('recipes')
        .select('user_id')
        .eq('is_active', true)

      if (!recipes || recipes.length === 0) {
        return { usersProcessed: 0, alertsGenerated: 0 }
      }

      const userIds = [...new Set(recipes.map(r => r.user_id))]
      let totalAlerts = 0

      for (const userId of userIds) {
        try {
          const result = await detectHPPAlerts(userId)
          totalAlerts += result.alerts.length
        } catch (error) {
          cronLogger.error({
            error: error instanceof Error ? error.message : String(error),
            userId
          }, 'Error detecting HPP alerts for user')
        }
      }

      cronLogger.info({}, 'HPP alerts detection completed', {
        usersProcessed: userIds.length,
        alertsGenerated: totalAlerts
      })

      return { usersProcessed: userIds.length, alertsGenerated: totalAlerts }

    } catch (error) {
      cronLogger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error in HPP alerts detection')
      throw error
    }
  }

  /**
   * Archive old HPP snapshots (keep last 90 days)
   */
  static async archiveOldHPPSnapshots(): Promise<{ snapshotsDeleted: number }> {
    try {
      cronLogger.info({}, 'Starting HPP snapshots cleanup')

      const supabase = createServiceRoleClient()
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const { data, error } = await supabase
        .from('hpp_snapshots')
        .delete()
        .lt('snapshot_date', ninetyDaysAgo.toISOString())
        .select('id')

      if (error) {
        throw error
      }

      const deletedCount = data?.length || 0
      cronLogger.info({}, 'HPP snapshots cleanup completed', { snapshotsDeleted: deletedCount })

      return { snapshotsDeleted: deletedCount }

    } catch (error) {
      cronLogger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error cleaning up HPP snapshots')
      throw error
    }
  }
}

/**
 * HPP Cron Jobs
 * Scheduled tasks for HPP calculations, snapshots, and alerts
 */

import { cronLogger } from '@/lib/logger'
import type { AutomationEngineResult } from './types'
import { HppSnapshotService } from '@/modules/hpp/services/HppSnapshotService'
import { HppAlertService } from '@/modules/hpp/services/HppAlertService'
import { HppCalculatorService } from '@/services/hpp/HppCalculatorService'

export class HPPCronJobs {
  /**
   * Create daily HPP snapshots for all active recipes
   * Runs: Daily at midnight
   */
  static async createDailyHPPSnapshots(): Promise<AutomationEngineResult> {
    const startTime = Date.now()
    cronLogger.info('Starting daily HPP snapshots creation')

    try {
      const snapshotService = new HppSnapshotService()
      const result = await snapshotService.createDailySnapshots()
      
      const duration = Date.now() - startTime
      
      cronLogger.info({
        duration,
        status: 'success',
        ...result
      }, 'Daily HPP snapshots completed')

      return {
        success: true,
        message: 'Daily HPP snapshots created successfully',
        data: {
          snapshotsCreated: result.success,
          recipesProcessed: result.success + result.failed,
          failed: result.failed,
          duration
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime
      cronLogger.error({ error: err, duration }, 'Failed to create daily HPP snapshots')

      return {
        success: false,
        message: 'Failed to create daily HPP snapshots',
        error: err instanceof Error ? err.message : 'Unknown error',
        data: { duration }
      }
    }
  }

  /**
   * Detect HPP alerts for all users
   * Runs: Every 5 minutes
   */
  static async detectHPPAlertsForAllUsers(): Promise<AutomationEngineResult> {
    const startTime = Date.now()
    cronLogger.info('Starting HPP alert detection')

    try {
      const alertService = new HppAlertService()
      const result = await alertService.detectAlertsForAllRecipes()
      
      const duration = Date.now() - startTime
      
      cronLogger.info({
        duration,
        status: 'success',
        ...result
      }, 'HPP alert detection completed')

      return {
        success: true,
        message: 'HPP alerts detected successfully',
        data: {
          alertsCreated: result.totalAlerts,
          recipesChecked: result.success,
          failed: result.failed,
          duration
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime
      cronLogger.error({ error: err, duration }, 'Failed to detect HPP alerts')

      return {
        success: false,
        message: 'Failed to detect HPP alerts',
        error: err instanceof Error ? err.message : 'Unknown error',
        data: { duration }
      }
    }
  }

  /**
   * Archive old HPP snapshots
   * Runs: Weekly
   */
  static async archiveOldHPPSnapshots(): Promise<AutomationEngineResult> {
    const startTime = Date.now()
    cronLogger.info('Starting HPP snapshots archival')

    try {
      const snapshotService = new HppSnapshotService()
      const archivedCount = await snapshotService.archiveOldSnapshots()
      
      const duration = Date.now() - startTime
      
      cronLogger.info({
        duration,
        status: 'success',
        archivedCount
      }, 'HPP snapshots archival completed')

      return {
        success: true,
        message: 'Old HPP snapshots archived successfully',
        data: {
          snapshotsArchived: archivedCount,
          duration
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime
      cronLogger.error({ error: err, duration }, 'Failed to archive HPP snapshots')

      return {
        success: false,
        message: 'Failed to archive HPP snapshots',
        error: err instanceof Error ? err.message : 'Unknown error',
        data: { duration }
      }
    }
  }

  /**
   * Recalculate HPP for specific recipe
   */
  static async recalculateRecipeHPP(recipeId: string, userId: string): Promise<AutomationEngineResult> {
    const startTime = Date.now()
    cronLogger.info({ recipeId, userId }, 'Starting HPP recalculation for recipe')

    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      const calculatorService = new HppCalculatorService()
      const result = await calculatorService.calculateRecipeHpp(supabase, recipeId, userId)
      
      const duration = Date.now() - startTime
      
      cronLogger.info({
        recipeId,
        duration,
        status: 'success',
        totalHpp: result.totalHpp
      }, 'HPP recalculation completed')

      return {
        success: true,
        message: 'HPP recalculated successfully',
        data: {
          recipeId,
          totalHpp: result.totalHpp,
          duration
        }
      }
    } catch (err) {
      const duration = Date.now() - startTime
      cronLogger.error({ error: err, recipeId, duration }, 'Failed to recalculate HPP')

      return {
        success: false,
        message: 'Failed to recalculate HPP',
        error: err instanceof Error ? err.message : 'Unknown error',
        data: { recipeId, duration }
      }
    }
  }
}

/**
 * HPP Alerts Module
 * Alert detection and management for HPP changes
 */

import { createClient } from '@/utils/supabase/client'
import { dbLogger } from '@/lib/logger'
import type { AlertDetectionResult, HPPAlert } from './types'

export class HPPAlertDetector {
  /**
   * Detect HPP alerts for all users
   */
  static async detectHPPAlerts(userId: string): Promise<AlertDetectionResult> {
    const supabase = createClient()

    try {
      // Get recent snapshots
      const { data: snapshots, error } = await supabase
        .from('hpp_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const alerts: HPPAlert[] = []
      const processedSnapshots = new Set()

      for (const snapshot of snapshots || []) {
        if (processedSnapshots.has(snapshot.recipe_id)) continue
        processedSnapshots.add(snapshot.recipe_id)

        // Get previous snapshot for comparison
        const previousSnapshot = snapshots.find(s =>
          s.recipe_id === snapshot.recipe_id &&
          s.created_at < snapshot.created_at
        )

        if (previousSnapshot) {
          const changePercentage = ((snapshot.total_hpp - previousSnapshot.total_hpp) / previousSnapshot.total_hpp) * 100

          if (Math.abs(changePercentage) > 5) { // Alert if change > 5%
            alerts.push({
              id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              recipe_id: snapshot.recipe_id,
              recipe_name: snapshot.recipe_name,
              change_percentage: changePercentage,
              change_amount: snapshot.total_hpp - previousSnapshot.total_hpp,
              severity: Math.abs(changePercentage) > 20 ? 'critical' : Math.abs(changePercentage) > 10 ? 'high' : 'medium',
              created_at: new Date().toISOString(),
              is_read: false
            })
          }
        }
      }

      // Save alerts to database
      if (alerts.length > 0) {
        const { error: insertError } = await supabase
          .from('hpp_alerts')
          .insert(alerts)

        if (insertError) {
          dbLogger.error({ error: insertError, alertsCount: alerts.length }, 'Failed to save HPP alerts')
        }
      }

      return {
        alerts,
        snapshots_analyzed: snapshots?.length || 0
      }
    } catch (error) {
      dbLogger.error({ error: error instanceof Error ? error.message : String(error), userId }, 'HPP alert detection failed')
      throw error
    }
  }
}

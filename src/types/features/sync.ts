/**
 * Sync Feature Types
 * Re-exported from Supabase generated types
 */

import type { Database } from '@/types/supabase-generated'
import type { Json } from '../shared/common'

// Re-export table types from generated
export type SyncEventsTable = Database['public']['Tables']['sync_events']
export type SystemMetricsTable = Database['public']['Tables']['system_metrics']
export type RecentSyncEventsView = Database['public']['Views']['recent_sync_events']

// Convenience aliases
export type SyncEvent = SyncEventsTable['Row']
export type SyncEventInsert = SyncEventsTable['Insert']
export type SyncEventUpdate = SyncEventsTable['Update']

export type SystemMetric = SystemMetricsTable['Row']
export type SystemMetricInsert = SystemMetricsTable['Insert']
export type SystemMetricUpdate = SystemMetricsTable['Update']

// Business logic types (not table types)
export interface SyncEventWithMetadata extends SyncEvent {
  entity_name?: string
  seconds_ago?: number
}

export interface SystemMetricWithStatus extends SystemMetric {
  status_label: 'normal' | 'warning' | 'critical'
}

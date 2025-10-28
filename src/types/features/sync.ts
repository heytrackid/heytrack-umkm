import type { Json } from '../shared/common'

// Sync events types
export interface SyncEvent {
  id: string
  event_type: 'inventory_updated' | 'recipe_created' | 'recipe_updated' | 'order_created' | 'order_updated' | 'customer_created' | 'stock_consumed' | 'order_cancelled'
  entity_type: 'ingredient' | 'recipe' | 'order' | 'customer' | 'order_item'
  entity_id: string
  data: Json
  metadata?: Json
  sync_status: 'pending' | 'processed' | 'failed'
  created_at: string
  processed_at?: string
}

// Sync tables
export interface SyncEventsTable {
  Row: {
    created_at: string | null
    data: Json
    entity_id: string
    entity_type: string
    event_type: string
    id: string
    metadata: Json | null
    processed_at: string | null
    sync_status: string | null
  }
  Insert: {
    created_at?: string | null
    data?: Json
    entity_id: string
    entity_type: string
    event_type: string
    id?: string
    metadata?: Json | null
    processed_at?: string | null
    sync_status?: string | null
  }
  Update: {
    created_at?: string | null
    data?: Json
    entity_id?: string
    entity_type?: string
    event_type?: string
    id?: string
    metadata?: Json | null
    processed_at?: string | null
    sync_status?: string | null
  }
  Relationships: []
}

export interface SystemMetricsTable {
  Row: {
    id: string
    metadata: Json | null
    metric_name: string
    metric_type: string
    metric_value: number
    recorded_at: string | null
    status: string | null
    unit: string | null
  }
  Insert: {
    id?: string
    metadata?: Json | null
    metric_name: string
    metric_type: string
    metric_value?: number
    recorded_at?: string | null
    status?: string | null
    unit?: string | null
  }
  Update: {
    id?: string
    metadata?: Json | null
    metric_name?: string
    metric_type?: string
    metric_value?: number
    recorded_at?: string | null
    status?: string | null
    unit?: string | null
  }
  Relationships: []
}

// System metrics types
export interface SystemMetric {
  id: string
  metric_type: 'sync_health' | 'data_consistency' | 'performance' | 'error_rate'
  metric_name: string
  metric_value: number
  unit?: string
  status: 'normal' | 'warning' | 'critical'
  metadata?: Json
  recorded_at: string
}

// Sync-related views
export interface RecentSyncEventsView {
  Row: {
    created_at: string | null
    data: Json | null
    entity_id: string | null
    entity_name: string | null
    entity_type: string | null
    event_type: string | null
    id: string | null
    metadata: Json | null
    processed_at: string | null
    seconds_ago: number | null
    sync_status: string | null
  }
  Relationships: []
}

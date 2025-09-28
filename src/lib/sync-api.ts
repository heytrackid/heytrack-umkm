import { supabase } from '@/lib/supabase'
import type { 
  SyncEvent, 
  SyncEventInsert, 
  SystemMetric, 
  SystemMetricInsert, 
  InventoryStockLog,
  InventoryStockLogInsert 
} from '@/types/database'

// Sync Events API
export const syncEventApi = {
  // Get recent sync events
  async getRecentEvents(limit = 20) {
    const { data, error } = await supabase
      .from('sync_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as SyncEvent[]
  },

  // Get events by type
  async getEventsByType(eventType: string, limit = 10) {
    const { data, error } = await supabase
      .from('sync_events')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as SyncEvent[]
  },

  // Get events by entity
  async getEventsByEntity(entityType: string, entityId: string, limit = 10) {
    const { data, error } = await supabase
      .from('sync_events')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as SyncEvent[]
  },

  // Create sync event
  async createEvent(event: SyncEventInsert) {
    const { data, error } = await supabase
      .from('sync_events')
      .insert(event)
      .select()
      .single()
    
    if (error) throw error
    return data as SyncEvent
  },

  // Mark event as processed
  async markProcessed(id: string) {
    const { data, error } = await supabase
      .from('sync_events')
      .update({
        sync_status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as SyncEvent
  },

  // Get pending events count
  async getPendingCount() {
    const { count, error } = await supabase
      .from('sync_events')
      .select('*', { count: 'exact', head: true })
      .eq('sync_status', 'pending')
    
    if (error) throw error
    return count || 0
  }
}

// System Metrics API
export const systemMetricsApi = {
  // Get latest metrics
  async getLatestMetrics(metricType?: string) {
    let query = supabase
      .from('system_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })

    if (metricType) {
      query = query.eq('metric_type', metricType)
    }

    const { data, error } = await query.limit(20)
    
    if (error) throw error
    return data as SystemMetric[]
  },

  // Record new metric
  async recordMetric(metric: SystemMetricInsert) {
    const { data, error } = await supabase
      .from('system_metrics')
      .insert(metric)
      .select()
      .single()
    
    if (error) throw error
    return data as SystemMetric
  },

  // Get sync health status
  async getSyncHealth() {
    const { data, error } = await supabase
      .from('system_metrics')
      .select('*')
      .eq('metric_type', 'sync_health')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data as SystemMetric | null
  }
}

// Inventory Stock Logs API
export const inventoryStockLogsApi = {
  // Get stock logs for ingredient
  async getLogsForIngredient(ingredientId: string, limit = 20) {
    const { data, error } = await supabase
      .from('inventory_stock_logs')
      .select(`
        *,
        ingredient:ingredients(name)
      `)
      .eq('ingredient_id', ingredientId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Get recent stock changes
  async getRecentChanges(limit = 20) {
    const { data, error } = await supabase
      .from('inventory_stock_logs')
      .select(`
        *,
        ingredient:ingredients(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // Log stock change
  async logStockChange(log: InventoryStockLogInsert) {
    const { data, error } = await supabase
      .from('inventory_stock_logs')
      .insert(log)
      .select()
      .single()
    
    if (error) throw error
    return data as InventoryStockLog
  }
}

// Real-time Sync Dashboard Data API
export const syncDashboardApi = {
  // Get comprehensive dashboard data
  async getDashboardData() {
    try {
      const [syncEvents, systemHealth, inventoryStatus, recentOrders] = await Promise.all([
        syncEventApi.getRecentEvents(10),
        systemMetricsApi.getSyncHealth(),
        supabase.rpc('get_sync_dashboard_data').single(),
        supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              recipe:recipes(name)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      return {
        syncEvents: syncEvents || [],
        systemHealth,
        inventoryStatus: inventoryStatus.data || null,
        recentOrders: recentOrders.data || [],
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      throw error
    }
  },

  // Get sync statistics
  async getSyncStats() {
    const [totalEvents, pendingEvents, failedEvents] = await Promise.all([
      supabase
        .from('sync_events')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('sync_events')
        .select('*', { count: 'exact', head: true })
        .eq('sync_status', 'pending'),
      supabase
        .from('sync_events')
        .select('*', { count: 'exact', head: true })
        .eq('sync_status', 'failed')
    ])

    return {
      totalEvents: totalEvents.count || 0,
      pendingEvents: pendingEvents.count || 0,
      failedEvents: failedEvents.count || 0,
      processedEvents: (totalEvents.count || 0) - (pendingEvents.count || 0) - (failedEvents.count || 0)
    }
  }
}

// Real-time subscription helpers
export const subscribeToSyncEvents = (callback: (event: any) => void) => {
  const channel = supabase
    .channel('sync_events_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sync_events'
      },
      callback
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export const subscribeToInventoryChanges = (callback: (event: any) => void) => {
  const channel = supabase
    .channel('inventory_changes_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ingredients'
      },
      callback
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// Helper function to test sync system
export const testSyncSystem = async () => {
  try {
    // Create a test sync event
    const testEvent = await syncEventApi.createEvent({
      event_type: 'inventory_updated',
      entity_type: 'ingredient',
      entity_id: '00000000-0000-0000-0000-000000000000', // dummy ID
      data: { test: 'sync_system_test', timestamp: new Date().toISOString() },
      metadata: { source: 'test_function' }
    })

    // Record system health metric
    await systemMetricsApi.recordMetric({
      metric_type: 'sync_health',
      metric_name: 'system_test',
      metric_value: 100,
      unit: 'percent',
      status: 'normal',
      metadata: { test: true }
    })

    return {
      success: true,
      testEvent,
      message: 'Sync system test completed successfully'
    }
  } catch (error) {
    console.error('Sync system test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sync system test failed'
    }
  }
}
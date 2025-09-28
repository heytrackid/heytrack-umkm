# 🔌 Real-Time Sync API Documentation

## Overview

This document describes the API interface for the Real-Time Data Synchronization system. The API provides comprehensive access to sync events, system health metrics, and inventory tracking.

## 📚 API Modules

### 1. Sync Events API (`syncEventApi`)

#### `getRecentEvents(limit?: number): Promise<SyncEvent[]>`
Retrieves recent sync events ordered by creation time.

```typescript
const events = await syncEventApi.getRecentEvents(20)
console.log('Recent Events:', events)
```

**Parameters:**
- `limit` (optional): Number of events to retrieve (default: 20)

**Returns:** Array of `SyncEvent` objects

#### `getEventsByType(eventType: string, limit?: number): Promise<SyncEvent[]>`
Retrieves sync events filtered by event type.

```typescript
const inventoryEvents = await syncEventApi.getEventsByType('inventory_updated', 10)
```

**Parameters:**
- `eventType`: Event type to filter by
  - `'inventory_updated'`
  - `'recipe_created'`
  - `'recipe_updated'`
  - `'order_created'`
  - `'order_updated'`
  - `'customer_created'`
  - `'stock_consumed'`
  - `'order_cancelled'`
- `limit` (optional): Number of events to retrieve (default: 10)

#### `getEventsByEntity(entityType: string, entityId: string, limit?: number): Promise<SyncEvent[]>`
Retrieves sync events for a specific entity.

```typescript
const ingredientEvents = await syncEventApi.getEventsByEntity(
  'ingredient', 
  'uuid-here', 
  10
)
```

**Parameters:**
- `entityType`: Type of entity ('ingredient', 'recipe', 'order', 'customer', 'order_item')
- `entityId`: UUID of the entity
- `limit` (optional): Number of events to retrieve (default: 10)

#### `createEvent(event: SyncEventInsert): Promise<SyncEvent>`
Creates a new sync event manually.

```typescript
const event = await syncEventApi.createEvent({
  event_type: 'inventory_updated',
  entity_type: 'ingredient',
  entity_id: 'ingredient-uuid',
  data: { name: 'Flour', current_stock: 50 },
  metadata: { source: 'manual_update' }
})
```

#### `markProcessed(id: string): Promise<SyncEvent>`
Marks a sync event as processed.

```typescript
await syncEventApi.markProcessed('event-uuid')
```

#### `getPendingCount(): Promise<number>`
Gets the count of pending sync events.

```typescript
const pendingCount = await syncEventApi.getPendingCount()
console.log(`${pendingCount} events pending`)
```

### 2. System Metrics API (`systemMetricsApi`)

#### `getLatestMetrics(metricType?: string): Promise<SystemMetric[]>`
Retrieves latest system health metrics.

```typescript
// Get all metrics
const allMetrics = await systemMetricsApi.getLatestMetrics()

// Get specific metric type
const syncHealthMetrics = await systemMetricsApi.getLatestMetrics('sync_health')
```

**Parameters:**
- `metricType` (optional): Filter by metric type
  - `'sync_health'`
  - `'data_consistency'`
  - `'performance'`
  - `'error_rate'`

#### `recordMetric(metric: SystemMetricInsert): Promise<SystemMetric>`
Records a new system metric.

```typescript
const metric = await systemMetricsApi.recordMetric({
  metric_type: 'sync_health',
  metric_name: 'event_processing_rate',
  metric_value: 95.5,
  unit: 'percent',
  status: 'normal',
  metadata: { timestamp: Date.now() }
})
```

#### `getSyncHealth(): Promise<SystemMetric | null>`
Gets the latest sync health status.

```typescript
const health = await systemMetricsApi.getSyncHealth()
if (health) {
  console.log('System Status:', health.status)
  console.log('Health Score:', health.metric_value)
}
```

### 3. Inventory Stock Logs API (`inventoryStockLogsApi`)

#### `getLogsForIngredient(ingredientId: string, limit?: number): Promise<any[]>`
Gets stock change logs for a specific ingredient.

```typescript
const logs = await inventoryStockLogsApi.getLogsForIngredient('ingredient-uuid', 20)
logs.forEach(log => {
  console.log(`${log.change_type}: ${log.quantity_changed} ${log.ingredient.name}`)
})
```

#### `getRecentChanges(limit?: number): Promise<any[]>`
Gets recent stock changes across all ingredients.

```typescript
const recentChanges = await inventoryStockLogsApi.getRecentChanges(15)
```

#### `logStockChange(log: InventoryStockLogInsert): Promise<InventoryStockLog>`
Manually logs a stock change.

```typescript
await inventoryStockLogsApi.logStockChange({
  ingredient_id: 'ingredient-uuid',
  change_type: 'consumption',
  quantity_before: 100,
  quantity_after: 95,
  quantity_changed: -5,
  reason: 'Order fulfillment',
  reference_type: 'order',
  reference_id: 'order-uuid',
  triggered_by: 'system_automation'
})
```

### 4. Sync Dashboard API (`syncDashboardApi`)

#### `getDashboardData(): Promise<DashboardData>`
Gets comprehensive dashboard data for real-time monitoring.

```typescript
const dashboard = await syncDashboardApi.getDashboardData()

console.log('Sync Events:', dashboard.syncEvents)
console.log('System Health:', dashboard.systemHealth)
console.log('Inventory Status:', dashboard.inventoryStatus)
console.log('Recent Orders:', dashboard.recentOrders)
```

**Returns:**
```typescript
interface DashboardData {
  syncEvents: SyncEvent[]
  systemHealth: SystemMetric | null
  inventoryStatus: any
  recentOrders: any[]
  timestamp: string
}
```

#### `getSyncStats(): Promise<SyncStats>`
Gets sync system statistics.

```typescript
const stats = await syncDashboardApi.getSyncStats()

console.log('Total Events:', stats.totalEvents)
console.log('Pending Events:', stats.pendingEvents)
console.log('Failed Events:', stats.failedEvents)
console.log('Processed Events:', stats.processedEvents)
```

**Returns:**
```typescript
interface SyncStats {
  totalEvents: number
  pendingEvents: number
  failedEvents: number
  processedEvents: number
}
```

## 🔄 Real-Time Subscriptions

### `subscribeToSyncEvents(callback: Function): UnsubscribeFunction`
Subscribe to real-time sync events.

```typescript
const unsubscribe = subscribeToSyncEvents((event) => {
  console.log('New sync event:', event.new)
  
  switch (event.eventType) {
    case 'INSERT':
      handleNewSyncEvent(event.new)
      break
    case 'UPDATE':
      handleUpdatedSyncEvent(event.new)
      break
  }
})

// Cleanup subscription
return () => unsubscribe()
```

### `subscribeToInventoryChanges(callback: Function): UnsubscribeFunction`
Subscribe to real-time inventory changes.

```typescript
const unsubscribe = subscribeToInventoryChanges((event) => {
  if (event.eventType === 'UPDATE') {
    const ingredient = event.new
    console.log(`Stock updated: ${ingredient.name} = ${ingredient.current_stock}`)
    
    // Update UI with new stock levels
    updateIngredientDisplay(ingredient)
  }
})
```

## 🧪 Testing API

### `testSyncSystem(): Promise<TestResult>`
Runs a comprehensive test of the sync system.

```typescript
const result = await testSyncSystem()

if (result.success) {
  console.log('✅ Sync system is operational')
  console.log('Test Event:', result.testEvent)
} else {
  console.error('❌ Sync system test failed:', result.error)
}
```

**Returns:**
```typescript
interface TestResult {
  success: boolean
  testEvent?: SyncEvent
  error?: string
  message: string
}
```

## 📊 Database Views API

### Recipe Availability
Query recipe availability with real-time stock checking:

```typescript
const { data: recipes } = await supabase
  .from('recipe_availability')
  .select('*')

recipes.forEach(recipe => {
  console.log(`${recipe.name}: Available = ${recipe.is_available}`)
  if (!recipe.is_available) {
    console.log('Missing ingredients:', recipe.missing_ingredients)
  }
})
```

### Inventory Status
Query inventory with alert levels:

```typescript
const { data: inventory } = await supabase
  .from('inventory_status')
  .select('*')
  .neq('stock_status', 'NORMAL')

inventory.forEach(item => {
  console.log(`${item.name}: ${item.stock_status} (${item.days_remaining} days remaining)`)
})
```

### Order Summary
Query orders with customer analytics:

```typescript
const { data: orders } = await supabase
  .from('order_summary')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)

orders.forEach(order => {
  console.log(`Order ${order.order_no}: ${order.customer_full_name} (${order.customer_order_count} total orders)`)
})
```

### Recent Sync Events (View)
Query human-readable sync events:

```typescript
const { data: events } = await supabase
  .from('recent_sync_events')
  .select('*')
  .limit(20)

events.forEach(event => {
  console.log(`${event.event_type}: ${event.entity_name} (${event.seconds_ago}s ago)`)
})
```

## 🔧 Database Functions API

### Test Order Creation
```typescript
const { data: result } = await supabase
  .rpc('test_create_order', {
    p_customer_name: 'Test Customer',
    p_customer_phone: '081234567890'
  })

console.log('Order created:', result)
```

### Confirm Test Order
```typescript
const { data: result } = await supabase
  .rpc('test_confirm_order', {
    p_order_id: 'order-uuid'
  })

console.log('Order confirmed:', result)
```

### Get Dashboard Data (Function)
```typescript
const { data: dashboardData } = await supabase
  .rpc('get_sync_dashboard_data')

console.log('Dashboard data:', dashboardData)
```

## 🚨 Error Handling

### Common Error Patterns

```typescript
try {
  const events = await syncEventApi.getRecentEvents(50)
} catch (error) {
  if (error.code === 'PGRST116') {
    // No data found
    console.log('No sync events found')
  } else if (error.code === '42P01') {
    // Table doesn't exist
    console.error('Sync system not properly initialized')
  } else {
    // Other database errors
    console.error('Database error:', error.message)
  }
}
```

### Retry Logic for Failed Sync Events

```typescript
async function retryFailedEvents(maxRetries = 3) {
  const failedEvents = await syncEventApi.getEventsByType('failed')
  
  for (const event of failedEvents) {
    let retryCount = 0
    let success = false
    
    while (retryCount < maxRetries && !success) {
      try {
        await processSyncEvent(event)
        await syncEventApi.markProcessed(event.id)
        success = true
      } catch (error) {
        retryCount++
        console.log(`Retry ${retryCount}/${maxRetries} for event ${event.id}`)
        
        if (retryCount >= maxRetries) {
          console.error(`Failed to process event ${event.id} after ${maxRetries} retries`)
        }
      }
    }
  }
}
```

## 📈 Performance Optimization

### Batch Operations
```typescript
// Batch create multiple sync events
async function batchCreateSyncEvents(events: SyncEventInsert[]) {
  const { data, error } = await supabase
    .from('sync_events')
    .insert(events)
    .select()
  
  if (error) throw error
  return data as SyncEvent[]
}

// Usage
const events = [
  { event_type: 'inventory_updated', entity_type: 'ingredient', entity_id: 'id1', data: {} },
  { event_type: 'recipe_updated', entity_type: 'recipe', entity_id: 'id2', data: {} }
]

await batchCreateSyncEvents(events)
```

### Connection Pooling
```typescript
// Use connection pooling for high-frequency operations
const createPooledClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { 'x-application': 'bakery-sync' },
    },
  })
}
```

## 🔐 Security Best Practices

### Row Level Security (RLS) Policies
The sync system respects RLS policies:

```sql
-- Enable RLS on sync tables
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Users can view sync events" ON sync_events 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert for system operations
CREATE POLICY "System can insert sync events" ON sync_events 
  FOR INSERT WITH CHECK (true);
```

### API Key Management
```typescript
// Use appropriate keys for different operations
const clientConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // For client-side
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!, // For server-side admin operations
}
```

---

## 📋 Type Definitions

### Core Types
```typescript
interface SyncEvent {
  id: string
  event_type: 'inventory_updated' | 'recipe_created' | 'recipe_updated' | 'order_created' | 'order_updated' | 'customer_created' | 'stock_consumed' | 'order_cancelled'
  entity_type: 'ingredient' | 'recipe' | 'order' | 'customer' | 'order_item'
  entity_id: string
  data: any
  metadata?: any
  sync_status: 'pending' | 'processed' | 'failed'
  created_at: string
  processed_at?: string | null
}

interface SystemMetric {
  id: string
  metric_type: 'sync_health' | 'data_consistency' | 'performance' | 'error_rate'
  metric_name: string
  metric_value: number
  unit?: string | null
  status: 'normal' | 'warning' | 'critical'
  metadata?: any
  recorded_at: string
}

interface InventoryStockLog {
  id: string
  ingredient_id: string
  change_type: 'increase' | 'decrease' | 'adjustment' | 'consumption'
  quantity_before: number
  quantity_after: number
  quantity_changed: number
  reason?: string | null
  reference_type?: string | null
  reference_id?: string | null
  triggered_by?: string | null
  metadata?: any
  created_at: string
}
```

---

**Built with ❤️ by HeyTrack Team**

*Complete API reference for real-time bakery synchronization*
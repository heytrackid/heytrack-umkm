# Notification System - HeyTrack

Sistem notifikasi real-time untuk HeyTrack dengan notification bell, real-time updates via Supabase, dan integrasi dengan berbagai modul.

## 📋 Features

✅ **Notification Bell** - Icon bell dengan badge unread count  
✅ **Real-time Updates** - Supabase real-time subscription  
✅ **Categorized Notifications** - Inventory, Orders, Production, Finance, System  
✅ **Priority Levels** - Low, Normal, High, Urgent  
✅ **Action URLs** - Click notification untuk navigate ke detail  
✅ **Mark as Read/Dismiss** - Individual atau bulk actions  
✅ **Expiration** - Auto-cleanup expired notifications  
✅ **Mobile Optimized** - Responsive design dengan text wrapping  

## 🗄️ Database Schema

Table `notifications` sudah ada dengan struktur:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR CHECK (type IN ('info', 'warning', 'error', 'success', 'alert')),
  category VARCHAR CHECK (category IN ('inventory', 'orders', 'production', 'finance', 'system')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  entity_type VARCHAR,
  entity_id UUID,
  action_url VARCHAR,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);
```

## 📁 File Structure

```
src/
├── components/
│   └── notifications/
│       ├── NotificationBell.tsx       # Main bell component
│       └── NotificationList.tsx       # Notification list UI
├── modules/
│   ├── notifications/
│   │   └── services/
│   │       └── NotificationService.ts # Core notification service
│   └── inventory/
│       └── services/
│           └── InventoryNotificationService.ts # Inventory-specific notifications
├── hooks/
│   └── useNotifications.ts            # React hook for notifications
├── types/
│   └── domain/
│       └── notifications.ts           # Type definitions
├── lib/
│   └── validations/
│       └── domains/
│           └── notification.ts        # Zod schemas
└── app/
    └── api/
        └── notifications/
            ├── route.ts               # GET, POST /api/notifications
            ├── [id]/route.ts          # PUT /api/notifications/[id]
            └── mark-all-read/route.ts # POST /api/notifications/mark-all-read
```

## 🎨 Components

### NotificationBell

Main notification bell component dengan badge unread count.

```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell'

// Usage in header
<NotificationBell />
```

**Features:**
- Real-time badge update
- Popover dengan notification list
- Auto-refresh setiap 30 detik
- Supabase real-time subscription

### NotificationList

List component untuk menampilkan notifications.

```tsx
<NotificationList
  notifications={notifications}
  isLoading={isLoading}
  onMarkAllRead={handleMarkAllRead}
  onNotificationUpdate={handleNotificationUpdate}
  onRefresh={fetchNotifications}
/>
```

**Features:**
- Filter: All / Unread
- Mark as read/dismiss individual
- Mark all as read
- Click to navigate
- Priority color coding
- Category icons
- Relative time display (Indonesian)

## 🔌 API Routes

### GET /api/notifications

Fetch user notifications.

**Query Parameters:**
- `unread_only` (boolean) - Filter unread only
- `category` (string) - Filter by category
- `limit` (number) - Limit results (default: 50)

**Response:**
```json
{
  "notifications": [...],
  "unread_count": 5
}
```

### PUT /api/notifications/[id]

Update notification (mark as read/dismiss).

**Body:**
```json
{
  "is_read": true,
  "is_dismissed": false
}
```

### POST /api/notifications/mark-all-read

Mark all notifications as read.

**Body:**
```json
{
  "category": "inventory" // optional
}
```

## 🪝 React Hook

### useNotifications

Custom hook untuk manage notifications.

```tsx
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications({
    unreadOnly: false,
    category: 'inventory',
    limit: 50,
    autoRefresh: true,
    refreshInterval: 30000,
  })

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  )
}
```

## 🛠️ Services

### NotificationService

Core service untuk create dan manage notifications.

```typescript
import { NotificationService } from '@/modules/notifications/services/NotificationService'
import { createClient } from '@/utils/supabase/server'

const supabase = await createClient()
const userId = user.id

// Create custom notification
await NotificationService.createNotification(supabase, userId, {
  type: 'info',
  category: 'system',
  title: 'Welcome!',
  message: 'Welcome to HeyTrack',
  priority: 'normal',
  action_url: '/dashboard',
})

// Create low stock alert
await NotificationService.createLowStockAlert(
  supabase,
  userId,
  ingredientId,
  'Tepung Terigu',
  5, // current stock
  10  // min stock
)

// Create HPP increase alert
await NotificationService.createHppIncreaseAlert(
  supabase,
  userId,
  recipeId,
  'Roti Tawar',
  5000,  // old HPP
  6000,  // new HPP
  20     // change percentage
)

// Create new order notification
await NotificationService.createNewOrderNotification(
  supabase,
  userId,
  orderId,
  'ORD-001',
  'John Doe',
  150000
)

// Create order status notification
await NotificationService.createOrderStatusNotification(
  supabase,
  userId,
  orderId,
  'ORD-001',
  'CONFIRMED'
)

// Create production complete notification
await NotificationService.createProductionCompleteNotification(
  supabase,
  userId,
  productionId,
  'Roti Tawar',
  50
)
```

### InventoryNotificationService

Inventory-specific notification service.

```typescript
import { InventoryNotificationService } from '@/modules/inventory/services/InventoryNotificationService'

// Check and create low stock alerts for all ingredients
await InventoryNotificationService.checkLowStockAlerts(supabase, userId)

// Create out of stock alert
await InventoryNotificationService.createOutOfStockAlert(
  supabase,
  userId,
  ingredientId,
  'Tepung Terigu'
)

// Create reorder reminder
await InventoryNotificationService.createReorderReminder(
  supabase,
  userId,
  ingredientId,
  'Tepung Terigu',
  5,   // current stock
  10,  // reorder point
  50   // reorder quantity
)

// Create stock adjustment notification
await InventoryNotificationService.createStockAdjustmentNotification(
  supabase,
  userId,
  ingredientId,
  'Tepung Terigu',
  10,  // old stock
  15,  // new stock
  'Manual adjustment'
)
```

## 🔔 Notification Types

### Type (Visual Style)

- `info` - Blue, Info icon
- `warning` - Yellow, Warning triangle
- `error` - Red, Error circle
- `success` - Green, Check circle
- `alert` - Orange, Alert circle

### Category (Context)

- `inventory` - Package icon
- `orders` - Shopping cart icon
- `production` - Factory icon
- `finance` - Dollar sign icon
- `system` - Settings icon

### Priority (Border Color)

- `low` - Gray border
- `normal` - Blue border
- `high` - Orange border
- `urgent` - Red border

## 🔗 Integration Examples

### 1. Inventory - Low Stock Alert

```typescript
// In ingredient purchase/usage API route
import { InventoryNotificationService } from '@/modules/inventory/services/InventoryNotificationService'

// After stock update
const { data: ingredient } = await supabase
  .from('ingredients')
  .select('*')
  .eq('id', ingredientId)
  .single()

if (ingredient.current_stock <= ingredient.min_stock) {
  await InventoryNotificationService.createLowStockAlert(
    supabase,
    userId,
    ingredient.id,
    ingredient.name,
    ingredient.current_stock,
    ingredient.min_stock
  )
}
```

### 2. Orders - New Order

```typescript
// In POST /api/orders
import { NotificationService } from '@/modules/notifications/services/NotificationService'

// After order creation
await NotificationService.createNewOrderNotification(
  supabase,
  userId,
  order.id,
  order.order_no,
  order.customer_name,
  order.total_amount
)
```

### 3. HPP - Price Increase

```typescript
// In HPP calculation service
import { NotificationService } from '@/modules/notifications/services/NotificationService'

const oldHpp = recipe.cost_per_unit
const newHpp = calculatedHpp
const changePercentage = ((newHpp - oldHpp) / oldHpp) * 100

if (changePercentage > 10) {
  await NotificationService.createHppIncreaseAlert(
    supabase,
    userId,
    recipe.id,
    recipe.name,
    oldHpp,
    newHpp,
    changePercentage
  )
}
```

### 4. Production - Batch Complete

```typescript
// In production completion API
import { NotificationService } from '@/modules/notifications/services/NotificationService'

await NotificationService.createProductionCompleteNotification(
  supabase,
  userId,
  production.id,
  recipe.name,
  production.quantity
)
```

## 🎯 Best Practices

### 1. Avoid Notification Spam

Check if similar notification already exists:

```typescript
const { data: existing } = await supabase
  .from('notifications')
  .select('id')
  .eq('user_id', userId)
  .eq('entity_type', 'ingredient')
  .eq('entity_id', ingredientId)
  .eq('is_read', false)
  .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
  .single()

if (!existing) {
  // Create notification
}
```

### 2. Set Expiration for Time-Sensitive Notifications

```typescript
await NotificationService.createNotification(supabase, userId, {
  // ...
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
})
```

### 3. Use Metadata for Additional Context

```typescript
await NotificationService.createNotification(supabase, userId, {
  // ...
  metadata: {
    ingredient_name: 'Tepung Terigu',
    current_stock: 5,
    min_stock: 10,
    supplier: 'PT ABC',
    last_purchase_date: '2024-10-01',
  },
})
```

### 4. Provide Action URLs

```typescript
await NotificationService.createNotification(supabase, userId, {
  // ...
  action_url: `/inventory?highlight=${ingredientId}`,
})
```

## 🔄 Real-time Updates

Notifications automatically update in real-time via Supabase subscriptions:

```typescript
// In NotificationBell component
useEffect(() => {
  const supabase = createClient()
  
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
      },
      () => {
        fetchNotifications()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## 🧹 Cleanup

### Auto-cleanup Expired Notifications

```typescript
import { NotificationService } from '@/modules/notifications/services/NotificationService'

// Run periodically (e.g., daily cron job)
await NotificationService.cleanupExpiredNotifications(supabase, userId)
```

### Manual Cleanup

```sql
-- Delete expired notifications
DELETE FROM notifications
WHERE expires_at < NOW();

-- Delete old dismissed notifications (older than 30 days)
DELETE FROM notifications
WHERE is_dismissed = true
  AND updated_at < NOW() - INTERVAL '30 days';
```

## 📱 Mobile Optimization

Notifications are mobile-optimized with:

- Text wrapping (no truncation)
- Touch-friendly buttons
- Responsive layout
- Smooth animations
- Bottom sheet on mobile

## 🎨 Customization

### Custom Notification Type

```typescript
// Add to NotificationService
static async createCustomNotification(
  supabase: SupabaseClient<Database>,
  userId: string,
  params: CustomParams
): Promise<void> {
  await this.createNotification(supabase, userId, {
    type: 'info',
    category: 'system',
    title: params.title,
    message: params.message,
    // ...
  })
}
```

### Custom Icon/Color

Edit `NotificationList.tsx`:

```typescript
const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle,
  alert: AlertCircle,
  custom: CustomIcon, // Add custom icon
}

const typeColors = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  success: 'text-green-500',
  alert: 'text-orange-500',
  custom: 'text-purple-500', // Add custom color
}
```

## 🐛 Troubleshooting

### Notifications not showing

1. Check RLS policies are enabled
2. Verify user_id is set correctly
3. Check browser console for errors
4. Verify Supabase real-time is enabled

### Badge count not updating

1. Check real-time subscription is active
2. Verify `unread_count` calculation in API
3. Check for JavaScript errors in console

### Notifications not clickable

1. Verify `action_url` is set
2. Check navigation logic in `handleNotificationClick`
3. Ensure URLs are valid

## 📊 Analytics

Track notification metrics:

```typescript
// In NotificationService
apiLogger.info({
  userId,
  type: params.type,
  category: params.category,
  priority: params.priority,
}, 'Notification created')
```

Query notification stats:

```sql
-- Unread count by category
SELECT category, COUNT(*) as count
FROM notifications
WHERE user_id = 'user-id'
  AND is_read = false
  AND is_dismissed = false
GROUP BY category;

-- Notification engagement rate
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_read THEN 1 ELSE 0 END) as read_count,
  ROUND(SUM(CASE WHEN is_read THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as read_rate
FROM notifications
WHERE user_id = 'user-id';
```

## 🚀 Next Steps

1. **Email Notifications** - Send email for urgent notifications
2. **Push Notifications** - Web push API integration
3. **Notification Preferences** - User settings for notification types
4. **Notification History** - Archive and search old notifications
5. **Batch Notifications** - Group similar notifications
6. **Notification Templates** - Reusable templates for common notifications

---

**Status:** ✅ IMPLEMENTED  
**Last Updated:** October 30, 2025  
**Version:** 1.0.0

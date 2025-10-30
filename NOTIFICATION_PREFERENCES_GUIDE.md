# Notification Preferences & Advanced Features

Panduan lengkap untuk fitur notification preferences, sound, dan grouping di HeyTrack.

## 🎯 Fitur Baru yang Ditambahkan

### 1. **Notification Preferences** ✅
User bisa mengatur preferensi notifikasi sesuai kebutuhan:
- Enable/disable per kategori (Inventory, Orders, Production, Finance, System)
- Enable/disable per type (Info, Warning, Error, Success, Alert)
- Minimum priority filter
- Email notifications (coming soon)
- Quiet hours (jam tenang)

### 2. **Notification Sounds** 🔊
Sound effect untuk notifikasi baru:
- Toggle on/off suara notifikasi
- Volume control (0-100%)
- Suara berbeda untuk notifikasi normal vs urgent
- Option: hanya mainkan suara untuk notifikasi urgent
- Test sound buttons

### 3. **Notification Grouping** 📦
Pengelompokan notifikasi sejenis:
- Auto-group notifikasi dalam time window tertentu
- Configurable time window (1 min - 1 hour)
- Reduce notification spam
- Smart grouping by category + entity type

## 📊 Database Schema

### Table: `notification_preferences`

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id),
  
  -- Category preferences
  inventory_enabled BOOLEAN DEFAULT true,
  orders_enabled BOOLEAN DEFAULT true,
  production_enabled BOOLEAN DEFAULT true,
  finance_enabled BOOLEAN DEFAULT true,
  system_enabled BOOLEAN DEFAULT true,
  
  -- Type preferences
  info_enabled BOOLEAN DEFAULT true,
  warning_enabled BOOLEAN DEFAULT true,
  error_enabled BOOLEAN DEFAULT true,
  success_enabled BOOLEAN DEFAULT true,
  alert_enabled BOOLEAN DEFAULT true,
  
  -- Priority filter
  min_priority VARCHAR DEFAULT 'low',
  
  -- Sound settings
  sound_enabled BOOLEAN DEFAULT true,
  sound_volume NUMERIC DEFAULT 0.5,
  sound_for_urgent_only BOOLEAN DEFAULT false,
  
  -- Grouping settings
  group_similar_enabled BOOLEAN DEFAULT true,
  group_time_window INTEGER DEFAULT 300, -- seconds
  
  -- Email settings (future)
  email_enabled BOOLEAN DEFAULT false,
  email_digest BOOLEAN DEFAULT false,
  email_digest_frequency VARCHAR DEFAULT 'daily',
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '07:00:00',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Auto-creation:** Preferences dibuat otomatis saat user baru register via trigger.

## 🎨 UI Components

### Settings Page: `/settings/notifications`

Halaman pengaturan notifikasi dengan sections:

#### 1. Kategori Notifikasi
- Toggle untuk setiap kategori
- Deskripsi singkat per kategori
- Icon visual untuk setiap kategori

#### 2. Suara Notifikasi
- Toggle enable/disable sound
- Slider volume (0-100%)
- Test sound buttons (normal & urgent)
- Option: hanya urgent notifications

#### 3. Pengelompokan Notifikasi
- Toggle enable/disable grouping
- Dropdown time window selection
- Penjelasan cara kerja grouping

#### 4. Jam Tenang
- Toggle enable/disable quiet hours
- Time picker untuk start & end time
- Notifikasi tidak muncul di jam tenang

### Quick Link di Settings

Di halaman `/settings` ada quick link card untuk akses cepat ke notification settings.

## 🔧 API Endpoints

### GET /api/notifications/preferences

Fetch user notification preferences.

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "inventory_enabled": true,
  "orders_enabled": true,
  "sound_enabled": true,
  "sound_volume": 0.5,
  "group_similar_enabled": true,
  "group_time_window": 300,
  ...
}
```

### PUT /api/notifications/preferences

Update user notification preferences.

**Body:**
```json
{
  "sound_enabled": false,
  "sound_volume": 0.7,
  "group_time_window": 600
}
```

## 🔊 Sound System

### Sound Manager (`src/lib/notifications/sound.ts`)

Web Audio API-based notification sounds.

#### Functions:

```typescript
// Play normal notification sound
playNotificationSound(volume?: number): void

// Play urgent notification sound (double beep)
playUrgentNotificationSound(volume?: number): void

// Set sound enabled state
setSoundEnabled(enabled: boolean): void

// Set sound volume (0.0 to 1.0)
setSoundVolume(volume: number): void

// Test sounds
testNotificationSound(volume?: number): void
testUrgentSound(volume?: number): void
```

#### Sound Characteristics:

**Normal Sound:**
- Single pleasant tone
- Frequency: 800Hz → 600Hz
- Duration: 0.3 seconds
- Smooth fade in/out

**Urgent Sound:**
- Double beep pattern
- Frequency: 900Hz
- Duration: 0.35 seconds total
- More attention-grabbing

#### Usage in NotificationBell:

```typescript
// Auto-play sound when new notification arrives
if (shouldPlaySound) {
  if (latestNotif.priority === 'urgent') {
    playUrgentNotificationSound(preferences.sound_volume)
  } else {
    playNotificationSound(preferences.sound_volume)
  }
}
```

## 📦 Grouping System

### Grouping Manager (`src/lib/notifications/grouping.ts`)

Smart notification grouping to reduce spam.

#### Functions:

```typescript
// Group notifications by category + entity type + time window
groupNotifications(
  notifications: Notification[],
  timeWindowSeconds: number = 300
): GroupedNotification[]

// Generate grouped title
getGroupedTitle(group: GroupedNotification): string

// Generate grouped message
getGroupedMessage(group: GroupedNotification): string

// Check if two notifications should be grouped
shouldGroup(
  notif1: Notification,
  notif2: Notification,
  timeWindowSeconds: number = 300
): boolean
```

#### Grouping Logic:

1. **Group Key:** `category_entityType`
   - Example: `inventory_ingredient`, `orders_order`

2. **Time Window:** Configurable (default 5 minutes)
   - Only group notifications within time window
   - Older notifications shown individually

3. **Priority Upgrade:** Group takes highest priority
   - If any notification is urgent, group becomes urgent

4. **Latest First:** Group shows latest notification's title/message

#### Example Grouped Notification:

**Before Grouping:**
```
- Stok Tepung Terigu menipis
- Stok Gula Pasir menipis
- Stok Mentega menipis
```

**After Grouping:**
```
📦 3 Notifikasi Stok
Tepung Terigu, Gula Pasir, Mentega
```

## 🎯 Integration Examples

### 1. Check Preferences Before Creating Notification

```typescript
import { NotificationService } from '@/modules/notifications/services/NotificationService'

// Get user preferences
const { data: prefs } = await supabase
  .from('notification_preferences')
  .select('*')
  .eq('user_id', userId)
  .single()

// Check if category is enabled
if (prefs?.inventory_enabled) {
  await NotificationService.createLowStockAlert(
    supabase,
    userId,
    ingredientId,
    ingredientName,
    currentStock,
    minStock
  )
}
```

### 2. Check Quiet Hours

```typescript
function isQuietHours(prefs: NotificationPreferences): boolean {
  if (!prefs.quiet_hours_enabled) return false

  const now = new Date()
  const currentTime = now.toTimeString().substring(0, 8)
  
  const start = prefs.quiet_hours_start
  const end = prefs.quiet_hours_end

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (start > end) {
    return currentTime >= start || currentTime <= end
  }
  
  return currentTime >= start && currentTime <= end
}

// Don't create notification during quiet hours
if (!isQuietHours(preferences)) {
  await NotificationService.createNotification(...)
}
```

### 3. Filter by Priority

```typescript
const priorityLevels = ['low', 'normal', 'high', 'urgent']
const minPriorityIndex = priorityLevels.indexOf(prefs.min_priority)
const notifPriorityIndex = priorityLevels.indexOf(notification.priority)

// Only show if notification priority >= min priority
if (notifPriorityIndex >= minPriorityIndex) {
  // Show notification
}
```

## 🎨 UI/UX Features

### Visual Indicators

**Category Icons:**
- 📦 Inventory
- 🛒 Orders
- 🏭 Production
- 💰 Finance
- ⚙️ System

**Priority Colors:**
- 🟢 Low - Gray border
- 🔵 Normal - Blue border
- 🟠 High - Orange border
- 🔴 Urgent - Red border

### Responsive Design

- Mobile-optimized layout
- Touch-friendly controls
- Text wrapping (no truncation)
- Smooth animations

### Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode compatible

## 🔄 Real-time Updates

Preferences are loaded once and cached in NotificationBell component:

```typescript
// Fetch preferences on mount
useEffect(() => {
  fetchPreferences()
}, [])

// Update sound settings when preferences change
useEffect(() => {
  if (preferences) {
    setSoundEnabled(preferences.sound_enabled)
    setSoundVolume(preferences.sound_volume)
  }
}, [preferences])
```

## 📱 Mobile Experience

### Settings Page
- Responsive cards
- Touch-friendly switches
- Native time pickers
- Smooth scrolling

### Notification Bell
- Optimized for mobile
- Smooth popover animation
- Touch gestures support

## 🧪 Testing

### Test Sound

Di settings page ada tombol test:
```typescript
<Button onClick={() => testNotificationSound(preferences.sound_volume)}>
  Test Suara Normal
</Button>

<Button onClick={() => testUrgentSound(preferences.sound_volume)}>
  Test Suara Urgent
</Button>
```

### Test Grouping

```typescript
import { groupNotifications } from '@/lib/notifications/grouping'

const notifications = [
  { category: 'inventory', entity_type: 'ingredient', ... },
  { category: 'inventory', entity_type: 'ingredient', ... },
  { category: 'orders', entity_type: 'order', ... },
]

const grouped = groupNotifications(notifications, 300)
console.log(grouped) // Should group inventory notifications
```

## 🚀 Future Enhancements

### Phase 2 (Coming Soon)

1. **Email Notifications**
   - Send email for urgent notifications
   - Daily/weekly digest emails
   - Email templates

2. **WhatsApp Integration**
   - Send via WhatsApp Business API
   - Template messages
   - Quick replies

3. **Push Notifications**
   - Browser push notifications
   - Mobile app push (future)
   - Background sync

4. **Advanced Grouping**
   - Custom grouping rules
   - Smart AI-based grouping
   - User-defined groups

5. **Notification Templates**
   - Custom notification templates
   - Variable substitution
   - Multi-language support

6. **Analytics Dashboard**
   - Notification engagement metrics
   - Response time tracking
   - Category performance

## 📊 Default Settings

```typescript
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  // All categories enabled by default
  inventory_enabled: true,
  orders_enabled: true,
  production_enabled: true,
  finance_enabled: true,
  system_enabled: true,
  
  // All types enabled
  info_enabled: true,
  warning_enabled: true,
  error_enabled: true,
  success_enabled: true,
  alert_enabled: true,
  
  // Show all priorities
  min_priority: 'low',
  
  // Sound enabled, medium volume
  sound_enabled: true,
  sound_volume: 0.5,
  sound_for_urgent_only: false,
  
  // Grouping enabled, 5 minute window
  group_similar_enabled: true,
  group_time_window: 300,
  
  // Email disabled by default
  email_enabled: false,
  email_digest: false,
  email_digest_frequency: 'daily',
  
  // Quiet hours disabled
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '07:00:00',
}
```

## 🎓 Best Practices

### 1. Respect User Preferences

Always check preferences before creating notifications:

```typescript
// ✅ GOOD
const prefs = await getPreferences(userId)
if (prefs.inventory_enabled && !isQuietHours(prefs)) {
  await createNotification(...)
}

// ❌ BAD
await createNotification(...) // Ignores user preferences
```

### 2. Use Appropriate Priority

```typescript
// ✅ GOOD - Urgent for critical issues
await NotificationService.createNotification(supabase, userId, {
  priority: 'urgent',
  type: 'error',
  title: 'Stok Habis Total!',
  ...
})

// ❌ BAD - Everything is urgent
await NotificationService.createNotification(supabase, userId, {
  priority: 'urgent', // Don't overuse urgent!
  type: 'info',
  title: 'Info biasa',
  ...
})
```

### 3. Provide Action URLs

```typescript
// ✅ GOOD - User can take action
await NotificationService.createNotification(supabase, userId, {
  action_url: `/inventory?highlight=${ingredientId}`,
  ...
})

// ❌ BAD - No action URL
await NotificationService.createNotification(supabase, userId, {
  // Missing action_url
  ...
})
```

### 4. Test Sounds Responsibly

```typescript
// ✅ GOOD - User-initiated test
<Button onClick={() => testNotificationSound()}>
  Test Sound
</Button>

// ❌ BAD - Auto-play on page load
useEffect(() => {
  testNotificationSound() // Annoying!
}, [])
```

## 🔍 Troubleshooting

### Sound Not Playing

1. Check browser autoplay policy
2. Verify sound_enabled in preferences
3. Check volume level (not 0)
4. Test in different browser

### Grouping Not Working

1. Verify group_similar_enabled is true
2. Check time window setting
3. Ensure notifications have same category + entity_type
4. Check timestamps are within window

### Preferences Not Saving

1. Check API response for errors
2. Verify RLS policies
3. Check user authentication
4. Inspect network tab

## 📚 Related Documentation

- [NOTIFICATION_SYSTEM_GUIDE.md](./NOTIFICATION_SYSTEM_GUIDE.md) - Main notification system
- [API_ROUTES_AUDIT.md](./API_ROUTES_AUDIT.md) - API routes documentation
- [UX_IMPLEMENTATION_GUIDE.md](./UX_IMPLEMENTATION_GUIDE.md) - UX guidelines

---

**Status:** ✅ IMPLEMENTED  
**Last Updated:** October 30, 2025  
**Version:** 2.0.0

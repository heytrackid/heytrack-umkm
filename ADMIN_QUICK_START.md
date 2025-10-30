# Admin Dashboard - Quick Start Guide

## 🚀 Setup Admin User (5 minutes)

### Step 1: Check Your User ID

Login to your app, then run this in browser console:
```javascript
// Get your current user ID
const supabase = createClient()
const { data } = await supabase.auth.getUser()
console.log('Your User ID:', data.user.id)
```

Or check in Supabase Dashboard:
1. Go to Authentication → Users
2. Find your email
3. Copy the User ID

### Step 2: Set Admin Role

Run this SQL in Supabase SQL Editor:

```sql
-- Replace 'YOUR-USER-ID' with your actual user ID
UPDATE user_profiles
SET role = 'admin'
WHERE user_id = 'YOUR-USER-ID';

-- Verify it worked
SELECT user_id, email, role, full_name
FROM user_profiles
WHERE user_id = 'YOUR-USER-ID';
```

**Expected result:**
```
user_id: your-uuid
email: your@email.com
role: admin  ← Should show 'admin'
full_name: Your Name
```

### Step 3: Access Admin Dashboard

Visit: `http://localhost:3000/admin`

**You should see:**
- ✅ Admin & Performance Monitor page
- ✅ 4 overview cards (Users, Database, Response Time, Revenue)
- ✅ 4 tabs (Performance, Database, Errors, Business)

**If you see an error:**
- "Unauthorized" → You're not logged in
- "You do not have permission" → Role is not set to admin

## 🔧 Troubleshooting

### Problem: "You do not have permission to access this page"

**Solution 1: Check if user_profile exists**
```sql
SELECT * FROM user_profiles WHERE user_id = 'YOUR-USER-ID';
```

If no results, create profile:
```sql
INSERT INTO user_profiles (user_id, email, full_name, role)
VALUES (
  'YOUR-USER-ID',
  'your@email.com',
  'Your Name',
  'admin'
);
```

**Solution 2: Verify role is set**
```sql
SELECT role FROM user_profiles WHERE user_id = 'YOUR-USER-ID';
```

Should return: `admin` or `super_admin`

**Solution 3: Check RLS policies**
```sql
-- This should return rows if you're admin
SELECT * FROM performance_logs LIMIT 1;
SELECT * FROM error_logs LIMIT 1;
```

### Problem: Dashboard shows but no data

**This is normal!** The tables are empty initially.

To add test data:
```sql
-- Add test performance log
INSERT INTO performance_logs (endpoint, method, duration_ms, status, timestamp)
VALUES ('/api/test', 'GET', 150, 200, NOW());

-- Add test error log
INSERT INTO error_logs (error_type, error_message, endpoint, timestamp)
VALUES ('TestError', 'This is a test error', '/api/test', NOW());
```

Refresh the dashboard to see the data.

### Problem: Database metrics show N/A

**Check if functions exist:**
```sql
SELECT proname FROM pg_proc WHERE proname IN (
  'get_database_size',
  'get_active_connections',
  'get_total_rows'
);
```

Should return 3 rows. If not, re-run the migration.

## 📊 Understanding the Dashboard

### Overview Cards

1. **Total Users**
   - Shows count from `user_profiles` table
   - "Active today" = users who created orders today

2. **Database Size**
   - Real size from PostgreSQL
   - Includes all tables and indexes

3. **Avg Response Time**
   - Calculated from `performance_logs`
   - Shows cache hit rate (currently mock)

4. **Total Revenue**
   - Sum of completed orders
   - Formatted as Indonesian Rupiah

### Performance Tab

**Metrics:**
- Cache hit rate (mock - 94%)
- Avg query time (mock - 45ms)
- Slow queries (mock - 3)
- API response time (mock - 120ms)

**Recent API Calls:**
- Real data from `performance_logs` table
- Color coded by speed:
  - Green: < 500ms (fast)
  - Yellow: 500-1000ms (moderate)
  - Red: > 1000ms (slow)

### Database Tab

**Statistics:**
- Database size (real from PostgreSQL)
- Active connections (real from pg_stat_activity)
- Total tables (approximate count)
- Total rows (real from pg_stat_user_tables)

**Alerts:**
- Warning if connections > 80

### Errors Tab

**Error Logs:**
- Real data from `error_logs` table
- Shows error type, message, endpoint
- Expandable stack traces
- Timestamps

**Status:**
- Shows "No errors" if table is empty

### Business Tab

**Metrics:**
- Total recipes (from `recipes` table)
- Total orders (from `orders` table)
- Total revenue (sum of completed orders)
- Total ingredients (from `ingredients` table)
- Active users today (users with orders today)
- New users this week (users created in last 7 days)

## 🎯 Quick Actions

### Refresh Data
Click "Refresh" button in top right

### Export Logs
Click "Export Logs" button to download JSON file

### View Stack Trace
Click "Stack trace" in error logs to expand

## 🔐 Security Notes

### Who Can Access?

**Allowed:**
- Users with `role = 'admin'`
- Users with `role = 'super_admin'`

**Not Allowed:**
- Users with `role = 'manager'`
- Users with `role = 'staff'`
- Users with `role = 'viewer'`
- Unauthenticated users

### What Can Admins Do?

**View:**
- ✅ All performance logs
- ✅ All error logs
- ✅ System metrics
- ✅ Business metrics

**Cannot:**
- ❌ Modify logs (read-only)
- ❌ Delete logs (auto-cleanup after 30 days)
- ❌ Access other users' personal data

### RLS Protection

Even if someone bypasses the UI, database RLS policies prevent:
- Non-admins from viewing logs
- Anyone from modifying logs
- Unauthorized access to sensitive data

## 📝 Logging Your Own Data

### Log Performance

```typescript
// In your API route
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const start = Date.now()
  
  try {
    // Your API logic here
    const result = await doSomething()
    
    // Log performance
    const duration = Date.now() - start
    await supabase.from('performance_logs').insert({
      endpoint: request.url,
      method: 'GET',
      duration_ms: duration,
      status: 200,
      user_id: user?.id
    })
    
    return NextResponse.json(result)
  } catch (error) {
    // Log error
    await supabase.from('error_logs').insert({
      error_type: 'APIError',
      error_message: getErrorMessage(error),
      endpoint: request.url,
      user_id: user?.id,
      stack_trace: error instanceof Error ? error.stack : null
    })
    
    throw error
  }
}
```

### Log Errors

```typescript
// In your error handler
try {
  await riskyOperation()
} catch (error: unknown) {
  await supabase.from('error_logs').insert({
    error_type: error instanceof Error ? error.name : 'UnknownError',
    error_message: getErrorMessage(error),
    endpoint: '/api/your-endpoint',
    user_id: user?.id,
    severity: 'high',
    stack_trace: error instanceof Error ? error.stack : null,
    metadata: {
      context: 'additional info'
    }
  })
}
```

## 🧹 Maintenance

### Clean Old Logs

```sql
-- Manual cleanup (logs older than 30 days)
SELECT clean_old_logs();
```

### Schedule Auto-Cleanup

```sql
-- Using pg_cron (if installed)
SELECT cron.schedule(
  'clean-old-logs',
  '0 2 * * *', -- Every day at 2 AM
  'SELECT clean_old_logs();'
);
```

### Check Log Sizes

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('performance_logs', 'error_logs')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🎨 Customization

### Change Admin Roles

Edit `src/lib/auth/admin-check.ts`:

```typescript
// Allow managers to access admin dashboard
const ADMIN_ROLES: UserRole[] = ['super_admin', 'admin', 'manager']
```

### Add More Metrics

Edit `src/app/api/admin/metrics/route.ts`:

```typescript
// Add custom metric
const { data: customMetric } = await supabase
  .from('your_table')
  .select('*')
  // ... your query

// Add to response
const metrics = {
  // ... existing metrics
  custom: {
    your_metric: customMetric
  }
}
```

### Customize Dashboard

Edit `src/components/admin/AdminDashboard.tsx`:

```typescript
// Add new tab
<TabsList>
  <TabsTrigger value="performance">Performance</TabsTrigger>
  <TabsTrigger value="database">Database</TabsTrigger>
  <TabsTrigger value="errors">Errors</TabsTrigger>
  <TabsTrigger value="business">Business</TabsTrigger>
  <TabsTrigger value="custom">Custom</TabsTrigger> {/* New tab */}
</TabsList>
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Can access `/admin` page
- [ ] See 4 overview cards with data
- [ ] All 4 tabs load without errors
- [ ] Refresh button works
- [ ] Export button downloads file
- [ ] Non-admin users see error message
- [ ] Logged out users redirect to login

## 🆘 Need Help?

### Check Logs

```sql
-- Recent performance logs
SELECT * FROM performance_logs
ORDER BY timestamp DESC
LIMIT 10;

-- Recent errors
SELECT * FROM error_logs
ORDER BY timestamp DESC
LIMIT 10;

-- Check your role
SELECT role FROM user_profiles
WHERE user_id = auth.uid();
```

### Common Issues

1. **"Unauthorized"** → Not logged in
2. **"Forbidden"** → Not admin role
3. **No data** → Tables are empty (normal for new setup)
4. **"N/A" metrics** → Functions not created (re-run migration)

---

**Ready to use!** 🎉

Access your admin dashboard at: `http://localhost:3000/admin`

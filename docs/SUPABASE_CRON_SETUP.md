# Supabase Cron Job Setup - HPP Recalculation

## 🎯 Overview

HPP (Harga Pokok Produksi) recalculation queue diproses otomatis menggunakan **Supabase pg_cron** setiap 5 menit.

**Kenapa Supabase pg_cron?**
- ✅ **Gratis & unlimited** (dalam reasonable usage)
- ✅ **Runs di database** - lebih dekat ke data, lebih cepat
- ✅ **No timeout limits** - bisa process banyak items
- ✅ **Native PostgreSQL** - direct database access
- ✅ **Built-in monitoring** - via cron.job_run_details

---

## 📦 What's Installed

### 1. **Cron Job**
- **Name:** `hpp-recalculation-every-5min`
- **Schedule:** `*/5 * * * *` (Every 5 minutes)
- **Function:** `process_all_hpp_recalculation_queues()`
- **Timezone:** UTC

### 2. **Functions**

#### `process_all_hpp_recalculation_queues()`
Main function yang dipanggil oleh cron job.
- Processes max 100 users per run
- Processes 10 items per user
- Returns statistics (total_users, total_processed, total_failed, total_pending, execution_time_ms)

#### `trigger_hpp_recalculation_cron()`
Manual trigger untuk testing.
```sql
SELECT * FROM trigger_hpp_recalculation_cron();
```

#### `get_hpp_cron_statistics()`
Get cron job statistics.
```sql
SELECT * FROM get_hpp_cron_statistics();
```

### 3. **Monitoring Views**

#### `hpp_cron_job_status`
Current status of cron job.
```sql
SELECT * FROM hpp_cron_job_status;
```

#### `hpp_cron_job_history`
Last 100 executions.
```sql
SELECT * FROM hpp_cron_job_history
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🚀 How It Works

### Automatic Flow

```
Every 5 minutes (UTC):
  ↓
pg_cron triggers
  ↓
process_all_hpp_recalculation_queues()
  ↓
For each user with pending items:
  ↓
  process_hpp_recalculation_queue(user_id, 10)
    ↓
    For each pending item:
      ↓
      HppCalculatorService.calculateRecipeHpp(recipe_id)
        ↓
        Update recipe.cost_per_unit
        ↓
        Mark queue item as 'completed'
```

### Triggers That Create Queue Items

1. **Ingredient WAC Change**
   ```sql
   -- Automatically triggered when ingredient.weighted_average_cost changes
   UPDATE ingredients 
   SET weighted_average_cost = 15000 
   WHERE id = 'ingredient-uuid';
   
   -- Creates queue items for all recipes using this ingredient
   ```

2. **Operational Cost Change**
   ```sql
   -- Automatically triggered when operational_costs changes
   UPDATE operational_costs 
   SET amount = 5000000 
   WHERE id = 'cost-uuid';
   
   -- Creates queue items for ALL active recipes
   ```

---

## 🔍 Monitoring & Debugging

### Check Cron Job Status

```sql
-- Is the cron job active?
SELECT * FROM hpp_cron_job_status;

-- Expected output:
-- jobid | schedule      | active | jobname
-- 1     | */5 * * * *   | true   | hpp-recalculation-every-5min
```

### Check Execution History

```sql
-- Last 10 runs
SELECT 
  start_time,
  end_time,
  duration,
  status,
  return_message
FROM hpp_cron_job_history
ORDER BY start_time DESC
LIMIT 10;

-- Expected status: 'succeeded' or 'failed'
```

### Check Statistics

```sql
SELECT * FROM get_hpp_cron_statistics();

-- Returns:
-- total_runs | successful_runs | failed_runs | avg_duration_seconds | last_run_time | last_run_status | next_scheduled_run
```

### Check Queue Status

```sql
-- How many items pending?
SELECT 
  status,
  COUNT(*) as count
FROM hpp_recalculation_queue
GROUP BY status;

-- Expected output:
-- status      | count
-- pending     | 5
-- processing  | 0
-- completed   | 120
-- failed      | 2
```

### Check Failed Items

```sql
-- What failed and why?
SELECT 
  recipe_id,
  trigger_reason,
  error_message,
  created_at
FROM hpp_recalculation_queue
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## 🧪 Testing

### Manual Trigger (Recommended for Testing)

```sql
-- Trigger the cron job manually
SELECT * FROM trigger_hpp_recalculation_cron();

-- Returns:
-- total_users | total_processed | total_failed | total_pending | execution_time_ms
-- 3           | 15              | 0            | 5             | 1234
```

### Create Test Queue Item

```sql
-- Manually create a queue item for testing
INSERT INTO hpp_recalculation_queue (
  user_id,
  recipe_id,
  trigger_reason,
  trigger_details,
  status
) VALUES (
  auth.uid(),
  'your-recipe-uuid',
  'operational_cost_change',
  '{"manual_test": true}'::jsonb,
  'pending'
);

-- Then trigger manually
SELECT * FROM trigger_hpp_recalculation_cron();

-- Check if processed
SELECT * FROM hpp_recalculation_queue 
WHERE recipe_id = 'your-recipe-uuid';
```

---

## ⚙️ Configuration

### Change Schedule

```sql
-- Update cron schedule (requires SUPERUSER or cron schema access)
SELECT cron.unschedule('hpp-recalculation-every-5min');

-- Reschedule with new timing (e.g., every 10 minutes)
SELECT cron.schedule(
  'hpp-recalculation-every-5min',
  '*/10 * * * *',  -- Every 10 minutes
  $$SELECT public.process_all_hpp_recalculation_queues();$$
);
```

### Pause Cron Job

```sql
-- Unschedule (pause)
SELECT cron.unschedule('hpp-recalculation-every-5min');

-- Resume (reschedule)
SELECT cron.schedule(
  'hpp-recalculation-every-5min',
  '*/5 * * * *',
  $$SELECT public.process_all_hpp_recalculation_queues();$$
);
```

### Adjust Batch Size

Edit the migration or run:
```sql
-- Change batch size per user (default: 10)
CREATE OR REPLACE FUNCTION public.process_all_hpp_recalculation_queues()
RETURNS TABLE (...) AS $$
DECLARE
  ...
BEGIN
  ...
  -- Change this line:
  SELECT * INTO v_result
  FROM public.process_hpp_recalculation_queue(v_user_record.user_id, 20);  -- Changed from 10 to 20
  ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🐛 Troubleshooting

### Cron Job Not Running

**Check if pg_cron extension is enabled:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

**Check if job exists:**
```sql
SELECT * FROM cron.job WHERE jobname = 'hpp-recalculation-every-5min';
```

**Check cron logs:**
```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'hpp-recalculation-every-5min')
ORDER BY start_time DESC
LIMIT 5;
```

### Items Stuck in 'processing'

```sql
-- Reset stuck items back to pending
UPDATE hpp_recalculation_queue
SET status = 'pending'
WHERE status = 'processing'
  AND created_at < NOW() - INTERVAL '1 hour';
```

### High Failure Rate

```sql
-- Check error patterns
SELECT 
  error_message,
  COUNT(*) as count
FROM hpp_recalculation_queue
WHERE status = 'failed'
GROUP BY error_message
ORDER BY count DESC;
```

### Performance Issues

```sql
-- Check execution times
SELECT 
  AVG(EXTRACT(EPOCH FROM duration)) as avg_seconds,
  MAX(EXTRACT(EPOCH FROM duration)) as max_seconds,
  MIN(EXTRACT(EPOCH FROM duration)) as min_seconds
FROM hpp_cron_job_history
WHERE status = 'succeeded';
```

---

## 📊 Performance Metrics

### Expected Performance

- **Batch Size:** 10 items per user
- **Max Users:** 100 per run
- **Max Items:** 1,000 per run (100 users × 10 items)
- **Execution Time:** ~1-5 seconds for typical load
- **Frequency:** Every 5 minutes

### Scaling

If you have high volume:

1. **Increase batch size** (10 → 20 items per user)
2. **Increase frequency** (5 min → 3 min)
3. **Increase max users** (100 → 200 per run)

**Warning:** Monitor execution time to avoid overlapping runs.

---

## 🔐 Security

### Permissions

- ✅ `process_all_hpp_recalculation_queues()` - SECURITY DEFINER (runs as owner)
- ✅ `trigger_hpp_recalculation_cron()` - Granted to `authenticated`
- ✅ `get_hpp_cron_statistics()` - Granted to `authenticated`
- ✅ Views - Granted SELECT to `authenticated`

### RLS (Row Level Security)

Queue items are protected by RLS:
```sql
-- Users can only see their own queue items
SELECT * FROM hpp_recalculation_queue; -- Only shows current user's items
```

---

## 📝 Maintenance

### Cleanup Old Completed Items

```sql
-- Delete completed items older than 7 days
DELETE FROM hpp_recalculation_queue
WHERE status = 'completed'
  AND processed_at < NOW() - INTERVAL '7 days';
```

### Archive Failed Items

```sql
-- Create archive table
CREATE TABLE hpp_recalculation_queue_archive AS
SELECT * FROM hpp_recalculation_queue WHERE false;

-- Move failed items to archive
INSERT INTO hpp_recalculation_queue_archive
SELECT * FROM hpp_recalculation_queue
WHERE status = 'failed'
  AND processed_at < NOW() - INTERVAL '30 days';

DELETE FROM hpp_recalculation_queue
WHERE status = 'failed'
  AND processed_at < NOW() - INTERVAL '30 days';
```

---

## 🎓 Best Practices

1. **Monitor regularly** - Check `get_hpp_cron_statistics()` weekly
2. **Clean up old items** - Delete completed items older than 7 days
3. **Investigate failures** - Review failed items and fix root causes
4. **Test before deploy** - Use `trigger_hpp_recalculation_cron()` for testing
5. **Adjust batch size** - Based on your volume and performance needs

---

## 🆘 Support

### Quick Diagnostics

```sql
-- Run this for quick health check
SELECT 
  'Cron Job Status' as check_type,
  CASE WHEN active THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM hpp_cron_job_status
UNION ALL
SELECT 
  'Last Run',
  CASE 
    WHEN last_run_status = 'succeeded' THEN '✅ Success'
    ELSE '❌ Failed'
  END
FROM get_hpp_cron_statistics()
UNION ALL
SELECT 
  'Pending Items',
  COUNT(*)::text || ' items'
FROM hpp_recalculation_queue
WHERE status = 'pending';
```

### Contact

If issues persist:
1. Check Supabase logs in Dashboard
2. Review migration file: `20251222000002_setup_hpp_recalculation_cron.sql`
3. Check function definitions in Supabase SQL Editor

---

**Status:** ✅ Active and Running  
**Last Updated:** December 22, 2025  
**Migration:** `20251222000002_setup_hpp_recalculation_cron.sql`

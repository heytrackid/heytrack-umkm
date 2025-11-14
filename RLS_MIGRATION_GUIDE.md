# RLS Migration Guide

## 🎯 Overview

This guide helps you migrate HeyTrack to use Supabase Row Level Security (RLS) with Stack Auth integration.

## ⚠️ Before You Start

1. **Backup your database** - Always backup before running migrations
2. **Test in development** - Run migration on dev database first
3. **Check existing data** - Ensure all rows have valid `user_id` values

## 📋 Migration Steps

### Step 1: Add JWT Secret

Add to `.env.local`:
```env
SUPABASE_JWT_SECRET=your_jwt_secret_from_supabase_dashboard
```

Find it: Supabase Dashboard → Project Settings → API → JWT Secret

### Step 2: Run RLS Migration

```bash
# Option A: Via Supabase CLI
supabase db push

# Option B: Via Supabase Dashboard
# Go to SQL Editor and paste contents of:
# supabase/migrations/enable_rls_with_stack_auth.sql
```

### Step 3: Verify RLS Policies

```sql
-- Check all policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE)
```

### Step 4: Test with Stack Auth User

```tsx
// In your app
const user = await stackServerApp.getUser()
console.log('Stack Auth User ID:', user?.id)

// Query should only return user's data
const { data } = await supabase.from('orders').select('*')
console.log('Orders:', data) // Only user's orders
```

### Step 5: Update Existing Data (if needed)

If you have existing data without `user_id`:

```sql
-- Option A: Set all to a specific Stack Auth user ID
UPDATE orders SET user_id = 'stack_auth_user_id_here' WHERE user_id IS NULL;
UPDATE recipes SET user_id = 'stack_auth_user_id_here' WHERE user_id IS NULL;
-- Repeat for all tables

-- Option B: Delete orphaned data
DELETE FROM orders WHERE user_id IS NULL;
DELETE FROM recipes WHERE user_id IS NULL;
-- Repeat for all tables
```

### Step 6: Remove Manual user_id Filters (Optional)

RLS automatically filters by `user_id`, so you can remove manual filters:

```tsx
// ❌ Before (redundant with RLS)
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('user_id', userId) // Not needed anymore

// ✅ After (RLS handles it)
const { data } = await supabase
  .from('orders')
  .select('*')
```

## 🧪 Testing Checklist

- [ ] JWT secret is set in environment
- [ ] RLS migration ran successfully
- [ ] All tables have RLS enabled
- [ ] Policies created for all tables
- [ ] Triggers created for auto-setting user_id
- [ ] Test SELECT: Only returns user's data
- [ ] Test INSERT: Auto-sets user_id
- [ ] Test UPDATE: Only updates user's data
- [ ] Test DELETE: Only deletes user's data
- [ ] Test with multiple users: Data is isolated

## 🔍 Verification Queries

```sql
-- 1. Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- 2. Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'set_user_id%';

-- 4. Test as authenticated user (via psql with JWT)
SET request.jwt.claims.sub = 'your_stack_auth_user_id';
SELECT * FROM orders; -- Should only show user's orders
```

## 🐛 Troubleshooting

### Issue: "No rows returned"

**Cause**: RLS is blocking access

**Solutions**:
1. Check JWT is being sent:
   ```tsx
   const token = await getSupabaseJwt()
   console.log('JWT:', token)
   ```

2. Verify user_id in database:
   ```sql
   SELECT id, user_id FROM orders LIMIT 10;
   ```

3. Check RLS policy:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'orders';
   ```

### Issue: "Permission denied"

**Cause**: Missing grants or incorrect policy

**Solution**:
```sql
-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;

-- Check policy
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### Issue: "user_id is null on INSERT"

**Cause**: Trigger not working or JWT not sent

**Solution**:
1. Check trigger exists:
   ```sql
   SELECT * FROM information_schema.triggers 
   WHERE event_object_table = 'orders';
   ```

2. Manually set user_id:
   ```tsx
   const userId = await getUserId()
   await supabase.from('orders').insert({ user_id: userId, ... })
   ```

### Issue: "auth.uid() returns null"

**Cause**: JWT not being sent or invalid

**Solutions**:
1. Verify JWT secret is correct
2. Check user is authenticated
3. Decode JWT at jwt.io to verify structure

## 🔄 Rollback Plan

If you need to rollback:

```sql
-- 1. Disable RLS on all tables
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;

-- 2. Drop all RLS policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 3. Drop triggers
DROP TRIGGER IF EXISTS set_user_id_trigger_orders ON orders;
-- Repeat for all tables

-- 4. Drop function
DROP FUNCTION IF EXISTS set_user_id();
```

## 📊 Performance Considerations

RLS policies are evaluated on every query. For optimal performance:

1. **Index user_id columns**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
   CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);
   -- Repeat for all tables
   ```

2. **Use EXPLAIN ANALYZE** to check query plans:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM orders;
   ```

3. **Monitor slow queries** in Supabase Dashboard

## ✅ Success Criteria

Migration is successful when:

- ✅ All tables have RLS enabled
- ✅ All tables have 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ All tables have auto-set user_id trigger
- ✅ Users can only see their own data
- ✅ New inserts automatically get user_id
- ✅ No permission denied errors for valid operations
- ✅ Application works normally with RLS enabled

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Stack Auth + Supabase Guide](https://docs.stack-auth.com/integrations/supabase)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

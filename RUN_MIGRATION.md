# 🚀 Run RLS Migration - Quick Guide

## Step 1: Get JWT Secret

1. Buka: https://supabase.com/dashboard/project/vrrjoswzmlhkmmcfhicw/settings/api
2. Scroll ke "JWT Settings"
3. Copy "JWT Secret"
4. Add ke `.env.local`:
   ```env
   SUPABASE_JWT_SECRET=paste_jwt_secret_here
   ```

## Step 2: Run Migration via Supabase Dashboard

### Option A: Via SQL Editor (Recommended)

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard/project/vrrjoswzmlhkmmcfhicw/sql/new
2. **Copy paste** isi file: `supabase/migrations/enable_rls_with_stack_auth.sql`
3. **Click "Run"**
4. **Verify**: Check for success message

### Option B: Via Supabase CLI (If installed)

```bash
# Make sure you're in project root
cd /Users/mymac/Projects/HeyTrack

# Link to your project (if not linked)
npx supabase link --project-ref vrrjoswzmlhkmmcfhicw

# Run migration
npx supabase db push
```

## Step 3: Verify Migration

Run this query in SQL Editor to verify:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Should return all your tables with rowsecurity = true
```

## Step 4: Test

```bash
# Restart dev server
pnpm dev

# Test auth
# Visit: http://localhost:3000/handler/sign-in
```

## 🐛 Troubleshooting

### "Function already exists"
```sql
-- Drop and recreate
DROP FUNCTION IF EXISTS set_user_id() CASCADE;
-- Then run migration again
```

### "Policy already exists"
```sql
-- Drop all policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;
-- Then run migration again
```

### "Table doesn't exist"
Comment out tables that don't exist in your database from the migration SQL.

## ✅ Success Criteria

- [ ] JWT secret added to `.env.local`
- [ ] Migration ran without errors
- [ ] All tables have RLS enabled
- [ ] Policies created successfully
- [ ] Can sign in via Stack Auth
- [ ] Queries only return user's data

## 📞 Need Help?

If migration fails, share the error message and I'll help fix it!

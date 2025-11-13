# RLS Data Isolation Issue - Root Cause Analysis

## Problem

User baru yang mendaftar akun bisa melihat data dari user lain (orders, ingredients, recipes, dll).

## Root Cause

**RLS Policies sudah BENAR** ✅ - Semua table menggunakan `user_id = auth.uid()` untuk isolasi data.

**Masalahnya ada di DATA** ❌ - Ada data yang ter-share antar user karena:

### 1. Data Seeding dengan Multiple User IDs

Saat seeding data demo, data di-insert dengan `user_id` yang berbeda-beda:

```sql
-- Contoh: ingredients table punya data dari 3 user berbeda
user_id: ae5dec5d-49b1-4ade-a4dd-090ec004791e (heytrackid@gmail.com) - 32 ingredients
user_id: 937c8d31-d582-4cbb-96e6-071c7936e5a3 (apabilamatcha@gmail.com) - 3 ingredients  
user_id: 589b4b66-820a-4126-a781-9663e55bcb48 (nabila_623@yahoo.com) - 1 ingredient
```

### 2. User Login dengan Akun yang Sudah Punya Data

Ketika user baru mendaftar dengan email yang **berbeda**, mereka akan mulai dengan data kosong (BENAR).

Tapi kalau mereka login dengan salah satu email di atas, mereka akan lihat data yang sudah ada untuk user tersebut.

## Verification

### Check RLS Policies (SUDAH BENAR)

```sql
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'ingredients';

-- Result:
-- ingredients_select_policy: (user_id = auth.uid()) ✅
-- ingredients_insert_policy: (user_id = auth.uid()) ✅
-- ingredients_update_policy: (user_id = auth.uid()) ✅
-- ingredients_delete_policy: (user_id = auth.uid()) ✅
```

### Check Data Distribution

```sql
-- Check how many users have data
SELECT 
  'ingredients' as table_name,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_rows
FROM ingredients;

-- Result: 3 unique users, 36 total rows
```

### Check Specific Users

```sql
SELECT 
  i.user_id,
  u.email,
  COUNT(*) as ingredient_count
FROM ingredients i
LEFT JOIN auth.users u ON i.user_id = u.id
GROUP BY i.user_id, u.email;

-- Result shows data from multiple users
```

## Solution Options

### Option 1: Clean All Data (Recommended for Development)

Hapus semua data dan biarkan setiap user mulai dari kosong:

```sql
-- WARNING: This will delete ALL data!
TRUNCATE TABLE 
  order_items,
  orders,
  recipe_ingredients,
  recipes,
  ingredients,
  customers,
  financial_records,
  operational_costs,
  ingredient_purchases
CASCADE;
```

### Option 2: Assign All Data to Single Demo User

Pindahkan semua data ke satu user demo:

```sql
-- Set a demo user ID
DO $$
DECLARE
  demo_user_id uuid := 'ae5dec5d-49b1-4ade-a4dd-090ec004791e'; -- heytrackid@gmail.com
BEGIN
  UPDATE ingredients SET user_id = demo_user_id;
  UPDATE recipes SET user_id = demo_user_id;
  UPDATE recipe_ingredients SET user_id = demo_user_id;
  UPDATE orders SET user_id = demo_user_id;
  UPDATE order_items SET user_id = demo_user_id;
  UPDATE customers SET user_id = demo_user_id;
  UPDATE financial_records SET user_id = demo_user_id;
  UPDATE operational_costs SET user_id = demo_user_id;
  UPDATE ingredient_purchases SET user_id = demo_user_id;
END $$;
```

### Option 3: Create Seed Data Function

Buat function untuk auto-seed data untuk user baru:

```sql
CREATE OR REPLACE FUNCTION seed_user_data(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- Insert sample ingredients
  INSERT INTO ingredients (user_id, name, unit, price_per_unit, current_stock)
  VALUES 
    (target_user_id, 'Tepung Terigu', 'kg', 12000, 10),
    (target_user_id, 'Gula Pasir', 'kg', 15000, 5),
    (target_user_id, 'Telur', 'butir', 2000, 30);
    
  -- Insert sample recipes
  -- ... etc
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Call this function after user registration
SELECT seed_user_data(auth.uid());
```

### Option 4: Add Trigger for New Users

Otomatis seed data saat user baru dibuat:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Seed initial data for new user
  PERFORM seed_user_data(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Recommended Approach

### For Development:
1. **Clean all data** (Option 1)
2. Keep one demo account with sample data
3. All new users start with empty database

### For Production:
1. **Use seed function** (Option 3)
2. Auto-seed basic data for new users
3. Or let users start from scratch and import their own data

## Testing

After implementing solution, test with:

1. Create new user account
2. Login with new account
3. Check dashboard - should show 0 orders, 0 ingredients, etc.
4. Add some data
5. Logout and login with different account
6. Verify you can't see the first user's data

## Prevention

To prevent this in the future:

1. **Always set user_id in seed scripts**:
   ```sql
   -- BAD: No user_id
   INSERT INTO ingredients (name, unit) VALUES ('Flour', 'kg');
   
   -- GOOD: With user_id
   INSERT INTO ingredients (user_id, name, unit) 
   VALUES (auth.uid(), 'Flour', 'kg');
   ```

2. **Use database functions for seeding**:
   ```sql
   CREATE FUNCTION seed_demo_data(target_user_id uuid) ...
   ```

3. **Add NOT NULL constraint to user_id**:
   ```sql
   ALTER TABLE ingredients 
   ALTER COLUMN user_id SET NOT NULL;
   ```

4. **Add check in API routes**:
   ```typescript
   // Always verify user_id matches auth user
   const { data: { user } } = await supabase.auth.getUser()
   if (ingredient.user_id !== user.id) {
     throw new Error('Unauthorized')
   }
   ```

## Current Status

- ✅ RLS Policies: CORRECT
- ❌ Data Isolation: BROKEN (data from multiple users mixed)
- ✅ Auth System: WORKING
- ❌ User Experience: CONFUSING (new users see old data)

## Action Items

1. [ ] Decide on solution approach (Option 1, 2, 3, or 4)
2. [ ] Implement chosen solution
3. [ ] Test with multiple user accounts
4. [ ] Add NOT NULL constraint to user_id columns
5. [ ] Update seed scripts to use single user_id
6. [ ] Document data seeding process

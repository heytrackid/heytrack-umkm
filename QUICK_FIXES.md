# 🔧 Quick Fixes - HeyTrack

Panduan cepat untuk memperbaiki minor issues yang ditemukan dalam audit.

---

## 🔒 Security Fixes (Priority 1)

### 1. Enable Leaked Password Protection
**Lokasi:** Supabase Dashboard  
**Waktu:** 2 menit

```
1. Buka Supabase Dashboard
2. Pilih project HeyTrack
3. Navigate ke: Authentication → Policies → Password
4. Enable "Leaked Password Protection"
5. Save changes
```

### 2. Fix Function Search Path
**Lokasi:** Supabase SQL Editor  
**Waktu:** 1 menit

```sql
-- Fix mutable search path untuk function
ALTER FUNCTION public.update_ingredient_purchases_updated_by() 
SET search_path = public, pg_temp;
```

### 3. Move pg_net Extension
**Lokasi:** Supabase SQL Editor  
**Waktu:** 2 menit

```sql
-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_net to extensions schema
ALTER EXTENSION pg_net SET SCHEMA extensions;

-- Update search path untuk functions yang menggunakan pg_net
ALTER DATABASE postgres SET search_path TO public, extensions;
```

---

## 📊 Database Optimization (Priority 2)

### Monitor & Clean Unused Indexes

**Catatan:** Jangan hapus sekarang! Monitor dulu selama 3 bulan production.

```sql
-- Query untuk check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY schemaname, tablename;

-- Setelah 3 bulan, jika masih 0 usage, drop dengan:
-- DROP INDEX IF EXISTS index_name;
```

**Indexes to Monitor:**
- `idx_chat_context_cache_expires_at`
- `idx_user_profiles_user_id`
- `idx_user_profiles_email`
- `idx_recipes_category`
- `idx_recipes_is_active`
- `idx_orders_customer_id`
- `idx_orders_status`
- Dan 30 lainnya (lihat audit report)

---

## 📝 Complete TODO Items (Priority 3)

### 1. HPP Trend Data Visualization
**File:** `src/modules/hpp/components/UnifiedHppPage.tsx:204`

```typescript
// TODO: Fetch actual trend data from API
// Replace with:
const { data: trendData } = useQuery({
  queryKey: ['hpp-trends', recipe.id],
  queryFn: async () => {
    const res = await fetch(`/api/hpp/trends?recipeId=${recipe.id}`)
    return res.json()
  }
})
```

**Backend API needed:**
```typescript
// src/app/api/hpp/trends/route.ts
export const GET = createApiRoute(
  { method: 'GET', path: '/api/hpp/trends', requireAuth: true },
  async (context) => {
    const { recipeId } = context.query
    // Fetch from hpp_history table
    const trends = await supabase
      .from('hpp_history')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('recorded_at', { ascending: true })
    return trends
  }
)
```

### 2. Purchase Edit Functionality
**File:** `src/app/ingredients/purchases/components/IngredientPurchasesLayout.tsx:114`

```typescript
// Replace toast.info with:
const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)

onEdit={(purchase) => {
  setEditingPurchase(purchase)
  // Open edit dialog
}}

// Add edit mutation
const editMutation = useMutation({
  mutationFn: async (data: PurchaseUpdate) => {
    const res = await fetch(`/api/ingredient-purchases/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
    return res.json()
  },
  onSuccess: () => {
    toast.success('Purchase updated')
    refetchPurchases()
  }
})
```

### 3. Chat Suggestions
**File:** `src/hooks/useContextAwareChat.ts:127`

```typescript
// Replace empty array with:
const suggestions = useMemo(() => {
  if (!messages.length) {
    return [
      { text: 'Berapa HPP resep terlaris saya?', category: 'hpp' },
      { text: 'Tampilkan laporan penjualan bulan ini', category: 'reports' },
      { text: 'Bahan apa yang perlu di-restock?', category: 'inventory' }
    ]
  }
  // Context-aware suggestions based on last message
  return generateContextSuggestions(messages[messages.length - 1])
}, [messages])
```

### 4. Ingredient Cost Tracking in Profit Report
**File:** `src/app/profit/hooks/useProfitData.ts:68`

```typescript
// Replace empty array with:
ingredients: (apiData.ingredient_costs || []).map(i => ({
  name: i.ingredient_name,
  quantity: i.quantity_used,
  cost: i.total_cost,
  unit: i.unit
}))
```

**Backend API update needed:**
```typescript
// Add to profit API response
const ingredientCosts = await supabase
  .from('recipe_ingredients')
  .select(`
    ingredient:ingredients(name, unit),
    quantity,
    ingredients(price_per_unit)
  `)
  .in('recipe_id', recipeIds)
```

---

## 🔄 Dependency Updates

### Update Outdated Package

```bash
# Update baseline-browser-mapping
pnpm update baseline-browser-mapping@latest -D

# Verify
pnpm list baseline-browser-mapping
```

---

## ✅ Verification Commands

Setelah melakukan fixes, jalankan:

```bash
# 1. Type check
pnpm run type-check:all

# 2. Lint
pnpm run lint:all

# 3. Build
pnpm run build

# 4. Test (jika ada)
pnpm test

# 5. Validate all
pnpm run validate:all
```

---

## 📋 Checklist

### Security (Do First!)
- [ ] Enable leaked password protection
- [ ] Fix function search path
- [ ] Move pg_net extension
- [ ] Verify RLS policies

### Database
- [ ] Run index usage query
- [ ] Document baseline metrics
- [ ] Set reminder for 3-month review

### Features
- [ ] Implement HPP trends API
- [ ] Add purchase edit functionality
- [ ] Implement chat suggestions
- [ ] Add ingredient cost tracking

### Dependencies
- [ ] Update baseline-browser-mapping
- [ ] Check for other outdated packages
- [ ] Update package.json

### Testing
- [ ] Run all verification commands
- [ ] Manual testing of critical flows
- [ ] Staging deployment test

---

## 🚨 Important Notes

1. **Backup First:** Always backup database before running SQL migrations
2. **Test in Staging:** Test all fixes in staging environment first
3. **Monitor:** Set up monitoring after deploying fixes
4. **Document:** Update documentation after implementing features

---

## 📞 Support

Jika ada masalah saat implementing fixes:
1. Check error logs di Supabase Dashboard
2. Review API logs di `/api/diagnostics`
3. Check browser console untuk client errors

---

**Last Updated:** December 1, 2025

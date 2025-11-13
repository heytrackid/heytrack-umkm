# Debug: Recipes Query Issue

## Problem
Halaman resep menampilkan "0 resep" meskipun database memiliki 9 resep aktif.

## Root Cause Analysis

### 1. Database ✅ FIXED
- Semua 22 resep sudah punya `created_by` yang benar
- 9 resep dengan `is_active = true`
- RLS policy menggunakan `user_id` untuk filter

### 2. API Endpoint ✅ WORKING
```bash
curl 'http://localhost:3000/api/recipes' -H 'Cookie: [auth-token]'
# Returns 9 recipes successfully
```

### 3. Frontend Query ⚠️ NEEDS VERIFICATION
File: `src/hooks/supabase/entities.ts`
```typescript
export function useRecipes(options?: { realtime?: boolean }): UseSupabaseQueryResult<'recipes'> {
  return useSupabaseQuery('recipes', {
    filter: { is_active: true },
    orderBy: { column: 'name' },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}
```

**Issue**: Query langsung ke Supabase, bukan ke API endpoint.
- Supabase client query menggunakan RLS policy
- RLS policy filter berdasarkan `user_id = auth.uid()`
- Jika session tidak ter-authenticate di client, query akan return empty

## Solution Options

### Option 1: Verify Client Authentication (RECOMMENDED)
User perlu:
1. Clear browser cache/cookies
2. Login ulang
3. Verify session di browser DevTools

### Option 2: Change to API-based Query
Ubah `useRecipes` untuk query ke API endpoint instead of direct Supabase:

```typescript
// src/hooks/api/useRecipes.ts
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const response = await fetch('/api/recipes')
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const result = await response.json()
      return result.data
    }
  })
}
```

### Option 3: Debug Client Session
Add debug logging to check if user is authenticated:

```typescript
// In EnhancedRecipesPage.tsx
useEffect(() => {
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user)
    console.log('Recipes data:', recipes)
  }
  checkAuth()
}, [recipes])
```

## Recommended Action

**For User:**
1. Open browser DevTools (F12)
2. Go to Application > Cookies
3. Clear all cookies for localhost:3000
4. Hard refresh (Cmd+Shift+R)
5. Login again with `heytrackid@gmail.com` / `testing123`
6. Check if recipes appear

**For Developer:**
If issue persists, consider switching from direct Supabase queries to API-based queries for better session handling and caching.

## Files to Check
- ✅ `src/hooks/supabase/entities.ts` - Query definition
- ✅ `src/hooks/supabase/core.ts` - Query implementation
- ✅ `src/components/recipes/EnhancedRecipesPage.tsx` - UI component
- ⚠️ Browser session/cookies - User needs to verify

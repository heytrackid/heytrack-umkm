# Frontend Migration Checklist

**Status:** 🟡 PENDING  
**Priority:** HIGH  
**Estimated Time:** 2-3 hours

## Overview

API routes have been standardized. Frontend code needs to be updated to use new endpoints.

---

## 🔍 Files to Search & Update

### 1. Operational Costs

**Search for:**
```bash
grep -r "operational-costs?id=" src/
grep -r "operational-costs\?id=" src/
```

**Replace:**
```typescript
// ❌ OLD
fetch(`/api/operational-costs?id=${id}`, { method: 'PUT' })
fetch(`/api/operational-costs?id=${id}`, { method: 'DELETE' })

// ✅ NEW
fetch(`/api/operational-costs/${id}`, { method: 'PUT' })
fetch(`/api/operational-costs/${id}`, { method: 'DELETE' })
```

**Likely files:**
- `src/app/operational-costs/page.tsx`
- `src/components/operational-costs/*.tsx`
- `src/hooks/useOperationalCosts.ts` (if exists)

---

### 2. Ingredient Purchases

**Search for:**
```bash
grep -r "ingredient-purchases?id=" src/
grep -r "ingredient-purchases\?id=" src/
```

**Replace:**
```typescript
// ❌ OLD
fetch(`/api/ingredient-purchases?id=${id}`, { method: 'DELETE' })

// ✅ NEW
fetch(`/api/ingredient-purchases/${id}`, { method: 'GET' })
fetch(`/api/ingredient-purchases/${id}`, { method: 'PUT' })
fetch(`/api/ingredient-purchases/${id}`, { method: 'DELETE' })
```

**Likely files:**
- `src/app/inventory/purchases/page.tsx`
- `src/components/inventory/*.tsx`
- `src/hooks/useIngredientPurchases.ts` (if exists)

---

### 3. HTTP Method Changes (PATCH → PUT)

**Search for:**
```bash
grep -r "method: 'PATCH'" src/
grep -r "method: \"PATCH\"" src/
```

**Replace in these endpoints:**
```typescript
// Notifications
// ❌ OLD: method: 'PATCH'
// ✅ NEW: method: 'PUT'
fetch(`/api/notifications/${id}`, { method: 'PUT' })

// Production Batches
fetch(`/api/production-batches/${id}`, { method: 'PUT' })

// Order Status
fetch(`/api/orders/${id}/status`, { method: 'PUT' })

// Inventory Alerts
fetch(`/api/inventory/alerts/${id}`, { method: 'PUT' })
```

**Likely files:**
- `src/components/notifications/*.tsx`
- `src/app/production/page.tsx`
- `src/components/orders/*.tsx`
- `src/components/inventory/alerts/*.tsx`
- `src/hooks/useNotifications.ts`
- `src/hooks/useProductionBatches.ts`

---

## 📋 Step-by-Step Migration

### Step 1: Find All Usages
```bash
# Run these searches
grep -r "operational-costs?id=" src/
grep -r "ingredient-purchases?id=" src/
grep -r "method: 'PATCH'" src/
grep -r 'method: "PATCH"' src/
```

### Step 2: Update Each File
For each file found:
1. Open file
2. Find the API call
3. Update URL pattern or HTTP method
4. Test the change
5. Check off below

### Step 3: Test Each Feature
- [ ] Operational costs CRUD works
- [ ] Ingredient purchases CRUD works
- [ ] Notifications mark as read works
- [ ] Production batch status update works
- [ ] Order status update works
- [ ] Inventory alerts acknowledge works

---

## 🎯 Migration Checklist

### Operational Costs
- [ ] Search for usages
- [ ] Update GET by ID calls
- [ ] Update PUT calls
- [ ] Update DELETE calls
- [ ] Test create operation
- [ ] Test update operation
- [ ] Test delete operation
- [ ] Test list operation

### Ingredient Purchases
- [ ] Search for usages
- [ ] Add GET by ID calls (if needed)
- [ ] Add PUT calls (if needed)
- [ ] Update DELETE calls
- [ ] Test create operation
- [ ] Test update operation (new feature!)
- [ ] Test delete operation
- [ ] Test stock adjustment on update
- [ ] Test stock revert on delete

### Notifications
- [ ] Search for PATCH usages
- [ ] Replace with PUT
- [ ] Test mark as read
- [ ] Test notification list

### Production Batches
- [ ] Search for PATCH usages
- [ ] Replace with PUT
- [ ] Test status update
- [ ] Test batch list

### Order Status
- [ ] Search for PATCH usages
- [ ] Replace with PUT
- [ ] Test status workflow
- [ ] Test status history

### Inventory Alerts
- [ ] Search for PATCH usages
- [ ] Replace with PUT
- [ ] Test acknowledge alert
- [ ] Test alert list

---

## 🧪 Testing Script

Create a test file to verify all endpoints:

```typescript
// test-api-standardization.ts
const tests = [
  // Operational Costs
  { name: 'GET operational cost', url: '/api/operational-costs/[id]', method: 'GET' },
  { name: 'PUT operational cost', url: '/api/operational-costs/[id]', method: 'PUT' },
  { name: 'DELETE operational cost', url: '/api/operational-costs/[id]', method: 'DELETE' },
  
  // Ingredient Purchases
  { name: 'GET ingredient purchase', url: '/api/ingredient-purchases/[id]', method: 'GET' },
  { name: 'PUT ingredient purchase', url: '/api/ingredient-purchases/[id]', method: 'PUT' },
  { name: 'DELETE ingredient purchase', url: '/api/ingredient-purchases/[id]', method: 'DELETE' },
  
  // Financial Records
  { name: 'GET financial record', url: '/api/financial/records/[id]', method: 'GET' },
  { name: 'PUT financial record', url: '/api/financial/records/[id]', method: 'PUT' },
  { name: 'DELETE financial record', url: '/api/financial/records/[id]', method: 'DELETE' },
  
  // HTTP Method Changes
  { name: 'PUT notification', url: '/api/notifications/[id]', method: 'PUT' },
  { name: 'PUT production batch', url: '/api/production-batches/[id]', method: 'PUT' },
  { name: 'PUT order status', url: '/api/orders/[id]/status', method: 'PUT' },
  { name: 'PUT inventory alert', url: '/api/inventory/alerts/[id]', method: 'PUT' },
]

// Run tests...
```

---

## 🚨 Breaking Changes

### 1. Query Param → Path Param
```typescript
// ❌ BREAKS: Old code using query params
const deleteOperationalCost = (id: string) => {
  return fetch(`/api/operational-costs?id=${id}`, { method: 'DELETE' })
}

// ✅ WORKS: New code using path params
const deleteOperationalCost = (id: string) => {
  return fetch(`/api/operational-costs/${id}`, { method: 'DELETE' })
}
```

### 2. PATCH → PUT
```typescript
// ❌ BREAKS: Old code using PATCH
const markAsRead = (id: string) => {
  return fetch(`/api/notifications/${id}`, { method: 'PATCH' })
}

// ✅ WORKS: New code using PUT
const markAsRead = (id: string) => {
  return fetch(`/api/notifications/${id}`, { method: 'PUT' })
}
```

---

## 📝 Notes

### New Features Available
1. **Ingredient Purchase Update** - You can now update purchase quantity (adjusts stock automatically)
2. **Financial Record CRUD** - Full CRUD support for manual financial entries

### Backward Compatibility
- ❌ Old endpoints are removed (no backward compatibility)
- ⚠️ Must update all frontend code before deploying

### Rollback Plan
If issues occur:
1. Revert API route files
2. Restore old endpoint patterns
3. Keep frontend code as-is

---

## ✅ Completion Criteria

Migration is complete when:
- [ ] All grep searches return no old patterns
- [ ] All features tested and working
- [ ] No console errors in browser
- [ ] No 404 errors in network tab
- [ ] All CRUD operations work correctly
- [ ] Stock adjustments work correctly
- [ ] Status updates work correctly

---

## 🎉 Post-Migration

After migration is complete:
1. Update API documentation
2. Update Postman/Insomnia collections
3. Update integration tests
4. Deploy to staging
5. Test on staging
6. Deploy to production
7. Monitor for errors

---

**Estimated Time:** 2-3 hours  
**Priority:** HIGH  
**Blocker:** Yes (must complete before next deployment)

# HeyTrack UMKM - Critical Improvements Implementation Plan

## 📋 Executive Summary
Ditemukan 12 critical/major issues dalam business logic dan UX flow. 
Document ini adalah implementation plan prioritized.

---

## 🎯 PHASE 1: CRITICAL FIXES (Already Started)

### ✅ 1.1 Database Schema Updates
**File:** `/supabase/migrations/20241031_add_stock_reservation_and_production_link.sql`
**Status:** ✅ Created
**Changes:**
- Added `reserved_stock` to ingredients
- Added `production_batch_id` to orders  
- Added `hpp_at_order`, `profit_amount`, `profit_margin` to order_items
- Created `stock_reservations` table
- Created `inventory_availability` view
- Added triggers for auto-update

### ✅ 1.2 Domain Types  
**File:** `/src/types/domain/stock-reservation.ts`
**Status:** ✅ Created

### ✅ 1.3 Stock Reservation Service
**File:** `/src/services/inventory/StockReservationService.ts`
**Status:** ✅ Created
**Features:**
- Reserve ingredients for order
- Release reservations (on cancel)
- Consume reservations (on delivery)
- Check order fulfillment

---

## 🚀 NEXT STEPS (To Complete)

### 1.4 Update Order Creation API
**File:** `/src/app/api/orders/route.ts` (POST)
**Changes Needed:**
```typescript
// ADD: Check ingredient availability BEFORE creating order
const fulfillment = await StockReservationService.checkOrderFulfillment(items)
if (!fulfillment.can_fulfill) {
  return NextResponse.json({
    error: 'Insufficient ingredients',
    details: fulfillment.insufficient_ingredients
  }, { status: 400 })
}

// ADD: Reserve ingredients AFTER order created
await StockReservationService.reserveIngredientsForOrder(
  orderId, 
  userId, 
  items
)

// ADD: Calculate and save HPP per item
for (const item of items) {
  const hpp = await HppCalculatorService.getLatestHpp(...)
  // Save hpp_at_order in order_items
}
```

### 1.5 Update Order Status Change
**File:** `/src/app/api/orders/[id]/status/route.ts`
**Changes Needed:**
```typescript
// When status = DELIVERED:
// 1. Consume reservations
await StockReservationService.consumeReservationsForOrder(orderId, userId)

// 2. Create COGS record (NOT JUST INCOME)
const cogsAmount = calculateTotalCOGS(orderItems)
await createFinancialRecord({
  type: 'EXPENSE',
  category: 'COGS',
  amount: cogsAmount,
  ...
})

// When status = CANCELLED:
await StockReservationService.releaseReservationsForOrder(orderId, userId)
```

### 1.6 Fix Inventory Update Service
**File:** `/src/modules/orders/services/InventoryUpdateService.ts`
**Changes Needed:**
```typescript
// REMOVE: Immediate stock deduction
// KEEP: Only stock transaction creation
// Let trigger handle actual stock updates
```

---

## 📊 PHASE 2: PRODUCTION INTEGRATION

### 2.1 Create Production Batch Service
**New File:** `/src/services/production/ProductionBatchService.ts`
**Features:**
- Auto-create batch from order(s)
- Assign orders to batch
- Calculate batch cost
- Track batch progress

### 2.2 Update Order API with Production Link
**File:** `/src/app/api/orders/route.ts`
```typescript
// Option 1: Auto-create batch for each order
// Option 2: User manually assigns to batch later
// Recommendation: Option 2 (more flexible)
```

### 2.3 Production Batch UI
**File:** `/src/app/production/page.tsx`
- Show pending orders
- Batch creation wizard
- Ingredient allocation view
- Cost tracking

---

## 🎨 PHASE 3: UI/UX IMPROVEMENTS

### 3.1 Dashboard Enhancements
**File:** `/src/app/dashboard/page.tsx`
- Add production schedule widget
- Add pending orders with deadline
- Add profit chart (Revenue vs COGS)
- Add quick actions

### 3.2 Order Form Improvements
**File:** `/src/app/orders/new/page.tsx`
- Add "Check Availability" button
- Show ingredient status per recipe
- Add production priority selector
- Show estimated production time

### 3.3 Inventory Page
**File:** `/src/app/ingredients/page.tsx`
- Add "Reserved" column
- Add "Available to Promise" column
- Show which orders reserve stock
- Better restock recommendations

---

## ✅ QUICK WINS (Can do in parallel)

### A. Auto-generate Order Number
```typescript
// In order creation
order_no: `ORD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${nextSequence}`
```

### B. Customer Discount Integration
```typescript
// In OrderPricingService.calculateOrderPricing
if (customer && customer.discount_percentage) {
  discount_percentage = customer.discount_percentage
}
```

### C. Recipe Availability Badge
```typescript
// In recipe list
<Badge variant={recipe.is_available ? 'success' : 'destructive'}>
  {recipe.is_available ? 'Available' : 'Low Stock'}
</Badge>
```

---

## 🔧 MIGRATION EXECUTION

### Step 1: Run Migration
```bash
# Connect to Supabase
supabase db push

# Or manually run:
psql -h [host] -U [user] -d [database] -f supabase/migrations/20241031_add_stock_reservation_and_production_link.sql
```

### Step 2: Regenerate Types
```bash
# Regenerate Supabase types after migration
npx supabase gen types typescript --local > src/types/supabase-generated.ts
```

### Step 3: Update Codebase
Follow sections 1.4, 1.5, 1.6 above

### Step 4: Test
```bash
pnpm build
pnpm test (if tests exist)
```

---

## 📝 TESTING CHECKLIST

### Critical Flow Test:
1. ✅ Create order → Check reservations created
2. ✅ Order confirmed → Check ingredients reserved
3. ✅ Order delivered → Check reservations consumed + COGS created
4. ✅ Order cancelled → Check reservations released
5. ✅ Create order with insufficient stock → Should fail
6. ✅ View ingredient page → Should show reserved stock
7. ✅ View dashboard → Should show accurate metrics

---

## 🎓 BUSINESS LOGIC SUMMARY

### Before (Current):
```
Order Created → Deduct Stock Immediately ❌
Order Delivered → Create Income ✅
```

### After (Improved):
```
Order Created → Check Availability → Reserve Stock ✅
Order Confirmed → Lock Reservation ✅
Order Delivered → Consume Reservation + Deduct Stock + Create Income + Create COGS ✅
Order Cancelled → Release Reservation ✅
```

---

## 📚 FILES MODIFIED/CREATED

### Created:
1. ✅ `/supabase/migrations/20241031_add_stock_reservation_and_production_link.sql`
2. ✅ `/src/types/domain/stock-reservation.ts`
3. ✅ `/src/services/inventory/StockReservationService.ts`

### To Modify:
4. `/src/app/api/orders/route.ts` (POST endpoint)
5. `/src/app/api/orders/[id]/status/route.ts`
6. `/src/modules/orders/services/InventoryUpdateService.ts`
7. `/src/modules/orders/services/OrderPricingService.ts`

### To Create (Phase 2):
8. `/src/services/production/ProductionBatchService.ts`
9. `/src/app/api/production-batches/assign-order/route.ts`

---

## ⚡ PRIORITY ORDER

1. **MUST DO NOW:**
   - Run migration
   - Update order creation API (1.4)
   - Update order status API (1.5)
   - Test critical flow

2. **DO THIS WEEK:**
   - Production batch integration (2.1, 2.2)
   - Dashboard improvements (3.1)
   - Order form improvements (3.2)

3. **DO NEXT:**
   - Inventory page enhancements (3.3)
   - Recipe versioning
   - WhatsApp integration

---

**Last Updated:** 2024-10-31  
**Status:** Phase 1 In Progress (40% complete)

# Backend Auto-Sync Implementation Summary

## Overview
Implementasi lengkap auto-sync dan konsistensi logika backend untuk HeyTrack.

## New Services Created

### 1. InventorySyncService (`src/services/inventory/InventorySyncService.ts`)
Handles automatic stock updates and WAC (Weighted Average Cost) calculations.

**Features:**
- `updateStockFromPurchase()` - Auto-update stock & WAC saat purchase
- `deductStockForProduction()` - Deduct stock saat production complete
- `deductStockForRecipeProduction()` - Batch deduct untuk semua ingredients dalam recipe
- `adjustStock()` - Manual stock adjustment (waste, correction)

**WAC Formula:**
```
New WAC = (Old Stock × Old WAC + New Qty × New Price) / (Old Stock + New Qty)
```

### 2. FinancialSyncService (`src/services/financial/FinancialSyncService.ts`)
Handles automatic financial record creation and synchronization.

**Features:**
- `createIncomeFromOrder()` - Auto-create income record saat order DELIVERED
- `createExpenseFromPurchase()` - Auto-create expense record saat purchase
- `reverseOrderIncome()` - Reverse income saat order CANCELLED
- `autoSyncAll()` - Sync semua unsynced transactions

### 3. HppTriggerService (`src/services/hpp/HppTriggerService.ts`)
Handles automatic HPP recalculation when upstream data changes.

**Triggers:**
- `onIngredientPriceChange()` - Recalc HPP untuk semua recipes yang pakai ingredient
- `onRecipeIngredientsChange()` - Recalc HPP saat recipe ingredients berubah
- `onOperationalCostsChange()` - Recalc HPP untuk semua active recipes
- `checkStaleHpp()` / `refreshStaleHpp()` - Refresh HPP yang sudah lama

### 4. CustomerStatsService (`src/services/stats/CustomerStatsService.ts`)
Handles automatic customer statistics updates.

**Features:**
- `updateStatsFromOrder()` - Update total_orders, total_spent, last_order_date
- `reverseStatsFromOrder()` - Reverse stats saat order cancelled

### 5. SupplierStatsService (`src/services/stats/SupplierStatsService.ts`)
Handles automatic supplier statistics updates.

**Features:**
- `updateStatsFromPurchase()` - Update total_orders, total_spent, last_order_date

## New API Endpoint

### `/api/financial/auto-sync`
- **GET** - Check sync status (unsynced orders & purchases count)
- **POST** - Trigger auto-sync for all unsynced transactions

## Updated API Routes

### 1. `/api/ingredient-purchases`
**POST** now automatically:
- ✅ Updates ingredient stock
- ✅ Calculates new WAC
- ✅ Creates stock_transaction record
- ✅ Creates inventory_stock_logs entry
- ✅ Creates expense financial_record
- ✅ Triggers HPP recalculation for affected recipes
- ✅ Updates supplier stats (total_orders, total_spent)

### 2. `/api/orders`
**POST** now automatically:
- ✅ Creates income record when status = DELIVERED
- ✅ Updates customer stats (total_orders, total_spent) when DELIVERED

**PUT** now automatically:
- ✅ Creates income record when status → DELIVERED
- ✅ Reverses income record when status → CANCELLED
- ✅ Updates customer stats when status → DELIVERED
- ✅ Reverses customer stats when DELIVERED → CANCELLED

### 3. `/api/production/batches`
**PUT** now automatically:
- ✅ Deducts inventory when status → COMPLETED
- ✅ Creates stock_transaction records for usage
- ✅ Creates inventory_stock_logs entries

### 4. `/api/ingredients`
**PUT** now automatically:
- ✅ Triggers HPP recalculation when price_per_unit changes

### 5. `/api/operational-costs`
**POST/PUT** now automatically:
- ✅ Triggers HPP recalculation for all active recipes

### 6. `/api/recipes`
**POST** now automatically:
- ✅ Calculates initial HPP for new recipe with ingredients

## Updated Hooks

### `useFinancialSync.ts`
- Added `useSyncStatus()` - Query untuk check sync status
- Enhanced `useAutoSyncFinancial()` - Invalidates more query keys

## Data Flow Diagrams

### Purchase Flow
```
Purchase Created
    ↓
├── Update ingredients.current_stock
├── Update ingredients.weighted_average_cost
├── Create stock_transactions (PURCHASE)
├── Create inventory_stock_logs
├── Create financial_records (EXPENSE)
└── Trigger HPP recalculation for affected recipes
```

### Order Delivery Flow
```
Order Status → DELIVERED
    ↓
└── Create financial_records (INCOME)
    └── Link to order.financial_record_id
```

### Order Cancellation Flow
```
Order Status → CANCELLED
    ↓
└── Delete linked financial_record
    └── Unlink order.financial_record_id
```

### Production Complete Flow
```
Production Status → COMPLETED
    ↓
├── Deduct ingredients.current_stock for each recipe ingredient
├── Create stock_transactions (USAGE) for each ingredient
└── Create inventory_stock_logs for each ingredient
```

### Price Change Flow
```
Ingredient price_per_unit updated
    ↓
└── Recalculate HPP for all recipes using this ingredient
    └── Update recipes.cost_per_unit
```

## Audit Resources Added
- `INGREDIENT` - For inventory sync operations
- `FINANCIAL_RECORD` - For financial sync operations

## Testing Recommendations

1. **Purchase Flow Test:**
   - Create ingredient purchase
   - Verify stock increased
   - Verify WAC recalculated
   - Verify expense record created
   - Verify HPP recalculated

2. **Order Flow Test:**
   - Create order with DELIVERED status
   - Verify income record created
   - Update order to CANCELLED
   - Verify income record deleted

3. **Production Flow Test:**
   - Create production batch
   - Update status to COMPLETED
   - Verify ingredient stocks decreased

4. **Auto-Sync Test:**
   - GET /api/financial/auto-sync (check status)
   - POST /api/financial/auto-sync (trigger sync)
   - Verify all unsynced records processed

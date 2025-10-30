# Color Neutralization Plan

## Objective
Mengubah semua warna non-netral menjadi warna netral (gray/muted), kecuali untuk fitur AI.

## Color Mapping

### Warna yang Akan Diubah:
- ❌ `text-blue-*` → ✅ `text-gray-*` atau `text-muted-foreground`
- ❌ `bg-blue-*` → ✅ `bg-gray-*` atau `bg-muted`
- ❌ `border-blue-*` → ✅ `border-gray-*` atau `border-muted`
- ❌ `text-green-*` → ✅ `text-gray-*` atau `text-muted-foreground`
- ❌ `bg-green-*` → ✅ `bg-gray-*` atau `bg-muted`
- ❌ `border-green-*` → ✅ `border-gray-*` atau `border-muted`
- ❌ `text-orange-*` → ✅ `text-gray-*` atau `text-muted-foreground`
- ❌ `bg-orange-*` → ✅ `bg-gray-*` atau `bg-muted`
- ❌ `border-orange-*` → ✅ `border-gray-*` atau `border-muted`
- ❌ `text-red-*` → ✅ `text-destructive` (untuk error)
- ❌ `bg-red-*` → ✅ `bg-destructive/10` (untuk error)
- ❌ `border-red-*` → ✅ `border-destructive` (untuk error)

### Exception (Tetap Berwarna):
- ✅ AI-related features (Sparkles icon, AI Generator, dll)
- ✅ Destructive actions (delete, error states)

## Files to Update

### Priority 1: Order Components
1. `src/modules/orders/components/OrdersPage.tsx`
2. `src/modules/orders/components/OrderForm/*.tsx`
3. `src/modules/orders/components/OrderStatusTimeline.tsx`
4. `src/components/orders/orders-table.tsx`

### Priority 2: Inventory Components
5. `src/modules/inventory/components/StockLevelVisualization.tsx`

### Priority 3: Other Components
6. `src/components/import/ImportDialog.tsx`
7. `src/components/admin/AdminDashboard.tsx`
8. `src/components/notifications/NotificationList.tsx`

## Implementation Strategy

1. Replace status colors with neutral variants
2. Keep destructive/error states with `destructive` variant
3. Use `muted` and `muted-foreground` for secondary information
4. Maintain visual hierarchy with opacity and font weight instead of color


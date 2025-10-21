# Currency Migration Guide

This guide explains how to migrate from hardcoded currency (Rp, IDR) to the dynamic currency system.

## Overview

The application now supports multiple currencies based on user settings. All hardcoded currency formatting should be replaced with the dynamic system.

## How to Use

### 1. In React Components

Use the `useCurrency` hook:

```tsx
import { useCurrency } from '@/hooks/useCurrency'

function MyComponent() {
  const { formatCurrency } = useCurrency()
  
  return (
    <div>
      <p>Price: {formatCurrency(150000)}</p>
      <p>Total: {formatCurrency(totalAmount)}</p>
    </div>
  )
}
```

### 2. In Non-React Contexts

Use the utility functions:

```typescript
import { formatCurrentCurrency } from '@/lib/currency'

// In API routes, services, or utilities
const priceText = formatCurrentCurrency(150000)
console.log(priceText) // "Rp 150,000" or "$150.00" depending on user settings
```

### 3. In Server Components or SSR

Use the shared currency utils:

```typescript
import { formatCurrency } from '@/shared/utils/currency'

// Will automatically use current user currency setting
const formatted = formatCurrency(150000)
```

## Migration Checklist

### Replace These Patterns:

❌ **OLD (Hardcoded):**
```typescript
// Don't do this anymore
`Rp ${amount.toLocaleString('id-ID')}`
`Rp ${amount.toLocaleString()}`
amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
```

✅ **NEW (Dynamic):**
```typescript
// React components
const { formatCurrency } = useCurrency()
formatCurrency(amount)

// Non-React contexts  
import { formatCurrentCurrency } from '@/lib/currency'
formatCurrentCurrency(amount)
```

### Files Already Updated:
- ✅ `src/lib/utils.ts` - Updated to use dynamic currency
- ✅ `src/lib/ai-chatbot-service.ts` - Removed hardcoded IDR references
- ✅ `src/lib/supabase-user-context.ts` - Cleaned up currency hardcoding
- ✅ `src/shared/utils/currency.ts` - Enhanced to use user settings
- ✅ `src/app/hpp/page.tsx` - Full migration example

### Files That Still Need Migration:

**High Priority (Frequently Used):**
- `src/modules/orders/components/OrderForm.tsx`
- `src/modules/inventory/components/InventoryTable.tsx`
- `src/components/orders/orders-table.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/finance/components/`
- `src/app/reports/page.tsx`

**Medium Priority:**
- `src/components/automation/` (various files)
- `src/modules/recipes/components/`
- API routes that return formatted currency

**Low Priority:**
- Documentation files
- Backup/test files

## Available Currencies

The system supports these currencies:

| Code | Symbol | Name | Decimals |
|------|--------|------|----------|
| IDR | Rp | Indonesian Rupiah | 0 |
| USD | $ | US Dollar | 2 |
| EUR | € | Euro | 2 |
| GBP | £ | British Pound | 2 |
| JPY | ¥ | Japanese Yen | 0 |
| SGD | S$ | Singapore Dollar | 2 |
| MYR | RM | Malaysian Ringgit | 2 |
| THB | ฿ | Thai Baht | 2 |
| VND | ₫ | Vietnamese Dong | 0 |
| PHP | ₱ | Philippine Peso | 2 |

## User Settings

Users can change their preferred currency in the Settings page. The setting is stored in localStorage and persists across sessions.

## Testing

To test different currencies:

1. Go to Settings page
2. Change currency preference
3. Verify all currency displays update throughout the app

## Benefits

- ✅ **User-friendly**: Users can choose their preferred currency
- ✅ **Maintainable**: No more hardcoded currency strings scattered throughout code
- ✅ **Consistent**: All currency formatting follows the same pattern
- ✅ **Flexible**: Easy to add new currencies or change formatting rules
- ✅ **Future-proof**: Ready for internationalization and multi-currency support
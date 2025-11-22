# Quick Reference - Code Consolidation

## 🎯 Single Source of Truth

### Constants → `@/lib/shared/constants`
```typescript
import { 
  ORDER_STATUSES,
  PAYMENT_METHODS,
  CUSTOMER_TYPES,
  getOrderStatusLabel,
  getOrderStatusColor,
  type OrderStatus
} from '@/lib/shared/constants'
```

### Currency → `@/lib/currency`
```typescript
import { 
  formatCurrentCurrency,
  formatCurrency,
  getCurrentCurrency,
  type Currency
} from '@/lib/currency'
```

---

## 📦 Available Constants

| Constant | Type | Use For |
|----------|------|---------|
| `ORDER_STATUSES` | Array | Order status dropdown |
| `PAYMENT_STATUSES` | Array | Payment status display |
| `PAYMENT_METHODS` | Array | Payment method selection |
| `CUSTOMER_TYPES` | Array | Customer type classification |
| `RECIPE_DIFFICULTIES` | Array | Recipe difficulty levels |
| `INGREDIENT_UNITS` | Array | Ingredient unit selection |
| `PRIORITY_LEVELS` | Array | Priority classification |
| `BUSINESS_UNITS` | Array | Business unit selection |
| `USER_ROLES` | Array | User role management |

---

## 🔧 Helper Functions

```typescript
// Status Helpers
getOrderStatusLabel('PENDING')      // → 'Menunggu'
getOrderStatusColor('PENDING')      // → 'bg-yellow-100 text-yellow-800'
getPaymentStatusLabel('PAID')       // → 'Sudah Dibayar'
getPaymentMethodLabel('CASH')       // → 'Tunai'
getCustomerTypeLabel('VIP')         // → 'VIP'
getRecipeDifficultyLabel('EASY')    // → 'Mudah'
getPriorityLevelLabel('HIGH')       // → 'Tinggi'
getPriorityLevelColor('HIGH')       // → 'bg-orange-100 text-orange-800'

// Currency Helpers
formatCurrentCurrency(10000)        // → 'Rp 10,000'
formatCurrency(10000, currency)     // → Custom currency format
getCurrentCurrency()                // → Currency object
getCurrencySymbol('IDR')            // → 'Rp'
```

---

## 🎨 Common Patterns

### Pattern 1: Status Badge
```typescript
<span className={getOrderStatusColor(order.status)}>
  {getOrderStatusLabel(order.status)}
</span>
```

### Pattern 2: Dropdown
```typescript
<select>
  {ORDER_STATUSES.map(s => (
    <option key={s.value} value={s.value}>{s.label}</option>
  ))}
</select>
```

### Pattern 3: Currency Display
```typescript
<div>{formatCurrentCurrency(order.total)}</div>
```

### Pattern 4: Type-Safe Props
```typescript
interface Props {
  status: OrderStatus
  method: PaymentMethod
}
```

---

## ⚠️ Deprecated (Still Works)

| Old Import | New Import |
|------------|------------|
| `@/lib/shared/form-utils` | `@/lib/shared/constants` |
| `@/shared` (for constants) | `@/lib/shared/constants` |
| `@/lib/shared/utilities` (formatCurrency) | `@/lib/currency` |

---

## 📚 Full Documentation

- **Complete Plan:** `CONSOLIDATION_PLAN.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Summary:** `CONSOLIDATION_SUMMARY.md`
- **Find Usages:** `scripts/find-duplicate-imports.sh`

---

**Last Updated:** 2025-11-22

# 📚 Library Directory Guide

**Location:** `src/lib/`  
**Purpose:** Centralized utilities, services, and business logic  
**Status:** ✅ Organized and documented

---

## 📁 Directory Structure

### Core Utilities (Basic Helpers)
```
└── utils.ts              - CSS class merging (cn function)
└── debounce.ts           - Debounce utility for event handling
└── logger.ts             - Centralized logging service
```

### Validation & Error Handling
```
errors/
├── index.ts              - Barrel export
└── AppError.ts           - Typed error system (9 error types)

validations.ts            - Zod schemas + validation helpers
```

### Database & API
```
supabase.ts               - Supabase client initialization
query-cache.ts            - Query result caching
api-cache.ts              - API response caching
api-validation.ts         - Request/response validation
```

### Currency & Financial Calculations
```
currency.ts               - Rupiah formatting & currency functions
hpp-calculator.ts         - HPP (Harga Pokok Produksi) calculations
```

### Business Logic
```
smart-inventory-intelligence.ts   - Inventory AI recommendations
smart-business.ts                  - Business insights & optimization
smart-notifications.ts             - Notification management
data-synchronization.ts            - Data sync & reconciliation
hpp-alert-detector.ts              - Price & margin alerts
hpp-snapshot-manager.ts            - Historical HPP snapshots
```

### AI & Automation
```
nlp-processor.ts                   - Natural language processing
ai-chatbot-service.ts              - Chatbot functionality
external-ai-service.ts             - External AI integrations
automation-engine.ts               - Main automation orchestrator
enhanced-automation-engine.ts       - Advanced automation features
cron-jobs.ts                        - Scheduled job management
```

### External Services
```
whatsapp-service.ts                - WhatsApp integration
```

### Performance & Optimization
```
performance.ts                     - Performance monitoring
performance-simple.ts              - Lightweight performance checks
query-optimization.ts              - Database query optimization
optimized-api.ts                   - API optimization strategies
```

### API & Production
```
enhanced-api.ts                    - Enhanced API utilities
sync-api.ts                        - Data synchronization APIs
production-automation.ts           - Production workflow automation
error-handler.ts                   - Error handling middleware
auth-errors.ts                     - Authentication error handling
```

---

## 🎯 Quick Import Guide

### Most Common Imports
```typescript
// Utilities
import { cn } from '@/lib'
import { debounce } from '@/lib'
import { logger } from '@/lib'

// Errors
import { AppError, ValidationError, handleError } from '@/lib/errors'

// Validation
import { validateInput, IngredientSchema } from '@/lib'

// Database
import { createSupabaseClient } from '@/lib'

// Currency
import { formatCurrentCurrency, formatRupiah } from '@/lib'

// Business Logic
import { calculateHPP, detectAlerts, getSnapshots } from '@/lib'
```

### By Use Case

**Building a Feature:**
```typescript
import { cn } from '@/lib'
import { validateInput, IngredientSchema } from '@/lib'
import { createSupabaseClient } from '@/lib'
import { logger } from '@/lib'
```

**Error Handling:**
```typescript
import { AppError, ValidationError, handleError, logError } from '@/lib/errors'
```

**HPP Calculations:**
```typescript
import { calculateHPP, detectAlerts, takeSnapshot } from '@/lib'
```

**AI & Automation:**
```typescript
import { runAutomation, processChatbotQuery, generateAIInsights } from '@/lib'
```

---

## 📊 File Statistics

| Category | Files | Total Lines |
|----------|-------|------------|
| Core Utilities | 3 | 150 |
| Validation & Errors | 2 | 450 |
| Database & API | 4 | 2,000 |
| Financial | 2 | 800 |
| Business Logic | 6 | 3,000 |
| AI & Automation | 6 | 3,500 |
| External Services | 1 | 400 |
| Performance | 4 | 1,500 |
| API & Production | 6 | 2,400 |
| **TOTAL** | **34** | **14,200** |

---

## 🔍 Finding Utilities

### If you need to...

**Format currency/money:**
```
→ src/lib/currency.ts
import { formatCurrentCurrency, formatRupiah } from '@/lib'
```

**Handle errors safely:**
```
→ src/lib/errors/
import { AppError, handleError } from '@/lib/errors'
```

**Validate user input:**
```
→ src/lib/validations.ts
import { validateInput, IngredientSchema } from '@/lib'
```

**Query database:**
```
→ src/lib/supabase.ts
import { createSupabaseClient } from '@/lib'
```

**Calculate HPP/margins:**
```
→ src/lib/hpp-calculator.ts
import { calculateHPP } from '@/lib'
```

**Detect price alerts:**
```
→ src/lib/hpp-alert-detector.ts
import { detectAlerts } from '@/lib'
```

**Run automation:**
```
→ src/lib/automation-engine.ts
import { runAutomation } from '@/lib'
```

**Process AI requests:**
```
→ src/lib/ai-chatbot-service.ts
import { getAIChatResponse } from '@/lib'
```

**Monitor performance:**
```
→ src/lib/performance.ts
import { measurePerformance } from '@/lib'
```

---

## 🚀 Best Practices

### ✅ DO:
- ✅ Import from barrel exports (`@/lib` instead of `@/lib/utils/something`)
- ✅ Use typed errors (`AppError`, `ValidationError`) instead of throwing strings
- ✅ Validate inputs using Zod schemas when possible
- ✅ Log errors using the centralized logger
- ✅ Cache database queries for frequently accessed data

### ❌ DON'T:
- ❌ Create new util files in lib root without organizing them
- ❌ Throw generic Error objects (use `AppError` instead)
- ❌ Duplicate validation logic (use schemas from `validations.ts`)
- ❌ Direct `console.log` (use `logger` instead)
- ❌ Make API calls without caching consideration

---

## 📝 Adding New Utilities

1. **Determine Category:** Which category does your utility belong to?
2. **Create File:** `src/lib/category-name.ts`
3. **Add Exports:** Export from barrel (`src/lib/index.ts`)
4. **Add JSDoc:** Document functions with examples
5. **Update This Guide:** Add to appropriate section

---

## 🔗 Related Documentation

- **Hooks:** See `src/hooks/index.ts`
- **Utils:** See `src/utils/index.ts`
- **Components:** See `src/components/ui/index.ts`
- **Error Handling:** See `LIB_DIRECTORY_GUIDE.md` (this file)

---

**Last Updated:** Oct 23, 2024  
**Maintainer:** Development Team

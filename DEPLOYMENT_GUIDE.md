# 🚀 Deployment Guide

## Pre-Deployment Checklist

### 1. Code Review
- [x] All TypeScript errors fixed
- [x] All services implemented
- [x] All API endpoints tested
- [x] React hooks created
- [x] UI components built
- [x] Documentation complete

### 2. Database Preparation
- [ ] Backup current database
- [ ] Review migration file
- [ ] Test migration on staging
- [ ] Verify rollback plan

### 3. Environment Setup
- [ ] Environment variables configured
- [ ] API keys secured
- [ ] Database connection tested
- [ ] Supabase project ready

---

## Deployment Steps

### Step 1: Apply Database Migration

```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Using Supabase Dashboard
# 1. Go to Database > Migrations
# 2. Upload migration file:
#    supabase/migrations/20241031_add_stock_reservation_and_production_link.sql
# 3. Click "Run Migration"

# Option C: Using MCP (if available)
# Already applied via mcp_supabase_apply_migration
```

**Verify Migration:**
```sql
-- Check new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ingredients' 
  AND column_name IN ('reserved_stock', 'available_stock');

-- Check new table exists
SELECT * FROM stock_reservations LIMIT 1;

-- Check view exists
SELECT * FROM inventory_availability LIMIT 1;
```

---

### Step 2: Regenerate TypeScript Types

```bash
# Using Supabase CLI
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase-generated.ts

# Or using MCP
# Already done via mcp_supabase_generate_typescript_types
```

**Verify Types:**
```typescript
// Check that new types are available
import type { Database } from '@/types/supabase-generated'

type StockReservation = Database['public']['Tables']['stock_reservations']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']
// Should have reserved_stock and available_stock
```

---

### Step 3: Deploy Application

```bash
# Install dependencies
npm install

# Build application
npm run build

# Test build locally
npm run start

# Deploy to Vercel (or your platform)
vercel --prod

# Or using Git push (if auto-deploy configured)
git add .
git commit -m "feat: implement order-production-inventory flow"
git push origin main
```

---

### Step 4: Post-Deployment Verification

#### 4.1 Test Stock Reservation
```bash
# Create test order with CONFIRMED status
curl -X POST https://your-domain.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_no": "TEST-001",
    "status": "CONFIRMED",
    "items": [{"recipe_id": "...", "quantity": 1, "unit_price": 50000}]
  }'

# Verify reservation created
# Check database: SELECT * FROM stock_reservations WHERE order_id = '...';
```

#### 4.2 Test Production Suggestions
```bash
# Get suggestions
curl https://your-domain.com/api/production/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return suggestions based on pending orders
```

#### 4.3 Test Financial Records
```bash
# Change order to DELIVERED
curl -X PUT https://your-domain.com/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "DELIVERED"}'

# Verify financial records created
# Check database: 
# SELECT * FROM financial_records WHERE reference LIKE '%ORDER_NO%';
```

#### 4.4 Test Dashboard
```bash
# Get dashboard data
curl https://your-domain.com/api/dashboard/production-schedule \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return today's schedule, pending orders, and low stock
```

---

### Step 5: Monitor & Validate

#### Check Error Logs
```bash
# Vercel logs
vercel logs --follow

# Or check Supabase logs
# Dashboard > Logs > API Logs
```

#### Monitor Key Metrics
- [ ] Order creation success rate
- [ ] Stock reservation accuracy
- [ ] Financial record creation
- [ ] API response times
- [ ] Database query performance

#### Validate Business Logic
- [ ] Stock is reserved on CONFIRMED
- [ ] Stock is released on CANCELLED
- [ ] Stock is consumed on DELIVERED
- [ ] Income + COGS created on DELIVERED
- [ ] Profit calculated correctly

---

## Rollback Plan

### If Issues Occur:

#### 1. Rollback Application
```bash
# Vercel
vercel rollback

# Or redeploy previous version
git revert HEAD
git push origin main
```

#### 2. Rollback Database (if needed)
```sql
-- Drop new table
DROP TABLE IF EXISTS stock_reservations CASCADE;

-- Remove new columns
ALTER TABLE ingredients 
  DROP COLUMN IF EXISTS reserved_stock,
  DROP COLUMN IF EXISTS available_stock;

ALTER TABLE orders
  DROP COLUMN IF EXISTS production_batch_id,
  DROP COLUMN IF EXISTS production_priority,
  DROP COLUMN IF EXISTS estimated_production_time;

ALTER TABLE order_items
  DROP COLUMN IF EXISTS hpp_at_order,
  DROP COLUMN IF EXISTS profit_amount,
  DROP COLUMN IF EXISTS profit_margin;

ALTER TABLE productions
  DROP COLUMN IF EXISTS batch_status,
  DROP COLUMN IF EXISTS total_orders,
  DROP COLUMN IF EXISTS actual_material_cost,
  DROP COLUMN IF EXISTS actual_labor_cost,
  DROP COLUMN IF EXISTS actual_overhead_cost,
  DROP COLUMN IF EXISTS actual_total_cost,
  DROP COLUMN IF EXISTS planned_start_time,
  DROP COLUMN IF EXISTS actual_start_time,
  DROP COLUMN IF EXISTS completed_time;

-- Drop view
DROP VIEW IF EXISTS inventory_availability;

-- Drop functions
DROP FUNCTION IF EXISTS update_ingredient_reserved_stock();
```

---

## Environment Variables

### Required Variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Optional Variables:
```env
# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_STOCK_RESERVATION=true
ENABLE_PRODUCTION_SUGGESTIONS=true
ENABLE_LOYALTY_POINTS=true
```

---

## Performance Optimization

### Database Indexes (Already Applied)
```sql
-- Verify indexes exist
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename IN ('stock_reservations', 'orders', 'order_items');
```

### API Caching
```typescript
// React Query configuration (already implemented)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1
    }
  }
})
```

---

## Monitoring Setup

### Key Metrics to Track:

1. **API Performance**
   - Response time per endpoint
   - Error rate
   - Request volume

2. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Slow queries

3. **Business Metrics**
   - Orders created per day
   - Stock reservation accuracy
   - Financial record creation rate
   - Production batch efficiency

### Recommended Tools:
- **Vercel Analytics** - Frontend performance
- **Supabase Dashboard** - Database metrics
- **Sentry** - Error tracking (optional)
- **LogRocket** - Session replay (optional)

---

## Security Checklist

### Pre-Production:
- [x] All APIs require authentication
- [x] Row-level security (RLS) enabled
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS prevention
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] API keys rotated

### Post-Production:
- [ ] Monitor for suspicious activity
- [ ] Review access logs regularly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly

---

## Support & Troubleshooting

### Common Issues:

#### Issue 1: Stock Not Reserving
**Symptoms:** Order confirmed but no reservations created

**Debug:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_reserved_stock';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'update_ingredient_reserved_stock';

-- Manually test reservation
INSERT INTO stock_reservations (ingredient_id, order_id, reserved_quantity, user_id)
VALUES ('ingredient-id', 'order-id', 10, 'user-id');

-- Check if reserved_stock updated
SELECT name, current_stock, reserved_stock, available_stock 
FROM inventory_availability 
WHERE id = 'ingredient-id';
```

**Solution:**
- Verify migration applied correctly
- Check trigger is enabled
- Review service logs for errors

#### Issue 2: Financial Records Not Created
**Symptoms:** Order delivered but no income/COGS records

**Debug:**
```sql
-- Check if records exist
SELECT * FROM financial_records 
WHERE reference LIKE '%ORDER_NO%'
ORDER BY created_at DESC;

-- Check order status
SELECT id, order_no, status, financial_record_id 
FROM orders 
WHERE order_no = 'ORDER_NO';
```

**Solution:**
- Verify order status is DELIVERED
- Check order has items with hpp_at_order
- Review API logs for errors

#### Issue 3: Production Suggestions Empty
**Symptoms:** No suggestions returned despite pending orders

**Debug:**
```sql
-- Check pending orders without batch
SELECT id, order_no, status, production_batch_id 
FROM orders 
WHERE status IN ('CONFIRMED', 'IN_PROGRESS')
  AND production_batch_id IS NULL;

-- Check order items
SELECT oi.*, r.name 
FROM order_items oi
JOIN recipes r ON r.id = oi.recipe_id
WHERE oi.order_id IN (SELECT id FROM orders WHERE production_batch_id IS NULL);
```

**Solution:**
- Verify orders have status CONFIRMED or IN_PROGRESS
- Check orders don't already have production_batch_id
- Ensure order_items exist

---

## Contact & Support

### For Technical Issues:
- Check logs in Vercel/Supabase dashboard
- Review error messages in browser console
- Check database query logs

### For Business Logic Questions:
- Refer to IMPLEMENTATION_SUMMARY.md
- Check API_DOCUMENTATION.md
- Review QUICK_START_GUIDE.md

---

## Success Criteria

### Deployment is successful when:
- [x] Migration applied without errors
- [ ] All API endpoints responding
- [ ] Stock reservations working
- [ ] Financial records creating
- [ ] Production suggestions showing
- [ ] Dashboard loading correctly
- [ ] No critical errors in logs
- [ ] Performance within acceptable range

---

## Next Steps After Deployment

1. **Week 1: Monitor Closely**
   - Check logs daily
   - Verify all workflows
   - Gather user feedback
   - Fix any critical issues

2. **Week 2-4: Optimize**
   - Analyze performance metrics
   - Optimize slow queries
   - Improve user experience
   - Add missing features

3. **Month 2+: Enhance**
   - Implement Phase 2 features
   - Add advanced analytics
   - Automate more workflows
   - Scale infrastructure

---

**🎉 Ready to Deploy!**

Follow this guide step by step, and you'll have a smooth deployment. Good luck! 🚀

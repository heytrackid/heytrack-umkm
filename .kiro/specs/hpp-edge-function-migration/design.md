# Design Document: HPP Edge Function Migration

## Overview

This document outlines the design for migrating the HPP daily snapshot cron job from a Next.js API Route to a Supabase Edge Function. The migration will leverage Supabase's serverless infrastructure to provide better performance, lower costs, and improved scalability for scheduled background tasks.

### Current Architecture

```
Vercel Cron (daily 00:00)
    ↓
Next.js API Route (/api/cron/hpp-snapshots)
    ↓
cron-jobs.ts (createDailyHPPSnapshots)
    ↓
Fetches users → Calls /api/hpp/snapshot for each user
    ↓
hpp-snapshot-manager.ts (createSnapshot)
    ↓
hpp-calculator.ts (calculateHPP)
    ↓
Supabase Database (hpp_snapshots table)
```

### Target Architecture

```
pg-cron (PostgreSQL scheduler)
    ↓
Supabase Edge Function (hpp-daily-snapshots)
    ↓
Direct database queries via Supabase client
    ↓
HPP calculation logic (ported to Deno)
    ↓
Supabase Database (hpp_snapshots table)
```

## Architecture

### System Components

#### 1. Edge Function Entry Point

**File:** `supabase/functions/hpp-daily-snapshots/index.ts`

**Responsibilities:**
- Receive HTTP POST requests from pg-cron
- Validate authorization token
- Orchestrate snapshot creation workflow
- Return execution metrics

**Technology Stack:**
- Deno runtime
- Supabase JavaScript client v2
- TypeScript

#### 2. HPP Calculation Module

**File:** `supabase/functions/hpp-daily-snapshots/hpp-calculator.ts`

**Responsibilities:**
- Calculate material costs from recipe ingredients
- Calculate operational costs per unit
- Generate cost breakdown structure
- Return complete HPP calculation result

**Key Functions:**
- `calculateHPP(recipeId, userId, supabase)`: Main calculation function
- `calculateMonthlyCost(cost)`: Convert recurring costs to monthly amounts
- `estimateMonthlyProduction(recipeId, userId, supabase)`: Estimate production volume

#### 3. Snapshot Manager Module

**File:** `supabase/functions/hpp-daily-snapshots/snapshot-manager.ts`

**Responsibilities:**
- Create snapshot records in database
- Validate snapshot data
- Handle batch processing
- Track creation metrics

**Key Functions:**
- `createSnapshot(recipeId, userId, supabase)`: Create single snapshot
- `createSnapshotsForUser(userId, supabase)`: Create all snapshots for a user
- `createSnapshotsForAllUsers(supabase)`: Orchestrate full batch creation

#### 4. Database Scheduler

**Migration File:** `supabase/migrations/YYYYMMDD_setup_hpp_cron.sql`

**Responsibilities:**
- Enable pg-cron extension
- Create scheduled job for daily execution
- Configure job parameters and authentication

## Components and Interfaces

### Edge Function Interface

```typescript
// Request
POST /functions/v1/hpp-daily-snapshots
Headers:
  Authorization: Bearer <service-role-key>
  Content-Type: application/json

// Response (Success)
{
  "success": true,
  "data": {
    "total_users": 10,
    "total_recipes": 150,
    "snapshots_created": 150,
    "snapshots_failed": 0,
    "execution_time_ms": 5432,
    "timestamp": "2025-01-23T00:00:00.000Z"
  }
}

// Response (Error)
{
  "success": false,
  "error": "Error message",
  "details": {
    "code": "ERROR_CODE",
    "message": "Detailed error message"
  }
}
```

### HPP Calculation Interface

```typescript
interface HPPCalculationInput {
  recipeId: string
  userId: string
  supabase: SupabaseClient
}

interface HPPCalculationResult {
  total_hpp: number
  material_cost: number
  operational_cost: number
  breakdown: {
    ingredients: Array<{
      id: string
      name: string
      cost: number
      percentage: number
    }>
    operational: Array<{
      category: string
      cost: number
      percentage: number
    }>
  }
}
```

### Snapshot Data Interface

```typescript
interface SnapshotData {
  recipe_id: string
  user_id: string
  snapshot_date: string  // ISO 8601 format
  hpp_value: number
  material_cost: number
  operational_cost: number
  cost_breakdown: CostBreakdown
  selling_price: number | null
  margin_percentage: number | null
}

interface CostBreakdown {
  ingredients: IngredientCost[]
  operational: OperationalCost[]
}
```

## Data Models

### Database Tables

#### hpp_snapshots

```sql
CREATE TABLE hpp_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ NOT NULL,
  hpp_value DECIMAL(15,2) NOT NULL,
  material_cost DECIMAL(15,2) NOT NULL,
  operational_cost DECIMAL(15,2) NOT NULL,
  cost_breakdown JSONB NOT NULL,
  selling_price DECIMAL(15,2),
  margin_percentage DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hpp_snapshots_recipe ON hpp_snapshots(recipe_id);
CREATE INDEX idx_hpp_snapshots_user ON hpp_snapshots(user_id);
CREATE INDEX idx_hpp_snapshots_date ON hpp_snapshots(snapshot_date DESC);
```

#### recipes

```sql
-- Existing table, relevant columns:
- id UUID PRIMARY KEY
- user_id UUID NOT NULL
- name TEXT NOT NULL
- servings INTEGER
- is_active BOOLEAN DEFAULT true
```

#### recipe_ingredients

```sql
-- Existing table, relevant columns:
- id UUID PRIMARY KEY
- recipe_id UUID NOT NULL
- ingredient_id UUID NOT NULL
- quantity DECIMAL(10,3) NOT NULL
- unit TEXT NOT NULL
```

#### ingredients

```sql
-- Existing table, relevant columns:
- id UUID PRIMARY KEY
- user_id UUID NOT NULL
- name TEXT NOT NULL
- price_per_unit DECIMAL(15,2) NOT NULL
- current_stock DECIMAL(10,3)
```

#### operational_costs

```sql
-- Existing table, relevant columns:
- id UUID PRIMARY KEY
- user_id UUID NOT NULL
- category TEXT NOT NULL
- amount DECIMAL(15,2) NOT NULL
- date TIMESTAMPTZ NOT NULL
- recurring BOOLEAN DEFAULT false
- frequency TEXT  -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
```

## Error Handling

### Error Categories

#### 1. Authentication Errors

```typescript
{
  code: 'AUTH_FAILED',
  message: 'Invalid or missing authorization token',
  status: 401
}
```

**Handling:**
- Return 401 immediately
- Log authentication attempt
- Do not proceed with execution

#### 2. Database Connection Errors

```typescript
{
  code: 'DB_CONNECTION_FAILED',
  message: 'Failed to connect to database',
  status: 500
}
```

**Handling:**
- Retry connection once
- Log error details
- Return 500 with error message

#### 3. Calculation Errors

```typescript
{
  code: 'CALCULATION_FAILED',
  message: 'HPP calculation failed for recipe',
  context: {
    recipe_id: string,
    user_id: string,
    error: string
  }
}
```

**Handling:**
- Log error with context
- Continue processing other recipes
- Include in error summary

#### 4. Data Validation Errors

```typescript
{
  code: 'INVALID_DATA',
  message: 'Snapshot data validation failed',
  context: {
    recipe_id: string,
    validation_errors: string[]
  }
}
```

**Handling:**
- Skip invalid snapshot
- Log validation errors
- Continue processing

### Error Recovery Strategy

```typescript
// Pseudo-code for error handling flow
async function createSnapshotsWithErrorHandling() {
  const errors = []
  const successes = []
  
  try {
    const users = await fetchUsers()
    
    for (const user of users) {
      try {
        const result = await createSnapshotsForUser(user.id)
        successes.push(result)
      } catch (error) {
        errors.push({
          user_id: user.id,
          error: error.message,
          timestamp: new Date().toISOString()
        })
        // Continue to next user
      }
    }
    
    return {
      success: errors.length === 0,
      successes,
      errors,
      summary: {
        total: users.length,
        succeeded: successes.length,
        failed: errors.length
      }
    }
  } catch (fatalError) {
    // Fatal error - cannot continue
    throw fatalError
  }
}
```

## Testing Strategy

### Unit Tests

**Test File:** `supabase/functions/hpp-daily-snapshots/test.ts`

#### Test Cases:

1. **HPP Calculation Tests**
   - Calculate HPP with valid recipe data
   - Handle missing ingredients
   - Handle zero operational costs
   - Calculate percentages correctly
   - Handle edge cases (zero production, negative costs)

2. **Snapshot Creation Tests**
   - Create snapshot with valid data
   - Validate snapshot data structure
   - Handle duplicate snapshots
   - Handle database errors

3. **Authorization Tests**
   - Accept valid service role key
   - Reject invalid tokens
   - Reject missing authorization header

4. **Error Handling Tests**
   - Handle database connection failures
   - Handle calculation errors
   - Continue processing after individual failures
   - Return proper error responses

### Integration Tests

**Test Script:** `scripts/test-hpp-edge-function.ts`

#### Test Scenarios:

1. **End-to-End Snapshot Creation**
   - Invoke Edge Function with valid auth
   - Verify snapshots created in database
   - Verify calculation accuracy
   - Check execution metrics

2. **Multi-User Processing**
   - Create test users with recipes
   - Invoke Edge Function
   - Verify all users processed
   - Check error handling for problematic users

3. **Performance Testing**
   - Test with 100+ users
   - Measure execution time
   - Verify no timeouts
   - Check memory usage

4. **Scheduling Test**
   - Verify pg-cron job exists
   - Manually trigger pg-cron job
   - Verify Edge Function invoked
   - Check execution logs

### Manual Testing Checklist

```bash
# 1. Deploy Edge Function
supabase functions deploy hpp-daily-snapshots

# 2. Test manual invocation
curl -X POST https://[project-ref].supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer [service-role-key]" \
  -H "Content-Type: application/json"

# 3. Verify database records
SELECT COUNT(*) FROM hpp_snapshots 
WHERE snapshot_date >= CURRENT_DATE;

# 4. Check pg-cron schedule
SELECT * FROM cron.job WHERE jobname = 'hpp-daily-snapshots';

# 5. View Edge Function logs
supabase functions logs hpp-daily-snapshots --tail

# 6. Test error scenarios
# - Invalid auth token
# - Missing recipes
# - Database connection issues
```

## Implementation Details

### Edge Function Structure

```
supabase/functions/hpp-daily-snapshots/
├── index.ts                 # Main entry point
├── hpp-calculator.ts        # HPP calculation logic
├── snapshot-manager.ts      # Snapshot creation logic
├── types.ts                 # TypeScript interfaces
├── utils.ts                 # Utility functions
└── test.ts                  # Unit tests
```

### Key Implementation Patterns

#### 1. Supabase Client Initialization

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

#### 2. Authorization Middleware

```typescript
function validateAuthorization(req: Request): boolean {
  const authHeader = req.headers.get('Authorization')
  const expectedToken = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
  
  return authHeader === expectedToken
}
```

#### 3. Batch Processing Pattern

```typescript
async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  batchSize: number = 10
): Promise<{ successes: number; errors: Error[] }> {
  const errors: Error[] = []
  let successes = 0
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    
    const results = await Promise.allSettled(
      batch.map(item => processor(item))
    )
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successes++
      } else {
        errors.push(result.reason)
      }
    })
    
    // Small delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  
  return { successes, errors }
}
```

#### 4. Structured Logging

```typescript
function log(level: 'info' | 'warn' | 'error', message: string, context?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  }
  
  console.log(JSON.stringify(logEntry))
}
```

### pg-cron Configuration

```sql
-- Enable pg-cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron job for daily HPP snapshots
SELECT cron.schedule(
  'hpp-daily-snapshots',           -- Job name
  '0 0 * * *',                     -- Cron expression (daily at 00:00 UTC)
  $$
  SELECT
    net.http_post(
      url := 'https://[project-ref].supabase.co/functions/v1/hpp-daily-snapshots',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Store service role key in database settings
ALTER DATABASE postgres SET app.service_role_key = '[service-role-key]';
```

### Environment Variables

```bash
# Edge Function Secrets (set via Supabase CLI)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Optional configuration
BATCH_SIZE=10
MAX_EXECUTION_TIME_MS=300000  # 5 minutes
LOG_LEVEL=info
```

## Migration Steps

### Phase 1: Preparation

1. **Create Edge Function skeleton**
   - Initialize function directory
   - Set up TypeScript configuration
   - Create basic entry point

2. **Port calculation logic**
   - Convert hpp-calculator.ts to Deno
   - Update imports to use JSR/esm.sh
   - Test calculation logic independently

3. **Port snapshot manager logic**
   - Convert snapshot-manager.ts to Deno
   - Update database queries
   - Test snapshot creation

### Phase 2: Deployment

1. **Deploy Edge Function**
   ```bash
   supabase functions deploy hpp-daily-snapshots
   ```

2. **Set up secrets**
   ```bash
   supabase secrets set SUPABASE_URL=[url]
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[key]
   ```

3. **Create database migration**
   ```bash
   supabase migration new setup_hpp_cron
   # Add pg-cron configuration
   supabase db push
   ```

### Phase 3: Testing

1. **Manual invocation test**
   - Call Edge Function directly
   - Verify snapshots created
   - Check execution metrics

2. **Scheduled execution test**
   - Wait for pg-cron trigger
   - Verify automatic execution
   - Check logs

3. **Load testing**
   - Test with production data volume
   - Monitor performance
   - Verify no timeouts

### Phase 4: Cutover

1. **Disable Vercel Cron**
   - Remove from vercel.json
   - Deploy Next.js app

2. **Monitor Edge Function**
   - Check daily executions
   - Review logs for errors
   - Verify data consistency

3. **Deprecate old endpoint**
   - Add deprecation notice
   - Keep for 30 days
   - Remove after verification

## Performance Considerations

### Optimization Strategies

1. **Parallel Processing**
   - Process multiple users concurrently
   - Use Promise.allSettled for batch operations
   - Limit concurrency to avoid overwhelming database

2. **Query Optimization**
   - Use selective field fetching
   - Leverage database indexes
   - Batch database operations where possible

3. **Memory Management**
   - Process users in batches
   - Clear large objects after processing
   - Monitor memory usage

4. **Execution Time**
   - Target < 5 minutes total execution
   - Implement timeout warnings
   - Consider splitting into multiple jobs if needed

### Expected Performance Metrics

| Metric | Target | Maximum |
|--------|--------|---------|
| Execution Time | < 2 minutes | < 5 minutes |
| Snapshots/Second | > 10 | N/A |
| Memory Usage | < 256 MB | < 512 MB |
| Error Rate | < 1% | < 5% |
| Database Connections | < 10 | < 25 |

## Security Considerations

### Authentication & Authorization

1. **Service Role Key Protection**
   - Store in Supabase secrets
   - Never log or expose in responses
   - Rotate periodically

2. **Request Validation**
   - Verify authorization header
   - Reject unauthorized requests immediately
   - Log authentication attempts

3. **Database Access**
   - Use service role for elevated permissions
   - Respect RLS policies where applicable
   - Audit database operations

### Data Protection

1. **Sensitive Data Handling**
   - Don't log sensitive user data
   - Sanitize error messages
   - Use structured logging

2. **Input Validation**
   - Validate all database inputs
   - Prevent SQL injection
   - Handle malformed data gracefully

## Monitoring and Observability

### Logging Strategy

```typescript
// Structured log format
{
  timestamp: "2025-01-23T00:00:00.000Z",
  level: "info",
  message: "Snapshot creation started",
  context: {
    user_id: "uuid",
    recipe_count: 10
  }
}
```

### Key Metrics to Track

1. **Execution Metrics**
   - Total execution time
   - Snapshots created per execution
   - Error count and rate
   - Users processed

2. **Performance Metrics**
   - Average time per snapshot
   - Database query duration
   - Memory usage
   - CPU usage

3. **Business Metrics**
   - Daily snapshot count
   - User coverage
   - Data completeness
   - Trend analysis

### Alerting

**Alert Conditions:**
- Execution failure (no snapshots created)
- High error rate (> 5%)
- Execution timeout (> 5 minutes)
- Database connection failures

**Alert Channels:**
- Supabase dashboard notifications
- Email alerts (if configured)
- Logging service integration

## Rollback Plan

### Rollback Triggers

- Edge Function execution failures > 50%
- Data inconsistencies detected
- Performance degradation
- Critical bugs discovered

### Rollback Steps

1. **Disable pg-cron job**
   ```sql
   SELECT cron.unschedule('hpp-daily-snapshots');
   ```

2. **Re-enable Vercel Cron**
   - Restore vercel.json configuration
   - Deploy Next.js app

3. **Verify old system**
   - Test Next.js endpoint
   - Check Vercel Cron execution
   - Monitor for 24 hours

4. **Investigate issues**
   - Review Edge Function logs
   - Analyze error patterns
   - Fix and redeploy

## Future Enhancements

### Potential Improvements

1. **Incremental Processing**
   - Only process recipes with changes
   - Track last snapshot date
   - Reduce unnecessary calculations

2. **Parallel Execution**
   - Split users across multiple Edge Function invocations
   - Use queue system for large batches
   - Implement worker pattern

3. **Smart Scheduling**
   - Adjust frequency based on activity
   - Process high-activity users more frequently
   - Skip inactive users

4. **Enhanced Monitoring**
   - Real-time dashboard
   - Detailed performance metrics
   - Anomaly detection

5. **Cost Optimization**
   - Cache frequently accessed data
   - Optimize database queries
   - Reduce function invocation time

## Related Documentation

- [Requirements Document](.kiro/specs/hpp-edge-function-migration/requirements.md)
- [HPP Historical Tracking Design](../.kiro/specs/hpp-historical-tracking/design.md)
- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [pg-cron Documentation](https://github.com/citusdata/pg_cron)

# Manual Deployment Guide - HPP Daily Snapshots Edge Function

## Langkah 1: Buka Supabase Dashboard

1. Buka browser dan pergi ke https://supabase.com/dashboard
2. Login dengan akun Anda
3. Pilih project: **vrrjoswzmlhkmmcfhicw**

## Langkah 2: Navigasi ke Edge Functions

1. Di sidebar kiri, klik **Edge Functions**
2. Klik tombol **Create a new function** atau **Deploy new function**

## Langkah 3: Buat Function Baru

1. **Function name**: `hpp-daily-snapshots`
2. Pilih **Import from file** atau **Create from scratch**

## Langkah 4: Copy File Content

Anda perlu copy content dari 5 file berikut ke dalam editor:

### File 1: index.ts (Main Entry Point)
```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { createSnapshotsForAllUsers } from './snapshot-manager.ts'
import type { EdgeFunctionData, EdgeFunctionResponse } from './types.ts'
import {
    checkExecutionTimeWarning,
    ERROR_CODES,
    formatErrorResponse,
    formatExecutionTime,
    logError,
    logInfo
} from './utils.ts'

/**
 * HPP Daily Snapshots Edge Function
 * 
 * This function creates daily HPP (Harga Pokok Produksi) snapshots for all active recipes.
 * It is triggered by pg-cron daily at 00:00 UTC.
 */

function validateAuthorization(req: Request): boolean {
    const authHeader = req.headers.get('Authorization')
    const expectedToken = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    return authHeader === expectedToken
}

function initializeSupabaseClient(): SupabaseClient {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

function formatSuccessResponse(
    totalUsers: number,
    totalRecipes: number,
    snapshotsCreated: number,
    snapshotsFailed: number,
    executionTimeMs: number,
    errors: any[]
): EdgeFunctionResponse {
    const data: EdgeFunctionData = {
        total_users: totalUsers,
        total_recipes: totalRecipes,
        snapshots_created: snapshotsCreated,
        snapshots_failed: snapshotsFailed,
        execution_time_ms: executionTimeMs,
        timestamp: new Date().toISOString()
    }

    if (errors.length > 0) {
        data.errors = errors
    }

    return {
        success: true,
        data
    }
}

Deno.serve(async (req: Request) => {
    try {
        if (!validateAuthorization(req)) {
            logError('Authorization failed', {
                has_auth_header: !!req.headers.get('Authorization')
            })

            return new Response(
                JSON.stringify(formatErrorResponse(ERROR_CODES.AUTH_FAILED)),
                {
                    status: ERROR_CODES.AUTH_FAILED.status,
                    headers: { 'Content-Type': 'application/json' }
                }
            )
        }

        const supabase = initializeSupabaseClient()
        logInfo('HPP daily snapshots execution started')

        const metrics = await createSnapshotsForAllUsers(supabase, {
            batchSize: 10,
            delayMs: 100
        })

        const executionTime = metrics.end_time! - metrics.start_time

        if (checkExecutionTimeWarning(executionTime)) {
            logError('Execution time exceeded warning threshold', {
                execution_time_ms: executionTime,
                formatted_time: formatExecutionTime(executionTime)
            })
        }

        logInfo('HPP daily snapshots execution completed', {
            total_users: metrics.total_users,
            total_recipes: metrics.total_recipes,
            snapshots_created: metrics.snapshots_created,
            snapshots_failed: metrics.snapshots_failed,
            execution_time_ms: executionTime,
            formatted_time: formatExecutionTime(executionTime),
            error_count: metrics.errors.length
        })

        const response = formatSuccessResponse(
            metrics.total_users,
            metrics.total_recipes,
            metrics.snapshots_created,
            metrics.snapshots_failed,
            executionTime,
            metrics.errors
        )

        return new Response(
            JSON.stringify(response),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        )

    } catch (error) {
        logError('HPP daily snapshots execution failed', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        })

        return new Response(
            JSON.stringify(
                formatErrorResponse(ERROR_CODES.EXECUTION_FAILED, {
                    error: error instanceof Error ? error.message : String(error)
                })
            ),
            {
                status: ERROR_CODES.EXECUTION_FAILED.status,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
})
```

### Cara Deploy di Dashboard:

**Opsi A: Upload sebagai ZIP**
1. Buat folder `hpp-daily-snapshots`
2. Copy semua 5 file TypeScript ke dalam folder tersebut:
   - `index.ts`
   - `types.ts`
   - `utils.ts`
   - `hpp-calculator.ts`
   - `snapshot-manager.ts`
3. Zip folder tersebut
4. Di Supabase Dashboard, pilih **Upload ZIP**
5. Upload file ZIP yang sudah dibuat

**Opsi B: Copy-Paste Manual**
1. Buat function baru dengan nama `hpp-daily-snapshots`
2. Copy content dari `index.ts` ke editor utama
3. Untuk file lainnya, Anda mungkin perlu menggabungkannya atau menggunakan fitur multi-file jika tersedia

## Langkah 5: Verifikasi Deployment

Setelah deploy, cek:
1. Function muncul di list Edge Functions
2. Status menunjukkan "Active" atau "Deployed"
3. Tidak ada error di logs

## Langkah 6: Test Function (Opsional)

Anda bisa test function dengan curl:

```bash
curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

## File Locations

Semua file ada di folder lokal:
- `supabase/functions/hpp-daily-snapshots/index.ts`
- `supabase/functions/hpp-daily-snapshots/types.ts`
- `supabase/functions/hpp-daily-snapshots/utils.ts`
- `supabase/functions/hpp-daily-snapshots/hpp-calculator.ts`
- `supabase/functions/hpp-daily-snapshots/snapshot-manager.ts`

## Next Steps

Setelah Edge Function berhasil di-deploy:
1. Lanjut ke sub-task 7.2: Configure Edge Function secrets
2. Lanjut ke sub-task 7.3: Apply database migration

---

**Catatan**: Jika Anda mengalami kesulitan dengan manual deployment, alternatif lainnya adalah meminta akses owner/admin ke project Supabase atau menggunakan Supabase CLI dengan access token yang tepat.

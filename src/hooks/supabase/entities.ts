'use client'

import { useSupabaseQuery } from '@/hooks/supabase/core'

import type { UseSupabaseQueryOptions, UseSupabaseQueryResult } from '@/hooks/supabase/types'

/**
 * Entity-specific hooks for common database operations
 * 
 * ⚠️ DEPRECATION NOTICE:
 * These legacy Supabase hooks are being phased out in favor of standardized
 * React Query hooks with fetchApi pattern. Use hooks from @/hooks/* instead.
 * 
 * Remaining hooks here are for specialized use cases only (realtime, etc.)
 */

// Financial Records (replaces Expenses)
export function useFinancialRecords(
  filter?: Record<string, unknown>,
  options?: { realtime?: boolean }
): UseSupabaseQueryResult<'financial_records'> {
  return useSupabaseQuery('financial_records', {
    filter,
    orderBy: { column: 'date', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Operational Costs
export function useOperationalCosts(options?: { realtime?: boolean }): UseSupabaseQueryResult<'operational_costs'> {
  return useSupabaseQuery('operational_costs', {
    orderBy: { column: 'created_at', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}

// Productions
export function useProductions(options?: { realtime?: boolean }): UseSupabaseQueryResult<'productions'> {
  return useSupabaseQuery('productions', {
    orderBy: { column: 'created_at', ascending: false },
    ...(options?.realtime !== undefined && { realtime: options.realtime }),
  })
}




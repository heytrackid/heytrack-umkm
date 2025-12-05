'use client'

import { createClientLogger } from '@/lib/client-logger'
import { fetchApi, patchApi, postApi } from '@/lib/query/query-helpers'
import { useEffect, useRef } from 'react'

const logger = createClientLogger('BackgroundSync')

interface SyncStatusResponse {
  unsynced: {
    orders: number
    purchases: number
  }
  total: number
  needsSync: boolean
}

interface AutoSyncResponse {
  success: boolean
  synced: {
    orders: number
    expenses: number
    purchases: number
  }
  total: number
  message: string
}

interface HppBatchResponse {
  success: boolean
  calculated: number
  failed: number
}

/**
 * BackgroundSyncProvider
 * 
 * Automatically syncs unsynced data when the app loads.
 * Runs silently in the background without affecting UX.
 * 
 * Features:
 * - Financial sync: Orders without income records, purchases without expenses
 * - HPP sync: Batch calculate HPP for recipes without calculations
 * - Only runs once per session (uses ref to track)
 * - Silent operation (no toasts/notifications)
 * - Logs results for debugging
 */
export function BackgroundSyncProvider({ children }: { children: React.ReactNode }) {
  const hasSyncedRef = useRef(false)

  useEffect(() => {
    // Only run once per session
    if (hasSyncedRef.current) return
    hasSyncedRef.current = true

    const runBackgroundSync = async () => {
      // 1. Financial Sync - Orders & Purchases
      try {
        const status = await fetchApi<SyncStatusResponse>('/api/financial/auto-sync')
        
        if (status.needsSync) {
          logger.info({ unsynced: status.unsynced }, 'Found unsynced financial data, syncing...')
          const result = await postApi<AutoSyncResponse>('/api/financial/auto-sync')
          
          if (result.total > 0) {
            logger.info({ synced: result.synced, total: result.total }, 'Financial sync completed')
          }
        } else {
          logger.debug('Financial data already synced')
        }
      } catch (error) {
        logger.error({ error }, 'Financial sync failed (silent)')
      }

      // 2. HPP Sync - Batch calculate for recipes without HPP
      try {
        const hppResult = await patchApi<HppBatchResponse>('/api/hpp/calculate')
        
        if (hppResult.calculated > 0) {
          logger.info({ calculated: hppResult.calculated }, 'HPP batch calculation completed')
        } else {
          logger.debug('All recipes have HPP calculations')
        }
      } catch (error) {
        logger.error({ error }, 'HPP sync failed (silent)')
      }
    }

    // Delay sync slightly to not block initial render
    const timeoutId = setTimeout(runBackgroundSync, 3000)

    return () => clearTimeout(timeoutId)
  }, [])

  return <>{children}</>
}

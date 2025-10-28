/**
 * Legacy Data Synchronization Entrypoint
 *
 * The original modular stores referenced by this file have been removed during
 * the type-safety refactor. To preserve backwards compatibility (and avoid
 * broken imports), we expose lightweight no-op stubs that callers can safely
 * consume. Real implementations can be plugged back in once the new data
 * synchronization layer is restored.
 */

type SyncStatus = 'idle' | 'syncing' | 'error'

interface DataSyncState {
  status: SyncStatus
  lastSyncedAt: string | null
  error: string | null
}

interface DataSyncActions {
  syncAll: () => Promise<void>
  resetError: () => void
}

export interface DataSynchronizationStore extends DataSyncState, DataSyncActions {}

const noop = async () => {
  // intentionally empty: legacy data sync has been disabled
}

/**
 * Hook placeholder – returns a neutral state with safe no-op actions.
 */
export function useDataSynchronization(): DataSynchronizationStore {
  return {
    status: 'idle',
    lastSyncedAt: null,
    error: null,
    async syncAll() {
      await noop()
    },
    resetError() {
      // nothing to reset in the no-op implementation
    }
  }
}

/**
 * Sync manager stub for programmatic usage.
 */
export const syncManager = {
  async syncAll() {
    await noop()
  }
}

export type { DataSyncState, DataSyncActions }

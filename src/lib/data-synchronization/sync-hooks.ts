// Sync Hooks - Real-time synchronization hooks

import { useDataStore } from './store'
import { dbLogger } from '@/lib/logger'

export const useRealTimeSync = () => {
  const store = useDataStore()

  // Subscribe to sync events for real-time updates
  useDataStore.subscribe(
    (state) => state.syncEvents,
    (events) => {
      if (events.length > 0) {
        const latestEvent = events[events.length - 1]
        dbLogger.info(`Sync event: ${latestEvent.type} from ${latestEvent.source}`)
      }
    }
  )

  return {
    isOnline: store.isOnline,
    lastSyncTime: store.lastSyncTime,
    syncEvents: store.syncEvents,
    syncNow: store.syncCrossPlatform
  }
}

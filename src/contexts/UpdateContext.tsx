'use client'

import { updateBroadcast, type UpdateMessage } from '@/lib/update-broadcast'
import { createClient } from '@/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

interface UpdateNotification {
  id: string
  message: string
  queryKeys: string[][]
  timestamp: number
}

interface UpdateContextType {
  updates: UpdateNotification[]
  notifyUpdate: (message: string, queryKeys: string[][]) => void
  refreshData: (id: string, queryKeys: string[][]) => void
  dismissUpdate: (id: string) => void
}

const UpdateContext = createContext<UpdateContextType | null>(null)

export function UpdateProvider({ children }: { children: ReactNode }) {
  const [updates, setUpdates] = useState<UpdateNotification[]>([])
  const queryClient = useQueryClient()

  const dismissUpdate = useCallback((id: string) => {
    setUpdates(prev => prev.filter(u => u.id !== id))
  }, [])

  const refreshData = useCallback((id: string, queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key })
    })
    dismissUpdate(id)
  }, [queryClient, dismissUpdate])

  const notifyUpdate = useCallback((message: string, queryKeys: string[][]) => {
    const id = `${Date.now()}-${Math.random()}`
    setUpdates(prev => [...prev, {
      id,
      message,
      queryKeys,
      timestamp: Date.now()
    }])
  }, [])

  // Listen untuk BroadcastChannel (same browser only)
  useEffect(() => {
    if (!updateBroadcast) return

    const handler = (event: MessageEvent<UpdateMessage>) => {
      if (event.data.type === 'data-updated') {
        notifyUpdate(event.data.message, event.data.queryKeys)
      }
    }

    updateBroadcast.addEventListener('message', handler)
    return () => {
      if (updateBroadcast) {
        updateBroadcast.removeEventListener('message', handler)
      }
    }
  }, [notifyUpdate])

  // Listen untuk Supabase Realtime (cross-device)
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('system-broadcasts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_broadcasts'
        },
        (payload) => {
          const broadcast = payload.new as {
            message: string
            query_keys: string[][]
          }
          notifyUpdate(broadcast.message, broadcast.query_keys)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [notifyUpdate])

  return (
    <UpdateContext.Provider value={{ updates, notifyUpdate, refreshData, dismissUpdate }}>
      {children}
    </UpdateContext.Provider>
  )
}

export function useUpdates() {
  const context = useContext(UpdateContext)
  if (!context) throw new Error('useUpdates must be used within UpdateProvider')
  return context
}

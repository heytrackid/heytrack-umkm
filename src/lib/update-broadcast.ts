// Broadcast channel untuk same-browser communication (fallback)
export const updateBroadcast = typeof window !== 'undefined' 
  ? new BroadcastChannel('app-updates') 
  : null

export interface UpdateMessage {
  type: 'data-updated'
  message: string
  queryKeys: string[][]
  timestamp: number
}

// Client-side broadcast (same browser only)
export function broadcastUpdate(message: string, queryKeys: string[][]) {
  if (updateBroadcast) {
    updateBroadcast.postMessage({
      type: 'data-updated',
      message,
      queryKeys,
      timestamp: Date.now()
    } as UpdateMessage)
  }
}

// Server-side broadcast via Supabase Realtime (cross-device)
export async function broadcastUpdateToAll(message: string, queryKeys: string[][]) {
  try {
    const response = await fetch('/api/admin/broadcast-realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, queryKeys })
    })
    
    if (!response.ok) {
      throw new Error('Failed to broadcast update')
    }
    
    return await response.json()
  } catch (error) {
    // Re-throw to let caller handle the error
    throw error
  }
}

// Local shim to provide fully-static ESM exports for Turbopack
export { default as RealtimeClient } from '@supabase/realtime-js/dist/module/RealtimeClient'

export {
  default as RealtimeChannel,
  REALTIME_LISTEN_TYPES,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
  REALTIME_SUBSCRIBE_STATES,
  REALTIME_CHANNEL_STATES,
} from '@supabase/realtime-js/dist/module/RealtimeChannel'

export {
  default as RealtimePresence,
  REALTIME_PRESENCE_LISTEN_EVENTS,
} from '@supabase/realtime-js/dist/module/RealtimePresence'

export { default as WebSocketFactory } from '@supabase/realtime-js/dist/module/lib/websocket-factory'

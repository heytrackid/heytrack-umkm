import type { Json } from './common'

// Notification table
export type NotificationsTable = {
  Row: {
    action_url: string | null
    category: string
    created_at: string | null
    entity_id: string | null
    entity_type: string | null
    expires_at: string | null
    id: string
    is_dismissed: boolean | null
    is_read: boolean | null
    message: string
    metadata: Json | null
    priority: string | null
    title: string
    type: string
    updated_at: string | null
  }
  Insert: {
    action_url?: string | null
    category: string
    created_at?: string | null
    entity_id?: string | null
    entity_type?: string | null
    expires_at?: string | null
    id?: string
    is_dismissed?: boolean | null
    is_read?: boolean | null
    message: string
    metadata?: Json | null
    priority?: string | null
    title: string
    type: string
    updated_at?: string | null
  }
  Update: {
    action_url?: string | null
    category?: string
    created_at?: string | null
    entity_id?: string | null
    entity_type?: string | null
    expires_at?: string | null
    id?: string
    is_dismissed?: boolean | null
    is_read?: boolean | null
    message?: string
    metadata?: Json | null
    priority?: string | null
    title?: string
    type?: string
    updated_at?: string | null
  }
  Relationships: []
}

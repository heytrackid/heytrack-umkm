/**
 * Supabase Client
 * Wrapper around Supabase client with typed methods
 */

import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js'
import type { Database } from '@/types'

class SupabaseClientWrapper {
  private client: SupabaseClientType<Database>

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.client = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  // Get the raw client
  getClient() {
    return this.client
  }

  // Authentication methods
  get auth() {
    return this.client.auth
  }

  // Database methods
  get from() {
    return this.client.from.bind(this.client)
  }

  // Storage methods
  get storage() {
    return this.client.storage
  }

  // Realtime methods
  channel(name: string) {
    return this.client.channel(name)
  }

  // Functions
  get functions() {
    return this.client.functions
  }
}

// Export singleton
export const supabaseClient = new SupabaseClientWrapper()
export default supabaseClient

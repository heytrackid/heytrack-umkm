/**
 * API Client
 * Centralized API client for making HTTP requests
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types'

export class ApiClient {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey)
  }

  // Get Supabase client
  getClient() {
    return this.supabase
  }

  // Generic GET request
  async get<T>(table: string, options?: any): Promise<T> {
    const { data, error } = await this.supabase
      .from(table)
      .select(options?.select || '*')
      
    if (error) throw error
    return data as T
  }

  // Generic POST request
  async post<T>(table: string, payload: any): Promise<T> {
    const { data, error } = await this.supabase
      .from(table)
      .insert(payload)
      .select()
      .single()
      
    if (error) throw error
    return data as T
  }

  // Generic PUT request
  async put<T>(table: string, id: string, payload: any): Promise<T> {
    const { data, error } = await this.supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data as T
  }

  // Generic DELETE request
  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id)
      
    if (error) throw error
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient

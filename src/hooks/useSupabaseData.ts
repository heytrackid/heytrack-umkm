'use client'

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { Database } from '@/types';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Generic hook for real-time data
export function useRealtimeData<T>(
  tableName: keyof Database['public']['Tables'],
  initialData: T[] = [],
  fetchFunction?: () => Promise<T[]>
) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!fetchFunction) return
    
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Simple hook for customers
export function useCustomers() {
  const [customers, setCustomers] = useState<Database['public']['Tables']['customers']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCustomers(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return { customers, loading, error, refetch: fetchCustomers }
}

// Simple hook for ingredients
export function useIngredients() {
  const [ingredients, setIngredients] = useState<Database['public']['Tables']['ingredients']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchIngredients = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setIngredients(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIngredients()
  }, [fetchIngredients])

  return { ingredients, loading, error, refetch: fetchIngredients }
}

// Simple hook for orders
export function useOrders() {
  const [orders, setOrders] = useState<Database['public']['Tables']['orders']['Row'][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createSupabaseClient()
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setOrders(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}

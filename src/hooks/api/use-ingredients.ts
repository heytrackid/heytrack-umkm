'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Ingredient {
  id: string
  name: string
  category: string | null
  unit: string
  price_per_unit: number
  current_stock: number | null
  min_stock: number | null
  max_stock: number | null
  reorder_point: number | null
  supplier: string | null
  supplier_contact: string | null
  description: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  user_id: string
  available_stock: number | null
  reserved_stock: number | null
  weighted_average_cost: number
  cost_per_batch: number | null
  expiry_date: string | null
  is_active: boolean | null
  last_ordered_at: string | null
  last_purchase_date: string | null
  lead_time: number | null
  lead_time_days: number | null
  tags: string[] | null
  usage_rate: number | null
}

interface CreateIngredientData {
  name: string
  category?: string | null
  unit: string
  price_per_unit: number
  current_stock?: number | null
  min_stock?: number | null
  supplier?: string | null
  description?: string | null
}

async function fetchIngredients(): Promise<Ingredient[]> {
  const response = await fetch('/api/ingredients')
  if (!response.ok) {
    throw new Error('Failed to fetch ingredients')
  }
  const data = await response.json()
  return data.data || []
}

async function createIngredient(data: CreateIngredientData): Promise<Ingredient> {
  const response = await fetch('/api/ingredients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create ingredient')
  }
  return response.json()
}

async function updateIngredient(id: string, data: Partial<CreateIngredientData>): Promise<Ingredient> {
  const response = await fetch(`/api/ingredients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update ingredient')
  }
  return response.json()
}

async function deleteIngredient(id: string): Promise<void> {
  const response = await fetch(`/api/ingredients/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete ingredient')
  }
}

export function useIngredients() {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: fetchIngredients,
  })
}

export function useCreateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Bahan baku berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan bahan baku')
    },
  })
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIngredientData> }) =>
      updateIngredient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Bahan baku berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui bahan baku')
    },
  })
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('Bahan baku berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus bahan baku')
    },
  })
}

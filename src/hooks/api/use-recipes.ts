'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface RecipeIngredient {
  id: string
  ingredient_id: string
  quantity: number
  unit: string | null
  notes: string | null
  ingredient?: {
    id: string
    name: string
    unit: string
    price_per_unit: number
  }
}

interface Recipe {
  id: string
  name: string
  description: string | null
  category: string | null
  serving_size: number | null
  batch_size: number | null
  prep_time: number | null
  cook_time: number | null
  instructions: string | null
  selling_price: number | null
  cost_per_unit: number | null
  total_cost: number | null
  image_url: string | null
  is_active: boolean | null
  tags: string[] | null
  difficulty_level: string | null
  allergens: string[] | null
  storage_instructions: string | null
  shelf_life_days: number | null
  yield_amount: number | null
  yield_unit: string | null
  created_at: string | null
  created_by: string | null
  updated_at: string | null
  updated_by: string | null
  user_id: string
  ingredients?: RecipeIngredient[]
}

interface CreateRecipeData {
  name: string
  description?: string | null
  category?: string | null
  serving_size?: number | null
  preparation_time?: number | null
  cooking_time?: number | null
  instructions?: string | null
  selling_price?: number | null
  ingredients: Array<{
    ingredient_id: string
    quantity: number
    unit?: string
    notes?: string | null
  }>
}

async function fetchRecipes(): Promise<Recipe[]> {
  const response = await fetch('/api/recipes')
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  const data = await response.json()
  return data.data || []
}

async function fetchRecipe(id: string): Promise<Recipe> {
  const response = await fetch(`/api/recipes/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch recipe')
  }
  const data = await response.json()
  return data.data
}

async function createRecipe(data: CreateRecipeData): Promise<Recipe> {
  const response = await fetch('/api/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create recipe')
  }
  return response.json()
}

async function updateRecipe(id: string, data: Partial<CreateRecipeData>): Promise<Recipe> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update recipe')
  }
  return response.json()
}

async function deleteRecipe(id: string): Promise<void> {
  const response = await fetch(`/api/recipes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete recipe')
  }
}

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => fetchRecipe(id),
    enabled: !!id,
  })
}

export function useCreateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Resep berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan resep')
    },
  })
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecipeData> }) =>
      updateRecipe(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      queryClient.invalidateQueries({ queryKey: ['recipes', variables.id] })
      toast.success('Resep berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui resep')
    },
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast.success('Resep berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus resep')
    },
  })
}

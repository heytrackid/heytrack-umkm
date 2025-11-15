'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { ProductionBatch } from '@/types/database'

interface CreateProductionBatchData {
  recipe_id: string
  batch_size: number
  production_date: string
  notes?: string | null
}

async function fetchProductionBatches(): Promise<ProductionBatch[]> {
  const response = await fetch('/api/production-batches')
  if (!response.ok) {
    throw new Error('Failed to fetch production batches')
  }
  const data = await response.json()
  return data.data || []
}

async function fetchProductionBatch(id: string): Promise<ProductionBatch> {
  const response = await fetch(`/api/production-batches/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch production batch')
  }
  const data = await response.json()
  return data.data
}

async function createProductionBatch(data: CreateProductionBatchData): Promise<ProductionBatch> {
  const response = await fetch('/api/production-batches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create production batch')
  }
  return response.json()
}

async function updateProductionBatch(
  id: string,
  data: Partial<CreateProductionBatchData>
): Promise<ProductionBatch> {
  const response = await fetch(`/api/production-batches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to update production batch')
  }
  return response.json()
}

async function deleteProductionBatch(id: string): Promise<void> {
  const response = await fetch(`/api/production-batches/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to delete production batch')
  }
}

export function useProductionBatches() {
  return useQuery({
    queryKey: ['production-batches'],
    queryFn: fetchProductionBatches,
  })
}

export function useProductionBatch(id: string) {
  return useQuery({
    queryKey: ['production-batches', id],
    queryFn: () => fetchProductionBatch(id),
    enabled: !!id,
  })
}

export function useCreateProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProductionBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      toast.success('Batch produksi berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menambahkan batch produksi')
    },
  })
}

export function useUpdateProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductionBatchData> }) =>
      updateProductionBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      toast.success('Batch produksi berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui batch produksi')
    },
  })
}

export function useDeleteProductionBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProductionBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-batches'] })
      toast.success('Batch produksi berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus batch produksi')
    },
  })
}

import { handleError } from '@/lib/error-handling'
import { deleteApi, fetchApi, postApi, putApi } from '@/lib/query/query-helpers'
import type { Insert, Row, Update } from '@/types/database'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'



type WhatsAppTemplate = Row<'whatsapp_templates'>
type WhatsAppTemplateInsert = Insert<'whatsapp_templates'>
type WhatsAppTemplateUpdate = Update<'whatsapp_templates'>

/**
 * Get all WhatsApp templates
 */
export function useWhatsAppTemplates(params?: { category?: string; isActive?: boolean }) {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.append('category', params.category)
  if (params?.isActive !== undefined) searchParams.append('is_active', String(params.isActive))

  return useQuery<WhatsAppTemplate[]>({
    queryKey: ['whatsapp-templates', params],
    queryFn: async () => {
      const response = await fetchApi<{ data: WhatsAppTemplate[] }>(`/api/whatsapp-templates?${searchParams}`)
      // Extract data array if response has pagination structure
      return Array.isArray(response) ? response : response.data
    },
  })
}

/**
 * Get single WhatsApp template by ID
 */
export function useWhatsAppTemplate(id: string | null) {
  return useQuery<WhatsAppTemplate>({
    queryKey: ['whatsapp-template', id],
    queryFn: () => fetchApi<WhatsAppTemplate>(`/api/whatsapp-templates/${id}`),
    enabled: !!id,
  })
}

/**
 * Create new WhatsApp template
 */
export function useCreateWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<WhatsAppTemplateInsert, 'user_id'>) => postApi('/api/whatsapp-templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template WhatsApp berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Create WhatsApp template', true, 'Gagal membuat template WhatsApp'),
  })
}

/**
 * Update WhatsApp template
 */
export function useUpdateWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WhatsAppTemplateUpdate> }) => putApi(`/api/whatsapp-templates/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp-template', id] })
      toast.success('Template WhatsApp berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update WhatsApp template', true, 'Gagal memperbarui template WhatsApp'),
  })
}

/**
 * Delete WhatsApp template
 */
export function useDeleteWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/whatsapp-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template WhatsApp berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete WhatsApp template', true, 'Gagal menghapus template WhatsApp'),
  })
}

/**
 * Get default template for category
 */
export function useDefaultWhatsAppTemplate(category: string | null) {
  return useQuery<WhatsAppTemplate | null>({
    queryKey: ['whatsapp-template-default', category],
    queryFn: () => fetchApi<WhatsAppTemplate | null>(`/api/whatsapp-templates/default?category=${category}`),
    enabled: !!category,
  })
}

/**
 * Generate default templates
 */
export function useGenerateDefaultTemplates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => postApi('/api/whatsapp-templates/generate-defaults'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template default berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Generate default templates', true, 'Gagal membuat template default'),
  })
}

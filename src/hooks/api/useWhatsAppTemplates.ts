import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchApi, postApi, putApi, deleteApi } from '@/lib/query/query-helpers'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handling'
import type { WhatsAppTemplate } from '@/app/orders/whatsapp-templates/components/types'

export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: (): Promise<WhatsAppTemplate[]> => fetchApi('/api/whatsapp-templates'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => postApi('/api/whatsapp-templates', template),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Create WhatsApp template', true, 'Gagal membuat template'),
  })
}

export function useUpdateWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, template }: { id: string; template: Omit<Partial<WhatsAppTemplate>, 'user_id'> }) => putApi(`/api/whatsapp-templates/${id}`, template),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template berhasil diperbarui')
    },
    onError: (error) => handleError(error, 'Update WhatsApp template', true, 'Gagal memperbarui template'),
  })
}

export function useDeleteWhatsAppTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteApi(`/api/whatsapp-templates/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete WhatsApp template', true, 'Gagal menghapus template'),
  })
}

export function useGenerateDefaultTemplates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => postApi('/api/whatsapp-templates/generate-defaults'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('Template default berhasil dibuat')
    },
    onError: (error) => handleError(error, 'Generate default WhatsApp templates', true, 'Gagal membuat template default'),
  })
}
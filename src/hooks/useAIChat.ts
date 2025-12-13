
import { successToast } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { deleteApi, extractDataArray, fetchApi, postApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'



interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages: ChatMessage[]
}

interface BusinessStats {
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  criticalItems: number
}

/**
 * Get business stats for AI context
 */
export function useBusinessStats() {
  return useQuery<BusinessStats>({
    queryKey: ['business-stats'],
    queryFn: () => fetchApi<BusinessStats>('/api/dashboard/stats'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get chat sessions
 */
export function useChatSessions(limit: number = 10) {
  return useQuery<ChatSession[]>({
    queryKey: ['chat-sessions', limit],
    queryFn: async () => {
      const response = await fetchApi<unknown>(`/api/ai/sessions?limit=${limit}`)
      return extractDataArray<ChatSession>(response)
    },
  })
}

/**
 * Get single chat session
 */
export function useChatSession(sessionId: string | null) {
  return useQuery<ChatSession>({
    queryKey: ['chat-session', sessionId],
    queryFn: () => fetchApi<ChatSession>(`/api/ai/sessions/${sessionId}`),
    enabled: !!sessionId,
  })
}

/**
 * Send chat message
 */
export function useSendChatMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      message: string
      sessionId?: string
      context?: Record<string, unknown>
    }) => postApi('/api/ai/chat', data),
    onSuccess: (_, variables) => {
      if (variables.sessionId) {
        queryClient.invalidateQueries({ queryKey: ['chat-session', variables.sessionId] })
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
    onError: (error) => handleError(error, 'Send chat message', true, 'Gagal mengirim pesan'),
  })
}

/**
 * Create new chat session
 */
export function useCreateChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title?: string }) => postApi('/api/ai/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
    onError: (error) => handleError(error, 'Create chat session', true, 'Gagal membuat sesi chat'),
  })
}

/**
 * Delete chat session
 */
export function useDeleteChatSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionId: string) => deleteApi(`/api/ai/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      successToast('Berhasil', 'Sesi chat berhasil dihapus')
    },
    onError: (error) => handleError(error, 'Delete chat session', true, 'Gagal menghapus sesi chat'),
  })
}

/**
 * Get AI suggestions based on context
 */
export function useAISuggestions(context?: string) {
  return useQuery<string[]>({
    queryKey: ['ai-suggestions', context],
    queryFn: () => {
      const params = new URLSearchParams()
      if (context) params.append('context', context)
      return fetchApi<string[]>(`/api/ai/suggestions?${params}`)
    },
    enabled: !!context,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get chat context (business data for AI)
 */
export function useChatContext() {
  return useQuery({
    queryKey: ['chat-context'],
    queryFn: () => fetchApi('/api/ai/chat-context'),
    staleTime: 5 * 60 * 1000,
  })
}

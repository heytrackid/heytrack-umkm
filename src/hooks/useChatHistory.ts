import { createClientLogger } from '@/lib/client-logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { fetchApi, postApi, deleteApi } from '@/lib/query/query-helpers'

const logger = createClientLogger('useChatHistory')

interface ChatMessage {
  id: string
  role: 'assistant' | 'system' | 'user'
  content: string
  timestamp: Date
  actions?: Array<{ type: string; label: string }>
  data?: Record<string, unknown>
}

/**
 * Hook for managing chat history with database persistence
 */
export function useChatHistory(userId: string) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])

  // Fetch chat history from API
  const { data: historyData, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chat-history', userId],
    queryFn: async () => {
      try {
        const data = await fetchApi<ChatMessage[]>(`/api/ai/chat-history?user_id=${userId}`)
        return data.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      } catch (error) {
        logger.warn('Failed to fetch chat history, using empty array')
        return []
      }
    },
    staleTime: 60000,
  })

  // Sync fetched history to local state
  useEffect(() => {
    if (historyData) {
      // Use setTimeout to avoid setState during render cycle
      setTimeout(() => setMessages(historyData), 0)
    }
  }, [historyData])

  // Save message mutation
  const saveMutation = useMutation({
    mutationFn: (message: ChatMessage) => postApi('/api/ai/chat-history', {
      user_id: userId,
      role: message.role,
      content: message.content,
      actions: message.actions,
      data: message.data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', userId] })
      logger.info('Message saved to history')
    },
    onError: (error: Error) => {
      logger.error({ error }, 'Failed to save message')
    },
  })

  // Clear history mutation
  const clearMutation = useMutation({
    mutationFn: () => deleteApi(`/api/ai/chat-history?user_id=${userId}`),
    onSuccess: () => {
      setMessages([])
      queryClient.invalidateQueries({ queryKey: ['chat-history', userId] })
      logger.info('Chat history cleared')
    },
    onError: (error: Error) => {
      logger.error({ error }, 'Failed to clear history')
    },
  })

  return {
    messages,
    setMessages,
    saveMessage: (message: ChatMessage) => saveMutation.mutate(message),
    clearHistory: () => clearMutation.mutate(),
    isLoading,
    isSaving: saveMutation.isPending,
    isClearing: clearMutation.isPending,
  }
}

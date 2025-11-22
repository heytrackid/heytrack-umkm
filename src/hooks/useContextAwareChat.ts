import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClientLogger } from '@/lib/client-logger'
import { fetchApi, postApi } from '@/lib/query/query-helpers'

const logger = createClientLogger('useContextAwareChat')

interface ChatMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
}

interface ChatSuggestion {
  text: string
  action: string
}

interface ChatApiResponse {
  session_id?: string
  id?: string
  message?: string
  role?: string
  timestamp?: string
  [key: string]: unknown // For dynamic metadata
}

/**
 * Hook for context-aware AI chat with session management
 */
export function useContextAwareChat() {
  const queryClient = useQueryClient()
  const [sessionId, setSessionId] = useState<string | null>(null)


  const [error, setError] = useState<string | null>(null)

  // Fetch chat sessions
  const { data: sessions = [] } = useQuery<ChatSession[]>({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      try {
        return await fetchApi<ChatSession[]>('/api/ai/sessions')
      } catch (error) {
        logger.warn('Failed to fetch chat sessions')
        return []
      }
    },
    staleTime: 60000,
  })

  // Fetch messages for current session
  const { data: sessionMessages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[]>({
    queryKey: ['chat-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return []

      try {
        const data = await fetchApi<ChatMessage[]>(`/api/ai/sessions/${sessionId}/messages`)
        return data.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      } catch (error) {
        logger.error({ error }, 'Failed to fetch messages')
        return []
      }
    },
    enabled: !!sessionId,
    staleTime: 30000,
  })

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (data: { message: string; sessionId?: string | null }) => postApi<ChatApiResponse>('/api/ai/chat', {
      message: data.message,
      session_id: data.sessionId,
      currentPage: 'chatbot'
    }),
    onSuccess: (result: ChatApiResponse) => {
      if (result.session_id && result.session_id !== sessionId) {
        setSessionId(result.session_id)
      }

      queryClient.invalidateQueries({ queryKey: ['chat-messages', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })

      logger.info('Message sent successfully')
    },
    onError: (error: Error) => {
      setError(error.message)
      toast.error(error.message)
      logger.error({ error }, 'Failed to send message')
    },
  })

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: () => postApi<ChatApiResponse>('/api/ai/sessions', { title: 'New Chat' }),
    onSuccess: (result: ChatApiResponse) => {
      if (result.id) {
        setSessionId(result.id)
        queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
        logger.info('New session created')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
      logger.error({ error }, 'Failed to create session')
    },
  })

  return {
    messages: sessionMessages,
    isLoading: sendMutation.isPending || isLoadingMessages,
    error,
    sessionId,
    sessions,
    suggestions: [] as ChatSuggestion[], // TODO: Implement suggestions
    sendMessage: (message: string) => sendMutation.mutate({ message, sessionId }),
    loadSession: (id: string) => {
      setSessionId(id)
    },
    createNewSession: () => createSessionMutation.mutate(),
    clearError: () => setError(null),
  }
}

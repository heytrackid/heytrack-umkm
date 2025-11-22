'use client'

import { queryConfig } from '@/lib/query/query-config'
import { handleError } from '@/lib/error-handling'
import { fetchApi, postApi } from '@/lib/query/query-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface ChatMessage {
  id: string
  role: 'assistant' | 'system' | 'user'
  content: string
  timestamp: Date
  actions?: Array<{ type: string; label: string }>
  data?: Record<string, unknown>
}

interface ChatSession {
  id: string
  user_id: string
  title: string
  context_snapshot: unknown
  created_at: string
  updated_at: string
}

/**
 * Fetch current chat session for user
 */
export function useChatSession(userId: string) {
  return useQuery({
    queryKey: ['chat-session', userId],
    queryFn: () => fetchApi<ChatSession>(`/api/chat/sessions?userId=${userId}`),
    enabled: Boolean(userId),
    ...queryConfig.queries.realtime,
  })
}

/**
 * Fetch messages for a chat session
 */
export function useChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: () => {
      if (!sessionId) return Promise.resolve([])
      return fetchApi<ChatMessage[]>(`/api/chat/messages?sessionId=${sessionId}`)
    },
    enabled: Boolean(sessionId),
    ...queryConfig.queries.realtime,
  })
}

/**
 * Create new chat message
 */
export function useCreateChatMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      sessionId: string
      role: 'assistant' | 'system' | 'user'
      content: string
      metadata?: Record<string, unknown>
    }) => postApi('/api/chat/messages', data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.sessionId] })
      void queryClient.invalidateQueries({ queryKey: ['chat-session'] })
    },
    onError: (error) => handleError(error, 'Create chat message', false),
  })
}

/**
 * Clear chat history (delete all messages and create new session)
 */
export function useClearChatHistory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { sessionId: string; userId: string }) => postApi('/api/chat/sessions/clear', data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['chat-session', variables.userId] })
      void queryClient.invalidateQueries({ queryKey: ['chat-messages'] })
    },
    onError: (error) => handleError(error, 'Clear chat history', false),
  })
}

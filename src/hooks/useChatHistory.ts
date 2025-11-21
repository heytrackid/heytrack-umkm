'use client'

import { createClientLogger } from '@/lib/client-logger'
import type { Json } from '@/types/database'
import { createClient } from '@/utils/supabase/client'
import { useCallback, useEffect, useState } from 'react'

const logger = createClientLogger('useChatHistory')

interface ChatSessionRow {
  id: string
  user_id: string
  title: string
  context_snapshot: unknown
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface ChatMessageRow {
  id: string
  session_id: string
  role: string
  content: string
  metadata: unknown
  created_at: string
}

interface ExtendedChatMessage {
  id: string
  role: 'assistant' | 'system' | 'user'
  content: string
  timestamp: Date
  actions?: Array<{ type: string; label: string }>
  data?: Record<string, unknown>
}

export function useChatHistory(userId: string) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load or create session
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true)

      // Get most recent active session
      const sessionsResponse = await fetch('/api/ai/sessions?limit=1', {
        credentials: 'include',
      })

      if (!sessionsResponse.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const sessionsResult = await sessionsResponse.json()
      if (!sessionsResult.data || sessionsResult.data.length === 0) {
        // Create new session
        const createResponse = await fetch('/api/ai/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: 'New Conversation',
            context_snapshot: {}
          })
        })

        if (!createResponse.ok) {
          throw new Error('Failed to create session')
        }

        const createResult = await createResponse.json()
        const sessionId = createResult.data.id
        setCurrentSessionId(sessionId)
        setMessages([])
      } else {
        // Use existing session
        const session = sessionsResult.data[0]
        const sessionId = session.id
        setCurrentSessionId(sessionId)

        // Load messages from this session
        const messagesResponse = await fetch(`/api/ai/sessions/${sessionId}`, {
          credentials: 'include',
        })

        if (messagesResponse.ok) {
          const messagesResult = await messagesResponse.json()
          if (messagesResult.data?.messages) {
            const formattedMessages: ExtendedChatMessage[] = messagesResult.data.messages.map((msg: ChatMessageRow) => ({
              id: msg.id,
              role: msg.role as 'assistant' | 'system' | 'user',
              content: msg.content,
              timestamp: new Date(msg.created_at),
              actions: (msg.metadata as { actions?: Array<{ type: string; label: string }> })?.actions,
              data: (msg.metadata as { data?: Record<string, unknown> })?.data
            }))
            setMessages(formattedMessages)
          }
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error initializing chat session')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save message to database
  const saveMessage = useCallback(async (message: ExtendedChatMessage) => {
    if (!currentSessionId) return

    try {
      const response = await fetch(`/api/ai/sessions/${currentSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          metadata: {
            actions: message.actions,
            data: message.data
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save message')
      }
    } catch (error) {
      logger.error({ error }, 'Error saving message')
    }
  }, [currentSessionId])

  // Clear chat history
  const clearHistory = useCallback(async () => {
    if (!currentSessionId) return

    try {
      // Create new session
      const createResponse = await fetch('/api/ai/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: 'New Conversation',
          context_snapshot: {}
        })
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create new session')
      }

      const createResult = await createResponse.json()
      const newSessionId = createResult.data.id
      setCurrentSessionId(newSessionId)
      setMessages([])
    } catch (error) {
      logger.error({ error }, 'Error clearing chat history')
    }
  }, [currentSessionId])

  // Initialize on mount
  useEffect(() => {
    void initializeSession()
  }, [initializeSession])

  return {
    messages,
    setMessages,
    saveMessage,
    clearHistory,
    isLoading,
    sessionId: currentSessionId
  }
}

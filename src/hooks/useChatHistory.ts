'use client'

import { createClientLogger } from '@/lib/client-logger'
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
      const supabase = await createClient()

      // Get most recent active session
      const { data: sessions, error: sessionError} = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (sessionError) throw sessionError

      let sessionId: string

      if (sessions && sessions.length > 0) {
        // Use existing session
        const session = sessions[0] as unknown as ChatSessionRow
        sessionId = session.id
        setCurrentSessionId(sessionId)

        // Load messages from this session
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        if (messagesData && messagesData.length > 0) {
          const formattedMessages: ExtendedChatMessage[] = (messagesData as ChatMessageRow[]).map(msg => {
            const metadata = msg.metadata as Record<string, unknown> | null
            return {
              id: msg.id,
              role: msg.role as 'assistant' | 'system' | 'user',
              content: msg.content,
              timestamp: new Date(msg.created_at),
              actions: metadata?.['actions'] as Array<{ type: string; label: string }> | undefined,
              data: metadata?.['data'] as Record<string, unknown> | undefined
            }
          })
          setMessages(formattedMessages)
        }
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('chat_sessions')
          // @ts-expect-error - Supabase client type inference issue
          .insert({
            user_id: userId,
            title: 'New Conversation',
            context_snapshot: {}
          })
          .select()
          .single()

        if (createError) throw createError
        if (newSession) {
          const session = newSession as ChatSessionRow
          sessionId = session.id
          setCurrentSessionId(sessionId)
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error initializing chat session')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Save message to database
  const saveMessage = useCallback(async (message: ExtendedChatMessage) => {
    if (!currentSessionId) return

    try {
      const supabase = await createClient()
      
      const { error } = await supabase
        .from('chat_messages')
        // @ts-expect-error - Supabase client type inference issue
        .insert({
          session_id: currentSessionId,
          role: message.role,
          content: message.content,
          metadata: {
            actions: message.actions,
            data: message.data
          }
        })

      if (error) throw error

      // Update session's updated_at
      await supabase
        .from('chat_sessions')
        // @ts-expect-error - Supabase client type inference issue
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSessionId)

    } catch (error) {
      logger.error({ error }, 'Error saving message')
    }
  }, [currentSessionId])

  // Clear chat history
  const clearHistory = useCallback(async () => {
    if (!currentSessionId) return

    try {
      const supabase = await createClient()
      // Delete all messages in current session
      await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', currentSessionId)

      // Create new session
      const { data: newSession, error: newSessionError } = await supabase
        .from('chat_sessions')
        // @ts-expect-error - Supabase client type inference issue
        .insert({
          user_id: userId,
          title: 'New Conversation',
          context_snapshot: {}
        })
        .select()
        .single()

      if (newSessionError) {
        logger.error({ error: newSessionError }, 'Error creating new session')
        return
      }

      if (newSession) {
        const session = newSession as ChatSessionRow
        setCurrentSessionId(session.id)
        setMessages([])
      }
    } catch (error) {
      logger.error({ error }, 'Error clearing chat history')
    }
  }, [currentSessionId, userId])

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

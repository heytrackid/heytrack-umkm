/**
 * React Hook for Context-Aware AI Chat
 */

import { useState, useCallback, useEffect } from 'react'
import { apiLogger } from '@/lib/logger'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  suggestions?: string[]
}

interface ChatSession {
  id: string
  title: string
  lastMessageAt: string
}

interface UseContextAwareChatReturn {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sessionId: string | null
  sessions: ChatSession[]
  sendMessage: (query: string) => Promise<void>
  loadSession: (sessionId: string) => Promise<void>
  createNewSession: () => Promise<void>
  clearError: () => void
}

export function useContextAwareChat(): UseContextAwareChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])

  // Load available sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/chat-enhanced')
      
      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await response.json()
      setSessions(data.data || [])
    } catch (err) {
      apiLogger.error({ error: err }, 'Failed to load sessions')
    }
  }, [])

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setError(null)

    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/ai/chat-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sessionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send message')
      }

      const data = await response.json()

      // Update session ID if new
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
      }

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date().toISOString(),
        suggestions: data.data.suggestions,
      }

      setMessages(prev => [...prev, aiMessage])

      // Reload sessions to update list
      await loadSessions()

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
      apiLogger.error({ error: err }, 'Failed to send message')

      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, loadSessions])

  const loadSession = useCallback(async (newSessionId: string) => {
    setSessionId(newSessionId)
    setMessages([])
    setError(null)
    
    // Messages will be loaded automatically by the AI service
    // when the first query is sent
  }, [])

  const createNewSession = useCallback(async () => {
    setSessionId(null)
    setMessages([])
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    sendMessage,
    loadSession,
    createNewSession,
    clearError,
  }
}

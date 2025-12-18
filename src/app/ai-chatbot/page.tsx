'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { LoadingState } from '@/components/ui/loading-state'
import { useAuth } from '@/hooks/useAuth'

import { useAIService, useChatMessages } from '@/app/ai-chatbot/hooks/index'

import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { EmptyState } from './components/EmptyState'
import { MessageList } from './components/MessageList'

const AIChatbotPage = (): JSX.Element => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { messages, isLoading, scrollAreaRef, addMessage, setLoading, currentSessionId, setSessionId, submitFeedback } = useChatMessages()
  const { processAIQuery } = useAIService(currentSessionId)
  const [input, setInput] = useState('')
  
  const pendingSessionRef = useRef<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/ai-chatbot')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = (messageText ?? input).trim()
    if (textToSend.length === 0 || isLoading) { return }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: textToSend,
      timestamp: new Date()
    }

    addMessage(userMessage)
    setInput('')
    setLoading(true)

    try {
      const response = await processAIQuery(textToSend)

      const responseData = response['data'] as Record<string, unknown> | undefined
      const newSessionId = responseData?.['sessionId']
      if (newSessionId && typeof newSessionId === 'string') {
        if (!pendingSessionRef.current || pendingSessionRef.current === newSessionId) {
          pendingSessionRef.current = newSessionId
          setSessionId(newSessionId)
          setTimeout(() => {
            if (pendingSessionRef.current === newSessionId) {
              pendingSessionRef.current = null
            }
          }, 100)
        }
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        data: (response['data'] ?? {}) as Record<string, unknown>
      }

      addMessage(assistantMessage)
    } catch {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.',
        timestamp: new Date()
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [input, isLoading, addMessage, setInput, setLoading, processAIQuery, setSessionId])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    void handleSendMessage(suggestion)
  }, [handleSendMessage])

  if (authLoading) {
    return (
      <AppLayout pageTitle="AI Chatbot">
        <LoadingState size="md" />
      </AppLayout>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <AppLayout pageTitle="AI Chatbot">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-muted-foreground">Redirecting to login...</div>
        </div>
      </AppLayout>
    )
  }

  const hasMessages = messages.length > 0

  return (
    <AppLayout pageTitle="AI Chatbot">
      <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
        {/* Header */}
        <ChatHeader />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {hasMessages ? (
            <MessageList
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSuggestionClick={handleSuggestionClick}
              onFeedbackSubmit={submitFeedback}
            />
          ) : (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          )}
        </div>

        {/* Input area */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  )
}

export default AIChatbotPage
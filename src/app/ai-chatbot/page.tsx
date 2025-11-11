'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { useAuth } from '@/providers/AuthProvider'

import { useAIService, useChatMessages } from '@/app/ai-chatbot/hooks/index'

// Lazy load heavy chatbot components
const ChatHeader = dynamic(() => import('./components').then(mod => ({ default: mod.ChatHeader })), {
  loading: () => <div className="h-16 bg-muted animate-pulse rounded-t-xl" />
})

const ChatInput = dynamic(() => import('./components').then(mod => ({ default: mod.ChatInput })), {
  loading: () => <div className="h-20 bg-muted animate-pulse" />
})

const MessageList = dynamic(() => import('./components').then(mod => ({ default: mod.MessageList })), {
  loading: () => <div className="flex-1 bg-muted animate-pulse" />
})



const AIChatbotPage = (): JSX.Element => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { messages, isLoading, scrollAreaRef, addMessage, setLoading, currentSessionId } = useChatMessages()
  const { processAIQuery } = useAIService(currentSessionId)
  const [input, setInput] = useState('')

  // Redirect if not authenticated
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
  }, [input, isLoading, addMessage, setInput, setLoading, processAIQuery])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    void handleSendMessage(suggestion)
  }, [handleSendMessage])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <AppLayout pageTitle="AI Chatbot">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    )
  }

  // Don't render if not authenticated (should redirect)
  if (!isAuthenticated || !user) {
    return (
      <AppLayout pageTitle="AI Chatbot">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-muted-foreground">Redirecting to login...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle="AI Chatbot">
      {/* Full viewport chat container with mobile optimizations */}
      <div className="flex flex-col h-[calc(100vh-4rem)] safe-top max-w-5xl mx-auto w-full">
        {/* Minimal header */}
        <div className="flex-shrink-0">
          <Suspense fallback={<div className="h-12 bg-muted animate-pulse" />}>
            <ChatHeader />
          </Suspense>
        </div>

        {/* Messages area - takes remaining height */}
        <div className="flex-1 overflow-hidden relative min-h-0">
          <Suspense fallback={<div className="flex-1 bg-muted animate-pulse" />}>
            <MessageList
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSuggestionClick={handleSuggestionClick}
            />
          </Suspense>
        </div>

        {/* Input area - fixed at bottom with safe area */}
        <div className="flex-shrink-0">
          <Suspense fallback={<div className="h-20 bg-muted animate-pulse" />}>
            <ChatInput
              input={input}
              setInput={setInput}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  )
}

export default AIChatbotPage
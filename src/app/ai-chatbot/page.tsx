'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { PageHeader } from '@/components/shared'
import { ChatHeader, ChatInput, MessageList } from './components'
import { useChatMessages, useAIService } from './hooks'

const chatbotBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'AI Assistant' },
  { label: 'Chatbot' }
]

const AIChatbotPage = () => {
  const { messages, isLoading, scrollAreaRef, addMessage, setLoading } = useChatMessages()
  const { processAIQuery } = useAIService()
  const [input, setInput] = useState('')

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || input).trim()
    if (textToSend.length === 0 || isLoading) { return }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: textToSend,
      timestamp: new Date()
    }

    addMessage(userMessage)
    void setInput('')
    void setLoading(true)

    try {
      const response = await processAIQuery(textToSend)

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        data: (response.data || {}) as Record<string, unknown>
      }

      addMessage(assistantMessage)
    } catch (_err) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.',
        timestamp: new Date()
      }
      addMessage(errorMessage)
    } finally {
      void setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    void handleSendMessage(suggestion)
  }

  return (
    <AppLayout pageTitle="AI Chatbot">
      <div className="flex h-full flex-col gap-6">
        <PageHeader
          title="AI Chatbot"
          description="Interaksi cepat dengan asisten AI HeyTrack untuk tugas operasional harian"
          breadcrumbs={chatbotBreadcrumbs}
        />

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ChatHeader />

          <MessageList
            messages={messages}
            isLoading={isLoading}
            scrollAreaRef={scrollAreaRef}
            onSuggestionClick={handleSuggestionClick}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppLayout>
  )
}

export default AIChatbotPage

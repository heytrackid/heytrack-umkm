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
    const textToSend = (messageText ?? input).trim()
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
        data: (response.data ?? {}) as Record<string, unknown>
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
      {/* Container utama - full height minus navbar */}
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header - fixed */}
        <div className="flex-shrink-0 p-6 pb-0">
          <PageHeader
            title="AI Chatbot"
            description="Asisten AI yang paham bisnis Anda - terhubung langsung dengan data real-time"
            breadcrumbs={chatbotBreadcrumbs}
          />
        </div>

        {/* Chat Container - flex-1 untuk take remaining space */}
        <div className="flex-1 p-6 min-h-0">
          <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm h-full">
            {/* Chat Header - fixed */}
            <div className="flex-shrink-0">
              <ChatHeader />
            </div>

            {/* Messages area - SCROLLABLE dengan fixed height */}
            <div className="flex-1 overflow-hidden relative">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                scrollAreaRef={scrollAreaRef}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>

            {/* Input area - fixed at bottom */}
            <div className="flex-shrink-0 border-t">
              <ChatInput
                input={input}
                setInput={setInput}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default AIChatbotPage

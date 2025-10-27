'use client'

import { useState } from 'react'
import { ChatHeader, ChatInput, MessageList } from './components'
import { useChatMessages, useAIService } from './hooks'

export default function AIChatbotPage() {
  const { messages, isLoading, scrollAreaRef, addMessage, setLoading } = useChatMessages()
  const { processAIQuery } = useAIService()
  const [input, setInput] = useState('')

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend || isLoading) {return}

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
    } catch (err) {
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
    <div className="flex flex-col h-full max-h-screen">
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
  )
}

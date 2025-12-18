'use client'

import React, { useEffect, useRef, type RefObject } from 'react'

import type { Message } from '@/app/ai-chatbot/types/index'
import { ScrollArea } from '@/components/ui/scroll-area'

import { MessageBubble } from '@/app/ai-chatbot/components/MessageBubble'
import { TypingIndicator } from '@/app/ai-chatbot/components/TypingIndicator'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  scrollAreaRef: RefObject<HTMLDivElement | null>
  onSuggestionClick: (suggestion: string) => void
  onFeedbackSubmit: ((messageId: string, rating: number, comment?: string | undefined) => void) | undefined
}

export const MessageList = ({
  messages,
  isLoading,
  scrollAreaRef,
  onSuggestionClick,
  onFeedbackSubmit
}: MessageListProps): React.JSX.Element => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full">
        <div className="px-4 py-4 space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={onSuggestionClick}
              onFeedbackSubmit={onFeedbackSubmit}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  )
}

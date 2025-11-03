'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '@/app/ai-chatbot/types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  scrollAreaRef: RefObject<HTMLDivElement>
  onSuggestionClick: (suggestion: string) => void
}

export const MessageList = ({
  messages,
  isLoading,
  scrollAreaRef,
  onSuggestionClick
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the viewport element inside ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) {
        // Smooth scroll to bottom with delay untuk ensure render selesai
        setTimeout(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          })
        }, 150)
      }
    }
  }, [messages, isLoading, scrollAreaRef])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div ref={scrollAreaRef} className="p-6 space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={onSuggestionClick}
            />
          ))}

          {isLoading && <TypingIndicator />}
          
          {/* Empty state - only show if no messages and not loading */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-sm">
                Loading your business overview...
              </p>
            </div>
          )}
          
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>
    </div>
  )
}

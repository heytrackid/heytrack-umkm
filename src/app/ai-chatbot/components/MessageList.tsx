'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useEffect, useRef, type RefObject } from 'react'

import type { Message } from '@/app/ai-chatbot/types'
import { ScrollArea } from '@/components/ui/scroll-area'

import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'


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
}: MessageListProps): React.JSX.Element => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const virtualizerRef = useRef<HTMLDivElement>(null)

  // Use virtual scrolling for long conversations (>20 messages)
  const useVirtualScrolling = messages.length > 20

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => virtualizerRef.current,
    estimateSize: () => 120, // Estimated height per message
    overscan: 3,
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (useVirtualScrolling) {
      // For virtual scrolling, scroll to the last item
      virtualizer.scrollToIndex(messages.length - 1, { align: 'end' })
    } else if (scrollAreaRef.current) {
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
  }, [messages, isLoading, scrollAreaRef, useVirtualScrolling, virtualizer])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <ScrollArea className="h-full w-full">
        {useVirtualScrolling ? (
          // Virtual scrolling for long conversations
          <div
            ref={virtualizerRef}
            className="h-full overflow-auto p-6 max-w-4xl mx-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const message = messages[virtualItem.index]
                if (!message) {return null}
                return (
                  <div
                    key={message?.['id'] ?? 'temp-key'}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="mb-6">
                      <MessageBubble
                        message={message}
                        onSuggestionClick={onSuggestionClick}
                      />
                    </div>
                  </div>
                )
              })}
              {isLoading ? (
                <div
                  style={{
                    position: 'absolute',
                    top: virtualizer.getTotalSize(),
                    left: 0,
                    width: '100%',
                  }}
                >
                  <TypingIndicator />
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          // Regular rendering for short conversations
          <div ref={scrollAreaRef} className="p-6 space-y-6 max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSuggestionClick={onSuggestionClick}
              />
            ))}

            {isLoading ? <TypingIndicator /> : null}
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  )
}

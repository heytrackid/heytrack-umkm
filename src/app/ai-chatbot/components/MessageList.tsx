'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import React, { useCallback, useEffect, useRef, type RefObject } from 'react'

import type { Message } from '@/app/ai-chatbot/types/index'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
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
  const virtualizerRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dynamic size estimation based on message content
  const estimateMessageSize = useCallback((index: number): number => {
    const message = messages[index]
    if (!message) return 120
    
    // Base height for message bubble
    let height = 80
    
    // Add height based on content length (roughly 20px per 100 chars)
    const contentLength = message.content?.length || 0
    height += Math.ceil(contentLength / 60) * 24 // ~60 chars per line, 24px per line
    
    // Add height for suggestions if present
    if (message.suggestions && message.suggestions.length > 0) {
      height += 48 + (Math.ceil(message.suggestions.length / 2) * 40)
    }
    
    // Add height for data/metadata if present
    if (message.data && Object.keys(message.data).length > 0) {
      height += 60
    }
    
    // Minimum and maximum bounds
    return Math.max(100, Math.min(height, 600))
  }, [messages])

  // Always call useVirtualizer (hooks must be called unconditionally)
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => virtualizerRef.current,
    estimateSize: estimateMessageSize,
    overscan: 5, // Increased overscan for smoother scrolling
  })

  // Use virtual scrolling for long conversations (>20 messages)
  const useVirtualScrolling = messages.length > 20

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
        scrollTimeoutRef.current = setTimeout(() => {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: 'smooth'
          })
        }, 150)
      }
    }
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [messages, isLoading, scrollAreaRef, useVirtualScrolling, virtualizer])

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Terjadi kesalahan saat memuat pesan</div>
            <div className="text-sm text-muted-foreground">
              Silakan refresh halaman atau coba lagi nanti
            </div>
          </div>
        </div>
      }
    >
      <div className="absolute inset-0 overflow-hidden">
        <ScrollArea className="h-full w-full mobile-scroll" aria-label="Daftar percakapan">
          {messages.length === 0 && !isLoading ? (
            <div className="px-4 py-10 max-w-3xl mx-auto">
              <div className="text-center space-y-3">
                <div className="text-sm font-semibold">Mulai konsultasi dengan AI</div>
                <div className="text-sm text-muted-foreground">
                  Tanyakan tentang penjualan, stok, HPP, strategi menu, atau operasional harian.
                </div>
                <div className="text-xs text-muted-foreground">
                  Tips: gunakan template di bawah untuk mulai lebih cepat.
                </div>
              </div>
            </div>
          ) : null}
          {useVirtualScrolling ? (
            // Virtual scrolling for long conversations
            <div
              ref={virtualizerRef}
              className="h-full overflow-auto px-4 py-6"
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
                           onFeedbackSubmit={onFeedbackSubmit}
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
            <div ref={scrollAreaRef} className="px-4 py-6 space-y-6">
               {messages.map((message) => (
                 <MessageBubble
                   key={message.id}
                   message={message}
                   onSuggestionClick={onSuggestionClick}
                   onFeedbackSubmit={onFeedbackSubmit}
                 />
               ))}

              {isLoading ? <TypingIndicator /> : null}
            </div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>
    </ErrorBoundary>
  )
}

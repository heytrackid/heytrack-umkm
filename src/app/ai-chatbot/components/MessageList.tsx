import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import type { Message } from '../types'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  scrollAreaRef: React.RefObject<HTMLDivElement>
  onSuggestionClick: (suggestion: string) => void
}

export function MessageList({
  messages,
  isLoading,
  scrollAreaRef,
  onSuggestionClick
}: MessageListProps) {
  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onSuggestionClick={onSuggestionClick}
          />
        ))}

        {isLoading && <TypingIndicator />}
      </div>
    </ScrollArea>
  )
}

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import type { Message } from '@/app/ai-chatbot/types'

interface MessageBubbleProps {
  message: Message
  onSuggestionClick?: (suggestion: string) => void
}

export const MessageBubble = ({ message, onSuggestionClick }: MessageBubbleProps) => {
  const renderMessageData = (data: unknown) => {
    if (!data) { return null }
    return (
      <div className="mt-3 p-3 bg-background/50 rounded border">
        <pre className="text-xs overflow-x-auto">
          {typeof data === 'string'
            ? data
            : JSON.stringify(data, null, 2) || 'No data'
          }
        </pre>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex gap-3",
      message.role === 'user' ? "justify-end" : "justify-start"
    )}>
      {message.role === 'assistant' && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        message.role === 'user'
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      )}>
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Display data if available */}
        {renderMessageData(message.data)}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Coba tanyakan:</p>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion) => (
                <Button
                  key={`${message.id}-${suggestion}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {message.role === 'user' && (
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

import { Bot, User } from 'lucide-react'
import React from 'react'

import type { Message } from '@/app/ai-chatbot/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { DataCard } from './DataCard'



interface MessageBubbleProps {
  message: Message
  onSuggestionClick?: (suggestion: string) => void
}

const validateData = (data: unknown): Record<string, unknown> | null => {
  if (!data || typeof data !== 'object') {
    return null
  }

  const dataObj = data as Record<string, unknown>
  const {businessContext} = dataObj

  if (!businessContext || typeof businessContext !== 'object') {
    return null
  }

  return businessContext as Record<string, unknown>
}

const hasValidData = (contextObj: Record<string, unknown>): boolean => {
  const hasOrdersData = contextObj['orders'] && typeof contextObj['orders'] === 'object'
  const hasInventoryData = contextObj['inventory'] && typeof contextObj['inventory'] === 'object'
  return hasOrdersData || hasInventoryData
}

const buildDataCards = (contextObj: Record<string, unknown>): React.ReactElement[] => {
  const cards: React.ReactElement[] = []

  if (contextObj['orders'] && typeof contextObj['orders'] === 'object') {
    cards.push(
      <DataCard
        key="orders-card"
        title="📊 Status Pesanan"
        data={contextObj['orders'] as Record<string, unknown>}
        type="orders"
      />
    )
  }

  if (contextObj['inventory'] && typeof contextObj['inventory'] === 'object') {
    cards.push(
      <DataCard
        key="inventory-card"
        title="⚠️ Stok Kritis"
        data={contextObj['inventory'] as Record<string, unknown>}
        type="inventory"
      />
    )
  }

  return cards
}

export const MessageBubble = ({ message, onSuggestionClick }: MessageBubbleProps): JSX.Element => {
  const renderMessageData = (data: unknown): React.ReactElement | null => {
    const contextObj = validateData(data)
    if (!contextObj || !hasValidData(contextObj)) {
      return null
    }

    const cards = buildDataCards(contextObj)
    if (cards.length === 0) {
      return null
    }

    return (
      <div className="mt-3 space-y-2">
        {cards}
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
        {renderMessageData(message['data'])}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Coba tanyakan:</p>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion) => (
                <Button
                  key={`${message['id']}-${suggestion}`}
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

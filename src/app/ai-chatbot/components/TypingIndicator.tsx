import { Bot, Sparkles } from 'lucide-react'
import React, { useState, useEffect } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const thinkingMessages = [
  'Sedang berpikir... 🤔',
  'Menganalisis data... 📊',
  'Mencari jawaban terbaik... 🔍',
  'Memproses informasi... ⚡',
  'Hampir selesai... ✨'
]

export const TypingIndicator = (): React.JSX.Element => {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % thinkingMessages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary/10 animate-pulse">
          <Bot className="h-4 w-4 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg p-3 " role="status" aria-live="polite" aria-label="Asisten sedang mengetik">
        <div className="flex items-center gap-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground transition-opacity duration-300">
            {thinkingMessages[messageIndex]}
          </span>
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        </div>
      </div>
    </div>
  )
}

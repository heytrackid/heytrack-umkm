'use client'

import { Bot } from '@/components/icons'
import React from 'react'

export const TypingIndicator = (): React.JSX.Element => {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

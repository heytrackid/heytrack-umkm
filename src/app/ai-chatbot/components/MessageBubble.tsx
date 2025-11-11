'use client'

import { Bot, User, Copy, Check } from 'lucide-react'
import { useState, Fragment } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

import type { Message } from '@/app/ai-chatbot/types/index'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { createLogger } from '@/lib/logger'

import { DataCard } from '@/app/ai-chatbot/components/DataCard'
import { FeedbackWidget } from '@/app/ai-chatbot/components/FeedbackWidget'



interface MessageBubbleProps {
  message: Message
  onSuggestionClick?: (suggestion: string) => void
  onFeedbackSubmit?: (messageId: string, rating: number, comment?: string) => void
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
  const hasOrdersData = Boolean(contextObj['orders'] && typeof contextObj['orders'] === 'object')
  const hasInventoryData = Boolean(contextObj['inventory'] && typeof contextObj['inventory'] === 'object')
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

// Function to format message content with enhanced code highlighting
const formatMessageContent = (
  content: string,
  theme: string,
  copiedStates: Record<number, boolean>,
  setCopiedStates: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
): React.ReactNode => {

  // Split by code blocks (```language\ncode```)
  const parts = content.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Extract language and code content
      const codeBlock = part.slice(3, -3)
      const firstLineBreak = codeBlock.indexOf('\n')
      const language = firstLineBreak > 0 ? codeBlock.slice(0, firstLineBreak).trim().toLowerCase() : 'text'
      const codeContent = firstLineBreak > 0 ? codeBlock.slice(firstLineBreak + 1) : codeBlock

       const handleCopy = async () => {
          const logger = createLogger('MessageBubble')
         try {
           await navigator.clipboard.writeText(codeContent)
           setCopiedStates(prev => ({ ...prev, [index]: true }))
           setTimeout(() => {
             setCopiedStates(prev => ({ ...prev, [index]: false }))
           }, 2000)
         } catch (err) {
            logger.error({ error: err }, 'Failed to copy code')
         }
       }

      return (
        <div key={index} className="relative group my-3">
          {/* Language label */}
          {language !== 'text' && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {language}
              </span>
            </div>
          )}

          {/* Syntax highlighted code block */}
          <div className="relative">
             <SyntaxHighlighter
               language={language}
               style={theme === 'dark' ? oneDark : oneLight}
               // SyntaxHighlighter styles - theme-dependent inline styles required for code highlighting
               customStyle={{
                 margin: 0,
                 borderRadius: '0.5rem',
                 fontSize: '0.875rem',
                 lineHeight: '1.5',
               }}
               showLineNumbers
               lineNumberStyle={{
                 minWidth: '3em',
                 paddingRight: '1em',
                 color: 'var(--syntax-line-number)',
                 borderRight: '1px solid',
                 borderRightColor: 'var(--syntax-border)',
                 marginRight: '1em',
                 textAlign: 'right',
                 userSelect: 'none',
               }}
              wrapLines
              wrapLongLines
            >
              {codeContent.trim()}
            </SyntaxHighlighter>

            {/* Copy button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background border "
              onClick={handleCopy}
              title="Salin kode"
            >
              {copiedStates[index] ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      )
    }

    // Handle inline code (`code`)
    const inlineCodeParts = part.split(/(`[^`]+`)/g)
    return inlineCodeParts.map((inlinePart, inlineIndex) => {
      if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
        return (
          <code key={`${index}-${inlineIndex}`} className="bg-muted/70 px-1.5 py-0.5 rounded text-sm font-mono border">
            {inlinePart.slice(1, -1)}
          </code>
        )
      }

      // Handle line breaks and formatting
      return inlinePart.split('\n').map((line, lineIndex, arr) => (
        <Fragment key={`${index}-${inlineIndex}-${lineIndex}`}>
          {line}
          {lineIndex < arr.length - 1 && <br />}
        </Fragment>
      ))
    })
  })
}

export const MessageBubble = ({ message, onSuggestionClick, onFeedbackSubmit }: MessageBubbleProps): JSX.Element => {
  const { theme } = useTheme()
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({})

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
      "w-full",
      message.role === 'user' ? "flex justify-end" : "flex justify-start"
    )}>
      <div className={cn(
        "max-w-[80%]",
        message.role === 'user' ? "ml-12" : "mr-12"
      )}>
        {message.role === 'assistant' && (
          <div className="flex items-start gap-3 mb-2">
            <div className="relative">
              <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10" aria-label="Avatar asisten">
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm border border-border/50 px-4 py-3 rounded-2xl rounded-tl-md ">
                <div className="text-sm leading-relaxed text-foreground break-words space-y-2">
                  {formatMessageContent(message.content, theme || 'light', copiedStates, setCopiedStates)}
                </div>
                {/* Message timestamp */}
                <div className="text-xs text-muted-foreground mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {message.role === 'user' && (
           <div className="flex items-start gap-3 mb-2 justify-end">
             <div className="flex-1 min-w-0 text-right">
               <div className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-4 py-3 rounded-2xl rounded-bl-md max-w-full break-words ">
                 <p className="text-sm leading-relaxed">{message.content}</p>
                 {/* Message status indicator */}
                 <div className="flex justify-end mt-1">
                   <div className="flex items-center gap-1 text-xs opacity-70">
                     <div className="w-1 h-1 bg-primary-foreground/70 rounded-full" />
                     <span className="text-primary-foreground/70">
                       {message.timestamp.toLocaleTimeString('id-ID', {
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </span>
                   </div>
                 </div>
               </div>
             </div>
             <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-primary/20">
               <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5">
                 <User className="h-4 w-4 text-primary" />
               </AvatarFallback>
             </Avatar>
           </div>
         )}

        {/* Display data if available */}
        {renderMessageData(message['data'])}

        {/* Quick Actions */}
        {message.quickActions && message.quickActions.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              ⚡ Aksi Cepat:
            </p>
            <div className="flex flex-wrap gap-2">
              {message.quickActions.map((action) => (
                <Button
                  key={`${message['id']}-action-${action.label}`}
                  variant="default"
                  size="sm"
                  className="text-xs h-8 px-3 rounded-full bg-primary/90 hover:bg-primary transition-colors"
                  onClick={() => {
                    if (action.action === 'navigate') {
                      window.open(action.url, '_blank')
                    } else if (action.action === 'suggest') {
                      onSuggestionClick?.(action.suggestion || '')
                    }
                  }}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
              💡 Coba tanyakan:
            </p>
            <div className="flex flex-wrap gap-2">
              {message.suggestions.map((suggestion) => (
                <Button
                  key={`${message['id']}-${suggestion}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-3 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Widget for Assistant Messages */}
        {message.role === 'assistant' && onFeedbackSubmit && !message.feedback && (
          <div className="mt-4">
            <FeedbackWidget
              messageId={message.id}
              onFeedbackSubmit={onFeedbackSubmit}
            />
          </div>
        )}

        {/* Show submitted feedback */}
        {message.feedback && (
          <div className="mt-4 text-xs text-muted-foreground">
            Feedback: {message.feedback.rating === 1 ? '👍' : '👎'}
            {message.feedback.comment && (
              <span className="ml-2">&ldquo;{message.feedback.comment}&rdquo;</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

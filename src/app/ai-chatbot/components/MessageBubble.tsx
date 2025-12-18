'use client'

import { Bot, Check, Copy, User } from '@/components/icons'
import { Fragment, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'

import type { Message } from '@/app/ai-chatbot/types/index'
import { Button } from '@/components/ui/button'
import { handleError } from '@/lib/error-handling'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface MessageBubbleProps {
  message: Message
  onSuggestionClick?: (suggestion: string) => void
  onFeedbackSubmit: ((messageId: string, rating: number, comment?: string | undefined) => void) | undefined
}

const formatMessageContent = (
  content: string,
  theme: string,
  copiedStates: Record<number, boolean>,
  setCopiedStates: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
): React.ReactNode => {
  const safeContent = content || ''
  if (!safeContent) return <span className="text-muted-foreground italic">Tidak ada respons</span>

  const parts = safeContent.split(/(```[\s\S]*?```)/g)

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const codeBlock = part.slice(3, -3)
      const firstLineBreak = codeBlock.indexOf('\n')
      const language = firstLineBreak > 0 ? codeBlock.slice(0, firstLineBreak).trim().toLowerCase() : 'text'
      const codeContent = firstLineBreak > 0 ? codeBlock.slice(firstLineBreak + 1) : codeBlock

      const handleCopy = async (): Promise<void> => {
        try {
          await navigator.clipboard.writeText(codeContent)
          setCopiedStates(prev => ({ ...prev, [index]: true }))
          setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [index]: false }))
          }, 2000)
        } catch (err) {
          handleError(err, 'MessageBubble: Copy code', true, 'Gagal menyalin kode')
        }
      }

      return (
        <div key={index} className="relative group my-3">
          {language !== 'text' && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                {language}
              </span>
            </div>
          )}
          <div className="relative">
            <SyntaxHighlighter
              language={language}
              style={theme === 'dark' ? oneDark : oneLight}
              customStyle={{
                margin: 0,
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                lineHeight: '1.5',
              }}
              wrapLines
              wrapLongLines
            >
              {codeContent.trim()}
            </SyntaxHighlighter>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
              onClick={handleCopy}
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

    const inlineCodeParts = part.split(/(`[^`]+`)/g)
    return inlineCodeParts.map((inlinePart, inlineIndex) => {
      if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
        return (
          <code key={`${index}-${inlineIndex}`} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
            {inlinePart.slice(1, -1)}
          </code>
        )
      }
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
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {/* Avatar - Assistant only */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      {/* Message content */}
      <div className={cn('max-w-[85%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted/60 text-foreground rounded-bl-md border border-border/30'
          )}
        >
          <div className="break-words">
            {isUser ? (
              message.content
            ) : (
              formatMessageContent(message.content, theme || 'light', copiedStates, setCopiedStates)
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className={cn('text-[10px] text-muted-foreground px-1', isUser ? 'text-right' : 'text-left')}>
          {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Suggestions */}
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {message.suggestions.map((suggestion) => (
              <Button
                key={`${message.id}-${suggestion}`}
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs rounded-full hover:bg-primary/10 hover:border-primary/40"
                onClick={() => onSuggestionClick?.(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}

        {/* Feedback - simplified */}
        {!isUser && onFeedbackSubmit && !message.feedback && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] text-muted-foreground">Apakah ini membantu?</span>
            <div className="flex gap-1">
              <button
                className="text-xs hover:bg-green-100 dark:hover:bg-green-900/30 px-2 py-0.5 rounded transition-colors"
                onClick={() => onFeedbackSubmit(message.id, 1)}
              >
                👍
              </button>
              <button
                className="text-xs hover:bg-red-100 dark:hover:bg-red-900/30 px-2 py-0.5 rounded transition-colors"
                onClick={() => onFeedbackSubmit(message.id, -1)}
              >
                👎
              </button>
            </div>
          </div>
        )}

        {message.feedback && (
          <div className="text-[10px] text-muted-foreground">
            {message.feedback.rating === 1 ? '👍 Terima kasih!' : '👎 Terima kasih atas feedback Anda'}
          </div>
        )}
      </div>

      {/* Avatar - User only */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}

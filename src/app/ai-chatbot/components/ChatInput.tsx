import { Send, Loader2 } from 'lucide-react'
import { type FormEvent } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { SuggestionChips } from '@/app/ai-chatbot/components/SuggestionChips'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSendMessage: (message?: string) => void
  isLoading: boolean
}

export const ChatInput = ({ input, setInput, onSendMessage, isLoading }: ChatInputProps): JSX.Element => {
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion: string): void => {
    onSendMessage(suggestion)
  }

  return (
    <div className="border-t border-border/20 bg-background px-4 py-4 safe-bottom">
      <div className="space-y-3 max-w-4xl mx-auto">
        {/* Quick Suggestions */}
        <SuggestionChips
          onSuggestionClick={handleSuggestionClick}
          disabled={isLoading}
        />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2" role="search" aria-label="Kirim pesan chatbot">
          <TooltipProvider disableHoverableContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  value={input}
                   onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  placeholder="Tanyakan apa saja tentang bisnis UMKM kuliner Anda..."
                  className="flex-1 input-mobile focus-mobile"
                  disabled={isLoading}
                  aria-label="Kolom input pesan"
                   onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                      e.preventDefault()
                      onSendMessage()
                    }
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" align="end">
                <div className="text-xs">
                  <div><b>Enter</b> untuk kirim</div>
                  <div><b>Shift+Enter</b> untuk baris baru</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider disableHoverableContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="touch-target shrink-0"
                  aria-label="Kirim"
                  title="Kirim"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="text-xs">Kirim (Enter)</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </form>

        <p className="text-xs text-center text-muted-foreground hidden sm:block">
          Enter: kirim • Shift+Enter: baris baru
        </p>
      </div>
    </div>
  )
}

import { Send, Loader2 } from 'lucide-react'
import { type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { SuggestionChips } from './SuggestionChips'

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
    <div className="p-4 bg-muted/30">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Quick Suggestions */}
        <SuggestionChips
          onSuggestionClick={handleSuggestionClick}
          disabled={isLoading}
        />

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan apa saja tentang bisnis UMKM kuliner Anda..."
            className="flex-1 bg-background"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                e.preventDefault()
                onSendMessage()
              }
            }}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <p className="text-xs text-center text-muted-foreground">
          Tekan Enter untuk kirim pesan
        </p>
      </div>
    </div>
  )
}

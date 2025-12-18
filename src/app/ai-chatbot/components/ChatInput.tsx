import { Loader2, Send } from '@/components/icons'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSendMessage: (message?: string) => void
  isLoading: boolean
}

export const ChatInput = ({
  input,
  setInput,
  onSendMessage,
  isLoading,
}: ChatInputProps): JSX.Element => {
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage()
    }
  }

  return (
    <div className="flex-shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-sm px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            placeholder="Tanyakan apa saja tentang bisnis UMKM kuliner Anda..."
            className="min-h-[44px] max-h-[120px] resize-none pr-2 rounded-xl border-border/50 focus:border-primary/50 transition-colors"
            disabled={isLoading}
            rows={1}
            onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                e.preventDefault()
                onSendMessage()
              }
            }}
          />
        </div>
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="icon"
          className="h-11 w-11 rounded-xl shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      <p className="text-[10px] text-center text-muted-foreground mt-2">
        Enter: kirim • Shift+Enter: baris baru
      </p>
    </div>
  )
}

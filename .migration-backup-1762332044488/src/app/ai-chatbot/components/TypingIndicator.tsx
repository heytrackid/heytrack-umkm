import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Loader2 } from 'lucide-react'

export const TypingIndicator = () => (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Sedang berpikir...</span>
        </div>
      </div>
    </div>
  )

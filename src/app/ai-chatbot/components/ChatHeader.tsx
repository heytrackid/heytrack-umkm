import { Badge } from '@/components/ui/badge'
import { Bot, Sparkles } from 'lucide-react'

export function ChatHeader() {
  return (
    <div className="border-b border-border p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Bot className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-semibold text-foreground">Asisten AI HeyTrack</h1>
        <p className="text-sm text-muted-foreground">Asisten cerdas untuk manajemen bisnis UMKM kuliner Anda</p>
      </div>
      <Badge variant="secondary" className="ml-auto">
        <Sparkles className="h-3 w-3 mr-1" />
        AI Powered
      </Badge>
    </div>
  )
}

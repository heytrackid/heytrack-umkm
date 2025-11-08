import { Bot } from 'lucide-react'

export const ChatHeader = (): JSX.Element => (
    <div className="border-b border-border px-4 py-3 flex items-center gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>
      <div>
        <h1 className="text-sm font-medium text-foreground">HeyTrack AI Assistant</h1>
      </div>
    </div>
  )

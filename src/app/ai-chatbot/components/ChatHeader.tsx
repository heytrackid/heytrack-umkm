'use client'

import { Bot, Sparkles } from '@/components/icons'
import { useEffect, useState } from 'react'

export const ChatHeader = (): JSX.Element => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true)
    const handleOffline = (): void => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="flex-shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-foreground truncate">
              HeyTrack AI
            </h1>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">Pro</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {isOnline ? 'Siap membantu bisnis kuliner Anda' : 'Offline'}
          </p>
        </div>
      </div>
    </div>
  )
}

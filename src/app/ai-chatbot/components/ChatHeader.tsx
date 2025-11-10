'use client'

import { Bot, Sparkles, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'

export const ChatHeader = (): JSX.Element => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="border-b border-border/20 px-4 py-3 flex items-center gap-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        {/* Online status indicator */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isOnline ? (
            <Wifi className="h-2 w-2 text-white m-0.5" />
          ) : (
            <WifiOff className="h-2 w-2 text-white m-0.5" />
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-foreground leading-tight">HeyTrack AI Assistant</h1>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Pro</span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {isOnline ? 'Tanyakan apa saja tentang bisnis UMKM Anda' : 'Mode offline - beberapa fitur terbatas'}
        </p>
      </div>
    </div>
  )
}

'use client'

/**
 * Context-Aware AI Chatbot Component
 */

import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useContextAwareChat } from '@/hooks/useContextAwareChat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Plus,
  History,
  Sparkles,
  AlertCircle
} from 'lucide-react'

export const ContextAwareChatbot = () => {
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    sendMessage,
    loadSession,
    createNewSession,
    clearError,
  } = useContextAwareChat()

  const [input, setInput] = useState('')
  const [showSessions, setShowSessions] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) {return}

    await sendMessage(input)
    void setInput('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    void setInput(suggestion)
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Assistant</CardTitle>
            {sessionId && (
              <Badge variant="outline" className="text-xs">
                Context-Aware
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
            >
              <History className="h-4 w-4 mr-1" />
              History
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={createNewSession}
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Sessions Sidebar */}
        {showSessions && (
          <div className="border-b p-4 bg-muted/50">
            <h3 className="text-sm font-medium mb-2">Recent Conversations</h3>
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No previous conversations</p>
              ) : (
                sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant={sessionId === session.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      void loadSession(session.id)
                      void setShowSessions(false)
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="truncate">{session.title}</span>
                  </Button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Tanya Apa Saja tentang Bisnis Anda
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Saya akan mengingat konteks percakapan dan memberikan jawaban yang lebih relevan
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Berapa stok tepung saat ini?')}
                >
                  Berapa stok tepung saat ini?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Resep apa yang bisa dibuat dengan bahan yang ada?')}
                >
                  Resep apa yang bisa dibuat?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInput('Bagaimana profit bulan ini?')}
                >
                  Bagaimana profit bulan ini?
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium mb-2 opacity-70">
                          Pertanyaan lanjutan:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="secondary"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya sesuatu... (misal: 'Berapa harganya?' setelah menyebut produk)"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-2">
            💡 Tip: Saya mengingat konteks percakapan. Anda bisa bertanya "harganya berapa?" 
            setelah menyebut produk tertentu.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

/**
 * Context-Aware AI Chatbot Component - Enhanced UI/UX
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
  AlertCircle,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'

export const ContextAwareChatbot = () => {
  const {
    messages,
    isLoading,
    error,
    sessionId,
    sessions,
    suggestions,
    sendMessage,
    loadSession,
    createNewSession,
    clearError,
  } = useContextAwareChat()

  const [input, setInput] = useState('')
  const [showSessions, setShowSessions] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) { return }

    const messageToSend = input
    setInput('') // Clear input immediately
    await sendMessage(messageToSend)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  return (
    <Card className={`w-full flex flex-col transition-all duration-300 ${isExpanded ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'
      }`}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Assistant HeyTrack
                {sessionId && (
                  <Badge variant="secondary" className="text-xs">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Aktif
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tanya apa saja tentang bisnis Anda
              </p>
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
              title="Riwayat Chat"
            >
              <History className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={createNewSession}
              title="Chat Baru"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Perkecil' : 'Perbesar'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Sessions Sidebar */}
        {showSessions && (
          <div className="border-b p-4 bg-gradient-to-br from-muted/50 to-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Riwayat Percakapan
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSessions(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">Belum ada percakapan</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <Button
                    key={session.id}
                    variant={sessionId === session.id ? 'secondary' : 'ghost'}
                    size="sm"
                    className="w-full justify-start text-left hover:bg-secondary/80"
                    onClick={() => {
                      void loadSession(session.id)
                      setShowSessions(false)
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                    <span className="truncate text-xs">{session.title}</span>
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
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4">
                <Bot className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Halo! Ada yang bisa saya bantu? 👋
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Saya AI Assistant yang memahami konteks bisnis Anda. Tanya apa saja tentang stok, resep, HPP, atau laporan keuangan.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  onClick={() => setInput('Berapa stok tepung saat ini?')}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📦</span>
                    <div>
                      <div className="font-medium text-sm">Cek Stok Bahan</div>
                      <div className="text-xs text-muted-foreground">Berapa stok tepung saat ini?</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  onClick={() => setInput('Resep apa yang bisa dibuat dengan bahan yang ada?')}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">👨‍🍳</span>
                    <div>
                      <div className="font-medium text-sm">Rekomendasi Resep</div>
                      <div className="text-xs text-muted-foreground">Resep apa yang bisa dibuat?</div>
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                  onClick={() => setInput('Bagaimana profit bulan ini?')}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <div className="font-medium text-sm">Analisis Keuangan</div>
                      <div className="text-xs text-muted-foreground">Bagaimana profit bulan ini?</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-muted'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

                    {/* Suggestions - only show for last assistant message */}
                    {message.role === 'assistant' &&
                      messages.indexOf(message) === messages.length - 1 &&
                      suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-xs font-medium mb-2 opacity-70">
                            💡 Pertanyaan lanjutan:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 3).map((suggestion, idx: number) => (
                              <Button
                                key={idx}
                                variant="secondary"
                                size="sm"
                                className="text-xs h-7 hover:bg-secondary/80"
                                onClick={() => handleSuggestionClick(suggestion.text)}
                              >
                                {suggestion.text}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {message.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/20">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <span className="text-destructive flex-1">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="hover:bg-destructive/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/10 dark:to-pink-950/10">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pertanyaan Anda di sini..."
              disabled={isLoading}
              className="flex-1 bg-background"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-purple-500" />
            <p>
              Saya mengingat konteks percakapan. Anda bisa bertanya follow-up seperti "harganya berapa?" atau "bagaimana cara membuatnya?"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

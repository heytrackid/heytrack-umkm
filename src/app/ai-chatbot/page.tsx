'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Import enhanced AI service
import { getInventoryInsights, getRecipeSuggestions, getFinancialAnalysis, getOrderInsights, getBusinessInsights } from '@/lib/ai-chatbot-service'
import { NLPProcessor, AIResponseGenerator } from '@/lib/nlp-processor'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: any
}

interface ChatSuggestion {
  text: string
  category: string
}

const SUGGESTIONS: ChatSuggestion[] = [
  { text: "Berapa stok bahan baku yang tersedia?", category: "inventory" },
  { text: "Rekomendasikan resep untuk hari ini", category: "recipe" },
  { text: "Analisis profit margin bulan ini", category: "financial" },
  { text: "Status pesanan terbaru", category: "orders" },
  { text: "Sarankan harga jual yang optimal", category: "pricing" },
  { text: "Prediksi penjualan minggu depan", category: "forecast" }
]

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Halo! Saya adalah asisten AI HeyTrack untuk membantu mengelola bisnis bakery Anda. Apa yang bisa saya bantu hari ini?',
      timestamp: new Date(),
      suggestions: SUGGESTIONS.slice(0, 3).map(s => s.text)
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    if (!textToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Analyze user intent and get appropriate response
      const response = await processAIQuery(textToSend)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
        data: response.data
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const processAIQuery = async (query: string) => {
    try {
      // Get business data for context
      const [inventoryData, recipeData, financialData, orderData] = await Promise.all([
        getInventoryInsights(query),
        getRecipeSuggestions(query),
        getFinancialAnalysis(query),
        getOrderInsights(query)
      ])

      // Combine all business data
      const businessData = {
        inventory: inventoryData.data,
        recipes: recipeData.data,
        financial: financialData.data,
        orders: orderData.data
      }

      // Use advanced NLP processing
      const response = await AIResponseGenerator.generateResponse(query, businessData)

      return {
        message: response.message,
        suggestions: response.suggestions || [
          "Berapa stok bahan baku yang tersedia?",
          "Rekomendasikan resep untuk hari ini",
          "Analisis profit margin bulan ini",
          "Status pesanan terbaru"
        ],
        data: response.data
      }
    } catch (error) {
      console.error('Error processing AI query:', error)

      // Fallback to basic responses if NLP fails
      const lowerQuery = query.toLowerCase()

      if (lowerQuery.includes('stok') || lowerQuery.includes('bahan') || lowerQuery.includes('inventory')) {
        return await getInventoryInsights(query)
      }

      if (lowerQuery.includes('resep') || lowerQuery.includes('recipe') || lowerQuery.includes('produksi')) {
        return await getRecipeSuggestions(query)
      }

      if (lowerQuery.includes('uang') || lowerQuery.includes('profit') || lowerQuery.includes('harga') || lowerQuery.includes('financial')) {
        return await getFinancialAnalysis(query)
      }

      if (lowerQuery.includes('pesanan') || lowerQuery.includes('order') || lowerQuery.includes('pelanggan')) {
        return await getOrderInsights(query)
      }

      // Default fallback
      return {
        message: 'Saya bisa membantu Anda dengan manajemen inventory, resep, analisis keuangan, dan pesanan. Coba tanyakan hal spesifik seperti "Berapa stok tepung terigu?" atau "Rekomendasikan resep roti untuk hari ini".',
        suggestions: [
          "Berapa stok bahan baku yang tersedia?",
          "Rekomendasikan resep untuk hari ini",
          "Analisis profit margin bulan ini",
          "Status pesanan terbaru"
        ]
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
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

      {/* Chat Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.role === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}>
                <p className="text-sm leading-relaxed">{message.content}</p>

                {/* Display data if available */}
                {message.data && (
                  <div className="mt-3 p-3 bg-background/50 rounded border">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(message.data, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Coba tanyakan:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
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

              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
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
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          {/* Quick Suggestions */}
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs h-8 text-muted-foreground hover:text-foreground"
                onClick={() => handleSuggestionClick(suggestion.text)}
                disabled={isLoading}
              >
                {suggestion.text}
              </Button>
            ))}
          </div>

          <Separator className="mb-3" />

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan apa saja tentang bisnis UMKM kuliner Anda..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

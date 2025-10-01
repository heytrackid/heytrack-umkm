'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Lazy load heavy chat components
const ScrollArea = dynamic(() => import('@/components/ui/scroll-area').then(m => ({ default: m.ScrollArea })))
const Breadcrumb = dynamic(() => import('@/components/ui/breadcrumb').then(m => ({ default: m.Breadcrumb })))
const BreadcrumbList = dynamic(() => import('@/components/ui/breadcrumb').then(m => ({ default: m.BreadcrumbList })))
const BreadcrumbItem = dynamic(() => import('@/components/ui/breadcrumb').then(m => ({ default: m.BreadcrumbItem })))
const BreadcrumbLink = dynamic(() => import('@/components/ui/breadcrumb').then(m => ({ default: m.BreadcrumbLink })))
const BreadcrumbPage = dynamic(() => import('@/components/ui/breadcrumb').then(m => ({ default: m.BreadcrumbPage })))
const BreadcrumbSeparator = dynamic(() => import('@/components/ui/breadcrumb').then(m => ({ default: m.BreadcrumbSeparator })))
import { useResponsive } from '@/hooks/use-mobile'
import { generateAIResponse } from './utils/aiResponseGenerator'
import { 
  MessageSquare, 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Package, 
  DollarSign,
  Coffee
} from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: Date
  suggestions?: string[]
}

export default function AIChatPage() {
  const { isMobile } = useResponsive()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Halo! Saya adalah AI Assistant untuk bisnis bakery Anda. Saya bisa membantu dengan analisis penjualan, optimasi stok, strategi pricing, dan berbagai insight bisnis lainnya. Apa yang ingin Anda tanyakan hari ini?',
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Bagaimana performa penjualan bulan ini?',
        'Ada rekomendasi untuk optimasi stok?',
        'Analisa profitabilitas produk terlaris',
        'Tips meningkatkan margin profit'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(content)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/ai">AI Assistant</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chat Assistant</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-2`}>
              <MessageSquare className="h-8 w-8 text-blue-600" />
              Chat Assistant
              <Badge variant="default" className="text-xs">BETA</Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Tanya AI tentang bisnis bakery Anda
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="h-4 w-4 text-blue-600" />
                AI Assistant
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4 pb-4 w-full max-w-full overflow-x-hidden">
                <div className="space-y-4 w-full max-w-full overflow-hidden">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex gap-3 w-full max-w-full ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className={`flex flex-col max-w-[calc(100%-3rem)] min-w-0 overflow-hidden ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-lg p-3 max-w-full break-words overflow-hidden overflow-wrap-anywhere ${
                          message.sender === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`} style={{wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%'}}>
                          <div className="text-sm" style={{wordBreak: 'break-word', overflowWrap: 'anywhere'}}>
                            {message.content}
                          </div>
                        </div>
                        
                        <div className="mt-1 text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString('id-ID')}
                        </div>
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 font-medium">Saran pertanyaan:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  className="justify-start text-left h-auto p-2 text-xs bg-gray-50 hover:bg-gray-100"
                                  onClick={() => sendMessage(suggestion)}
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
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
              
              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tanya tentang bisnis Anda... (misal: 'Bagaimana penjualan bulan ini?')"
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => sendMessage('Analisa penjualan bulan ini')}
                    disabled={isTyping}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Sales Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => sendMessage('Cek status inventory')}
                    disabled={isTyping}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Inventory Check
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => sendMessage('Tips meningkatkan profit')}
                    disabled={isTyping}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    Profit Tips
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => sendMessage('Saran marketing')}
                    disabled={isTyping}
                  >
                    <Coffee className="h-3 w-3 mr-1" />
                    Marketing Ideas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info */}
        <Card className="max-w-4xl mx-auto border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">
                  Tips Menggunakan Chat Assistant
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Tanya hal spesifik: "Bagaimana penjualan croissant minggu ini?"</p>
                  <p>• Minta analisa: "Analisa profitabilitas semua produk"</p>
                  <p>• Cari saran: "Tips meningkatkan customer retention"</p>
                  <p>• Request action: "Buat laporan inventory untuk reorder"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

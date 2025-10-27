'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Send, Bot, User, BarChart3, Package, DollarSign, Users, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { ChatMessage, ChatAction, ChatContext } from '@/lib/ai-chatbot/types';
import DataVisualization from './DataVisualization';

import { apiLogger } from '@/lib/logger'
interface ChatbotInterfaceProps {
  userId: string;
  className?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ChatbotInterface = ({ 
  userId, 
  className = '', 
  isMinimized = false, 
  onToggleMinimize 
}: ChatbotInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<ChatContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with greeting
  useEffect(() => {
    if (messages.length === 0) {
      handleSendMessage('Hello');
    }
  }, []);

  // Handle sending messages via API
  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend || isLoading) {return;}

    setIsLoading(true);
    setInputValue('');

    try {
      // Add user message to UI immediately
      if (!message) { // Only add user message if it's not an auto-greeting
        const userMessage = {
          id: `user_${Date.now()}`,
          type: 'user' as const,
          content: messageToSend,
          timestamp: new Date(),
          contextId: context?.id
        };
        setMessages(prev => [...prev, userMessage]);
      }

      // Call AI chat API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: messageToSend,
          contextId: context?.id,
          useAI: true
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setMessages(prev => [...prev, result.response]);
        setContext({
          ...result.context,
          conversation: [],
          activeActions: result.actions || [],
          memory: {}
        });
      } else {
        throw new Error(result.error || 'Unknown API error');
      }

    } catch (err: unknown) {
      apiLogger.error({ error }, 'Error sending message:');
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action button clicks via API
  const handleActionClick = async (action: ChatAction) => {
    if (!context) {return;}

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/ai/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionId: action.id,
          contextId: context.id,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`Action API error: ${response.status}`);
      }

      const apiResult = await response.json();
      
      if (apiResult.success) {
        const {result} = apiResult;
        
        // Create system message with enhanced content
        let content = result.message || `Aksi"${action.label}" berhasil dijalankan.`;
        
        // Add AI recommendations if available
        if (result.aiRecommendations) {
          content += `\n\n🤖 **AI Recommendations:**\n${result.aiRecommendations}`;
        }
        
        const systemMessage: ChatMessage = {
          id: `system_${Date.now()}`,
          type: 'system',
          content,
          timestamp: new Date(),
          contextId: context.id,
          data: {
            ...result,
            actionType: action.type,
            aiEnhanced: !!(result.aiRecommendations || result.businessInsights)
          }
        };

        setMessages(prev => [...prev, systemMessage]);
      } else {
        throw new Error(apiResult.error || 'Unknown action error');
      }
      
    } catch (err: unknown) {
      apiLogger.error({ error }, 'Error executing action:');
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        type: 'assistant',
        content: 'Gagal menjalankan aksi AI. Silakan coba lagi.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get icon for action type
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'add_order': return <Package className="h-4 w-4" />;
      case 'check_stock': return <Package className="h-4 w-4" />;
      case 'view_report': return <BarChart3 className="h-4 w-4" />;
      case 'analysis': return <BarChart3 className="h-4 w-4" />;
      case 'recommendation': return <Users className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  // Message bubble component
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
        <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%] min-w-0 gap-2`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : isSystem ? 'bg-green-500' : 'bg-gray-500'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : isSystem ? (
              <MessageCircle className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>

          {/* Message content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 min-w-0 overflow-hidden`}>
            <div className={`px-4 py-3 rounded-lg w-full break-words overflow-hidden ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : isSystem
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed break-words overflow-wrap-anywhere word-break-break-word">
                {message.content}
              </div>

              {/* Action buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleActionClick(action)}
                      disabled={isLoading}
                      className="text-xs h-8"
                    >
                      {getActionIcon(action.type)}
                      <span className="ml-1">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Data visualization */}
              {message.data && (message.type === 'assistant' || message.type === 'system') && (
                <div className="mt-3">
                  {(() => {
                    // Determine visualization type based on message data structure
                    if (message.data.profitMargin !== undefined) {
                      return <DataVisualization type="financial" data={message.data} compact />;
                    } if (message.data.criticalItems) {
                      return <DataVisualization type="inventory" data={message.data} compact />;
                    } if (message.data.topCustomers) {
                      return <DataVisualization type="customers" data={message.data} compact />;
                    } if (message.data.topRecipes) {
                      return <DataVisualization type="products" data={message.data} compact />;
                    } if (message.data.analysis) {
                      return <DataVisualization type="analysis" data={message.data} compact />;
                    }
                    return null;
                  })()} 
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Quick action buttons
  const QuickActions = () => (
    <div className="p-4 bg-gray-50 border-t">
      <p className="text-xs text-gray-600 mb-2">Aksi Cepat:</p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Bagaimana kondisi stok hari ini?')}
          disabled={isLoading}
          className="text-xs h-8"
        >
          <Package className="h-3 w-3 mr-1" />
          Cek Stok
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Tampilkan laporan keuangan bulan ini')}
          disabled={isLoading}
          className="text-xs h-8"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Laporan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendMessage('Berikan saran untuk meningkatkan penjualan')}
          disabled={isLoading}
          className="text-xs h-8"
        >
          <Users className="h-3 w-3 mr-1" />
          Saran
        </Button>
      </div>
    </div>
  );

  if (isMinimized) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80  border-2 ${className}`}>
        <CardHeader className="p-4 bg-blue-500 text-white rounded-t-lg flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Asisten UMKM AI</h3>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
          {onToggleMinimize && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-white hover:bg-blue-600 h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">
            Klik untuk memulai percakapan dengan asisten AI Anda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 w-96 h-[600px]  border-2 flex flex-col ${className}`}>
      {/* Header */}
      <CardHeader className="p-4 bg-gray-700 dark:bg-gray-800 text-white rounded-t-lg flex flex-row items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-semibold">Asisten UMKM AI</h3>
          <Badge variant="secondary" className="text-xs">Online</Badge>
        </div>
        {onToggleMinimize && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMinimize}
            className="text-white hover:bg-gray-600 dark:hover:bg-gray-700 h-8 w-8 p-0"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      {/* Messages area */}
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick actions */}
        {messages.length > 1 && <QuickActions />}

        {/* Input area */}
        <div className="p-4 border-t bg-white flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}

              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Ketik pesan atau gunakan aksi cepat di atas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatbotInterface;

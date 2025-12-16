'use client'

import React, { useMemo } from 'react'

import { SUGGESTIONS } from '@/app/ai-chatbot/types/index'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SuggestionChipsProps {
  onSuggestionClick: (suggestion: string) => void
  disabled?: boolean
  conversationHistory?: Array<{ role: string; content: string }>
  businessContext?: {
    hasOrders?: boolean
    hasInventory?: boolean
    hasRecipes?: boolean
    hasProfitData?: boolean
  }
}

export const SuggestionChips = ({
  onSuggestionClick,
  disabled,
  conversationHistory = [],
  businessContext = {}
}: SuggestionChipsProps): React.JSX.Element => {

  const smartSuggestions = useMemo(() => {
    const history = conversationHistory.slice(-10) // Last 10 messages
    const askedTopics = new Set<string>()

    // Analyze conversation history to see what topics have been discussed
    history.forEach(message => {
      const content = message.content.toLowerCase()
      if (content.includes('stok') || content.includes('inventory') || content.includes('bahan')) {
        askedTopics.add('inventory')
      }
      if (content.includes('pesanan') || content.includes('order') || content.includes('penjualan')) {
        askedTopics.add('orders')
      }
      if (content.includes('resep') || content.includes('recipe') || content.includes('menu')) {
        askedTopics.add('recipes')
      }
      if (content.includes('profit') || content.includes('hpp') || content.includes('keuntungan')) {
        askedTopics.add('profit')
      }
    })

    // Prioritize suggestions based on business context and conversation history
    const prioritizedSuggestions = SUGGESTIONS.map(suggestion => {
      let priority = 1

      // Boost priority for topics not yet discussed
      if (!askedTopics.has(suggestion.category)) {
        priority += 2
      }

      // Boost priority for available business data
      switch (suggestion.category) {
        case 'inventory':
          if (businessContext.hasInventory) priority += 3
          break
        case 'orders':
          if (businessContext.hasOrders) priority += 3
          break
        case 'recipes':
          if (businessContext.hasRecipes) priority += 3
          break
        case 'financial':
        case 'forecast':
          if (businessContext.hasProfitData) priority += 3
          break
      }

      return { ...suggestion, priority }
    })

    // Sort by priority and return top suggestions
    return prioritizedSuggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4)
  }, [conversationHistory, businessContext])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inventory': return '📦'
      case 'orders': return '🛒'
      case 'recipes': return '👨‍🍳'
      case 'financial': return '💰'
      case 'pricing': return '🏷️'
      case 'forecast': return '📈'
      default: return '💡'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'orders': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'recipes': return 'bg-green-100 text-green-800 border-green-200'
      case 'financial': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'pricing': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'forecast': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-secondary text-secondary-foreground border-border/20'
    }
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2 max-w-4xl mx-auto" role="list" aria-label="Saran cerdas">
      <div className="w-full text-center mb-2">
        <p className="text-xs text-muted-foreground font-medium">🎯 Saran yang dipersonalisasi untuk Anda:</p>
      </div>
      {smartSuggestions.map((suggestion) => (
        <Button
          key={suggestion.text}
          variant="outline"
          size="sm"
          className="text-xs h-auto px-4 py-2 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 text-left justify-start flex-1 min-w-0 group relative"
          onClick={() => onSuggestionClick(suggestion.text)}
          disabled={disabled}
          role="listitem"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
            <span className="text-sm">{getCategoryIcon(suggestion.category)}</span>
            <span className="flex-1 truncate">{suggestion.text}</span>
            <Badge
              variant="secondary"
              className={`text-xs px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${getCategoryColor(suggestion.category)}`}
            >
              {suggestion.category}
            </Badge>
          </div>
        </Button>
      ))}
    </div>
  )
}

'use client'

import { useState } from 'react'

import type { ConversationTemplate } from '@/app/ai-chatbot/types/index';
import { CONVERSATION_TEMPLATES } from '@/app/ai-chatbot/types/index'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp, Play } from 'lucide-react'

interface ConversationTemplatesProps {
  onTemplateSelect: (template: ConversationTemplate) => void
  disabled?: boolean
}

export const ConversationTemplates = ({
  onTemplateSelect,
  disabled
}: ConversationTemplatesProps): JSX.Element => {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

  const handleTemplateClick = (template: ConversationTemplate) => {
    if (disabled) return
    onTemplateSelect(template)
  }

  const toggleExpanded = (templateId: string) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId)
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
    <div className="mb-6">
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-2">🚀 Template Percakapan</h2>
        <p className="text-sm text-muted-foreground">
          Pilih template untuk memulai percakapan yang terstruktur tentang bisnis Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {CONVERSATION_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="group hover: transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
            onClick={() => handleTemplateClick(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    toggleExpanded(template.id)
                  }}
                >
                  {expandedTemplate === template.id ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getCategoryColor(template.category)}`}
                >
                  {template.category}
                </Badge>
                <Button
                  size="sm"
                  className="h-7 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Mulai
                </Button>
              </div>

              {/* Expanded content showing conversation flow */}
              {expandedTemplate === template.id && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Alur percakapan:</p>
                  <div className="space-y-1">
                    {template.messages.map((message, index) => (
                      <div
                        key={index}
                        className="text-xs bg-muted/50 rounded px-2 py-1 text-muted-foreground"
                      >
                        {index + 1}. {message}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
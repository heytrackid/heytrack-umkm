'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Package, 
  MessageSquare,
  Lightbulb,
  ArrowRight,
  Zap
} from 'lucide-react'
import PrefetchLink from '@/components/ui/prefetch-link'

interface AIQuickActionsProps {
  onAnalyzeClick?: (type: string) => void
  loading?: boolean
}

export default function AIQuickActions({ onAnalyzeClick, loading = false }: AIQuickActionsProps) {
  
  const quickActions = [
    {
      title: 'Smart Pricing',
      description: 'Analisis harga optimal berbasis AI',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 'AI',
      href: '/ai/pricing',
      action: 'pricing'
    },
    {
      title: 'Chat Assistant',
      description: 'Tanya AI tentang bisnis Anda',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'BETA',
      href: '/ai/chat',
      action: 'chat'
    },
    {
      title: 'Business Insights',
      description: 'Tips personal dari AI',
      icon: Lightbulb,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 'NEW',
      href: '/ai/insights',
      action: 'insights'
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-500" />
            Quick AI Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-12" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                </div>
                <div className="mt-4">
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-gray-600" />
          Quick AI Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index: number) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                  <action.icon className={`h-4 w-4 ${action.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {action.badge}
                </Badge>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {action.description}
              </p>
              
              <div className="flex gap-2">
                <PrefetchLink href={action.href} className="flex-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-sm"
                    disabled={loading}
                  >
                    Buka Tools
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </PrefetchLink>
                {onAnalyzeClick && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onAnalyzeClick(action.action)}
                    disabled={loading}
                    className="text-xs"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Analisis
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

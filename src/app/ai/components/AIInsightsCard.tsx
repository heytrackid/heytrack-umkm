'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface AIInsight {
  id: number
  type: 'pricing' | 'inventory' | 'optimization' | 'alert'
  title: string
  message: string
  impact: 'high' | 'medium' | 'low' | 'urgent'
  savings?: number
  action?: string
  timestamp: Date
}

interface AIInsightsCardProps {
  insights: AIInsight[]
  onExecuteAction: (action: string, insightId: number) => void
  onDismiss: (insightId: number) => void
  loading?: boolean
}

export default function AIInsightsCard({ 
  insights, 
  onExecuteAction, 
  onDismiss, 
  loading = false 
}: AIInsightsCardProps) {
  
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pricing': return TrendingUp
      case 'inventory': return Package
      case 'optimization': return Brain
      case 'alert': return AlertTriangle
      default: return Brain
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'urgent': return 'URGENT'
      case 'high': return 'HIGH'
      case 'medium': return 'MEDIUM'
      case 'low': return 'LOW'
      default: return 'INFO'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-600" />
            AI Insights
          </div>
          <Badge variant="secondary" className="text-xs">
            {insights.length} aktif
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">
              Semua Optimal!
            </h3>
            <p className="text-sm text-gray-500">
              Tidak ada insight urgent yang memerlukan perhatian
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <div 
                  key={insight.id} 
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {insight.timestamp.toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getImpactColor(insight.impact) as any}
                        className="text-xs"
                      >
                        {getImpactLabel(insight.impact)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDismiss(insight.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {insight.message}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {insight.savings && insight.savings > 0 && (
                        <span className="text-green-600 font-medium">
                          Potensi hemat: {formatCurrency(insight.savings)}
                        </span>
                      )}
                    </div>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onExecuteAction(insight.action!, insight.id)}
                        className="text-xs h-7"
                      >
                        Tindak Lanjut
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

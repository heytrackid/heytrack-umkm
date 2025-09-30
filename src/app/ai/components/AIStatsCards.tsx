'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  TrendingUp, 
  Package, 
  DollarSign,
  Activity,
  Zap
} from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface AIStats {
  totalAnalyses: number
  activePricingInsights: number
  inventoryOptimizations: number
  costSavings: number
}

interface AIStatsCardsProps {
  stats: AIStats
  loading?: boolean
}

export default function AIStatsCards({ stats, loading = false }: AIStatsCardsProps) {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Analisis AI',
      value: stats.totalAnalyses.toString(),
      description: 'Analisis bulan ini',
      icon: Brain,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      badge: 'AKTIF'
    },
    {
      title: 'Pricing Insights',
      value: stats.activePricingInsights.toString(),
      description: 'Rekomendasi harga',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: 'SMART'
    },
    {
      title: 'Optimasi Inventory',
      value: stats.inventoryOptimizations.toString(),
      description: 'Prediksi stok',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      badge: 'AUTO'
    },
    {
      title: 'Penghematan AI',
      value: formatCurrency(stats.costSavings),
      description: 'Total hemat bulan ini',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      badge: 'HEMAT'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <Badge variant="secondary" className="text-xs h-5">
                    {stat.badge}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">
                  {stat.description}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

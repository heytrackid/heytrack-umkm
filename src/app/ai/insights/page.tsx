'use client'

import { useState, useEffect } from 'react'
import PrefetchLink from '@/components/ui/prefetch-link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users, 
  Calendar,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { formatCurrency } from '@/shared/utils/currency'

interface BusinessInsight {
  id: string
  category: 'sales' | 'marketing' | 'operations' | 'finance' | 'growth'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'low' | 'medium' | 'high'
  estimatedValue: number
  timeframe: string
  actionItems: string[]
  metrics: string[]
}

export default function AIInsightsPage() {
  const { isMobile } = useResponsive()
  const [isLoading, setIsLoading] = useState(true)
  const [insights, setInsights] = useState<BusinessInsight[]>([])

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    setIsLoading(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockInsights: BusinessInsight[] = [
        {
          id: '1',
          category: 'sales',
          title: 'Optimasi Jam Puncak Penjualan',
          description: 'Data menunjukkan penjualan tertinggi di jam 07:00-09:00 dan 15:00-17:00. Anda bisa meningkatkan revenue 25% dengan mengoptimalkan stok dan staffing di jam-jam tersebut.',
          impact: 'high',
          effort: 'low',
          estimatedValue: 3500000,
          timeframe: '2 minggu',
          actionItems: [
            'Tambah stok produk populer 30 menit sebelum jam puncak',
            'Schedule 2 staff tambahan untuk jam puncak',
            'Buat bundle promo khusus morning & afternoon rush',
            'Set reminder untuk prep produk fresh di jam strategis'
          ],
          metrics: ['Revenue increase: +25%', 'Customer wait time: -40%', 'Staff efficiency: +35%']
        },
        {
          id: '2',
          category: 'marketing',
          title: 'Program Loyalitas Customer',
          description: '68% customer Anda adalah repeat buyer, tapi hanya 23% yang frequent buyer. Implementasi loyalty program bisa meningkatkan frequency pembelian dan customer lifetime value.',
          impact: 'high',
          effort: 'medium',
          estimatedValue: 2800000,
          timeframe: '1 bulan',
          actionItems: [
            'Buat point system: 10 poin = 1 free pastry',
            'Reward tier: Bronze, Silver, Gold member',
            'Birthday special: 50% discount di bulan ulang tahun',
            'Referral bonus: gratis coffee untuk setiap teman yang diajak'
          ],
          metrics: ['Repeat purchase: +45%', 'Customer lifetime value: +60%', 'Word-of-mouth: +30%']
        },
        {
          id: '3',
          category: 'operations',
          title: 'Efisiensi Inventory Management',
          description: 'AI mendeteksi pola waste 15% untuk produk tertentu. Dengan demand forecasting yang lebih akurat, Anda bisa reduce waste hingga 8% dan meningkatkan margin profit.',
          impact: 'medium',
          effort: 'low',
          estimatedValue: 1200000,
          timeframe: '3 minggu',
          actionItems: [
            'Implement weekly demand forecasting',
            'Adjust production quantity berdasarkan historical data',
            'Set up automatic reorder point untuk bahan baku',
            'Daily waste tracking dan analysis'
          ],
          metrics: ['Waste reduction: -8%', 'Inventory turnover: +20%', 'Cost savings: +12%']
        },
        {
          id: '4',
          category: 'finance',
          title: 'Strategi Pricing Dinamis',
          description: 'Analisa kompetitor menunjukkan 3 produk Anda underpriced 15-20%. Kenaikan harga yang strategis bisa meningkatkan margin tanpa mengurangi demand secara signifikan.',
          impact: 'medium',
          effort: 'low',
          estimatedValue: 1800000,
          timeframe: '1 minggu',
          actionItems: [
            'Test price increase 10% untuk Croissant Almond',
            'Bundle pricing untuk increase average transaction',
            'Premium variant dengan margin lebih tinggi',
            'Monitor customer response dan adjust accordingly'
          ],
          metrics: ['Profit margin: +18%', 'Average transaction: +12%', 'Premium sales: +25%']
        },
        {
          id: '5',
          category: 'growth',
          title: 'Ekspansi Online Delivery',
          description: 'Market research menunjukkan 40% customer tertarik dengan delivery service. Partnership dengan platform delivery bisa membuka revenue stream baru dengan investasi minimal.',
          impact: 'high',
          effort: 'medium',
          estimatedValue: 4200000,
          timeframe: '6 minggu',
          actionItems: [
            'Daftar di GofFood dan GrabFood sebagai pilot',
            'Buat packaging khusus untuk delivery',
            'Set menu delivery-friendly (tahan lama, tidak mudah rusak)',
            'Optimize untuk delivery radius 3-5km'
          ],
          metrics: ['New revenue stream: +35%', 'Customer reach: +60%', 'Brand awareness: +45%']
        }
      ]

      setInsights(mockInsights)
      setIsLoading(false)
    }, 2000)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return TrendingUp
      case 'marketing': return Users
      case 'operations': return Target
      case 'finance': return CheckCircle
      case 'growth': return Star
      default: return Lightbulb
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'text-green-600 bg-green-50'
      case 'marketing': return 'text-blue-600 bg-blue-50'
      case 'operations': return 'text-orange-600 bg-orange-50'
      case 'finance': return 'text-purple-600 bg-purple-50'
      case 'growth': return 'text-pink-600 bg-pink-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-700 bg-red-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'low': return 'text-green-700 bg-green-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-700 bg-green-100'
      case 'medium': return 'text-yellow-700 bg-yellow-100'
      case 'high': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/">Dashboard</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/ai">AI Assistant</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Business Insights</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto mb-4" />
            <div className="h-8 bg-gray-200 animate-pulse rounded w-64 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 animate-pulse rounded w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg" />
                      <Skeleton className="h-6 flex-1" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/ai">AI Assistant</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Business Insights</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} flex items-center justify-center gap-2`}>
              <Lightbulb className="h-8 w-8 text-yellow-600" />
              Business Insights
              <Badge variant="default" className="text-xs">NEW</Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Tips personal dari AI untuk mengembangkan bisnis Anda
            </p>
          </div>
          <Button 
            variant="outline" 
            className={isMobile ? 'w-full' : ''}
            onClick={loadInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Insights
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{insights.length}</div>
              <div className="text-sm text-gray-500">Total Insights</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {insights.filter(i => i.impact === 'high').length}
              </div>
              <div className="text-sm text-gray-500">High Impact</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(insights.reduce((sum, i) => sum + i.estimatedValue, 0))}
              </div>
              <div className="text-sm text-gray-500">Est. Value</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.effort === 'low').length}
              </div>
              <div className="text-sm text-gray-500">Quick Wins</div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight) => {
            const Icon = getCategoryIcon(insight.category)
            const categoryClasses = getCategoryColor(insight.category)
            
            return (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${categoryClasses} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{insight.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs capitalize mt-1">
                          {insight.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                      <Badge className={`text-xs ${getEffortColor(insight.effort)}`}>
                        {insight.effort.toUpperCase()} EFFORT
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {insight.description}
                  </p>
                  
                  {/* Value & Timeframe */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Estimated Value</div>
                      <div className="text-lg font-bold text-green-600">{formatCurrency(insight.estimatedValue)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600">Timeframe</div>
                      <div className="text-sm font-bold text-gray-900">{insight.timeframe}</div>
                    </div>
                  </div>
                  
                  {/* Action Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-600" />
                      Action Items
                    </h4>
                    <div className="space-y-2">
                      {insight.actionItems.slice(0, 3).map((action, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                          <span className="text-gray-700">{action}</span>
                        </div>
                      ))}
                      {insight.actionItems.length > 3 && (
                        <div className="text-xs text-gray-500 ml-3">
                          +{insight.actionItems.length - 3} more actions...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expected Metrics */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                      Expected Results
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.metrics.map((metric, index: number) => (
                        <span 
                          key={index} 
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <Button className="w-full" size="sm">
                    Implement Insight
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Card */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mt-0.5">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-yellow-900">
                  Insights Dipersonalisasi
                </h3>
                <p className="text-sm text-yellow-800">
                  Semua insights ini dihasilkan berdasarkan analisis data bisnis Anda yang real-time. 
                  AI mempertimbangkan performa historis, tren pasar, dan karakteristik UMKM F&B Indonesia 
                  untuk memberikan rekomendasi yang paling relevan dan actionable.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Data-Driven</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">UMKM Focused</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Actionable</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Indonesia Context</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

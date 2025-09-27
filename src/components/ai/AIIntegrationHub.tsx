'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAIPowered } from '@/hooks/useAIPowered'
import { useIngredients, useRecipesWithIngredients, useOrdersWithItems, useCustomers } from '@/hooks/useSupabaseData'
import {
  Brain,
  Calculator,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowRight,
  BarChart3,
  ShoppingCart,
  Clock,
  Target
} from 'lucide-react'

interface AIInsight {
  type: 'pricing' | 'inventory' | 'production' | 'customer' | 'financial' | 'forecast'
  title: string
  description: string
  confidence: number
  actionable: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  data?: any
}

export const AIIntegrationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Fetch data from Supabase
  const { data: ingredients } = useIngredients()
  const { data: recipes } = useRecipesWithIngredients() 
  const { data: orders } = useOrdersWithItems()
  const { customers } = useCustomers()

  // Mock financial records for demo
  const financialRecords = []

  // AI API calls
  const {
    analyzeData: analyzePricing,
    loading: pricingLoading,
    confidence: pricingConfidence
  } = useAIPowered()

  const {
    analyzeData: analyzeInventory,
    loading: inventoryLoading,
    confidence: inventoryConfidence
  } = useAIPowered()

  const {
    analyzeData: analyzeFinancial,
    loading: financialLoading,
    confidence: financialConfidence
  } = useAIPowered()

  // Run comprehensive AI analysis
  const runComprehensiveAnalysis = async () => {
    setIsAnalyzing(true)
    const newInsights: AIInsight[] = []

    try {
      // 1. Pricing Analysis
      if (recipes && recipes.length > 0) {
        const pricingData = await analyzePricing('/api/ai/pricing', {
          recipes,
          ingredients,
          market_conditions: 'stable',
          target_margin: 60
        })

        if (pricingData?.recommendations) {
          newInsights.push({
            type: 'pricing',
            title: 'Optimasi Harga Produk',
            description: pricingData.summary || 'Saran penyesuaian harga untuk meningkatkan profitabilitas',
            confidence: pricingConfidence,
            actionable: true,
            priority: pricingData.priority || 'medium',
            data: pricingData.recommendations
          })
        }
      }

      // 2. Inventory Analysis
      if (ingredients && ingredients.length > 0) {
        const inventoryData = await analyzeInventory('/api/ai/inventory', {
          ingredients,
          usage_history: 30,
          supplier_lead_times: true,
          seasonal_patterns: true
        })

        if (inventoryData?.alerts) {
          newInsights.push({
            type: 'inventory',
            title: 'Manajemen Stok Cerdas',
            description: inventoryData.summary || 'Optimasi stok dan prediksi kebutuhan bahan',
            confidence: inventoryConfidence,
            actionable: true,
            priority: inventoryData.urgent_count > 0 ? 'critical' : 'medium',
            data: inventoryData.alerts
          })
        }
      }

      // 3. Financial Analysis
      if (financialRecords && financialRecords.length > 0) {
        const financialData = await analyzeFinancial('/api/ai/financial', {
          records: financialRecords,
          period: '30d',
          include_forecasting: true,
          business_metrics: true
        })

        if (financialData?.insights) {
          newInsights.push({
            type: 'financial',
            title: 'Analisa Keuangan & Forecasting',
            description: financialData.summary || 'Insight keuangan dan prediksi bisnis',
            confidence: financialConfidence,
            actionable: true,
            priority: 'high',
            data: financialData.insights
          })
        }
      }

      // 4. Customer Analysis (if we have order data)
      if (orders && orders.length > 0) {
        const customerData = {
          total_customers: new Set(orders.map(o => o.customer_id)).size,
          repeat_customers: orders.filter(o => o.customer?.total_orders > 1).length,
          avg_order_value: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length,
          top_products: {}
        }

        newInsights.push({
          type: 'customer',
          title: 'Analisa Perilaku Pelanggan',
          description: `${customerData.total_customers} pelanggan aktif dengan AOV Rp${customerData.avg_order_value.toLocaleString('id-ID')}`,
          confidence: 85,
          actionable: true,
          priority: 'medium',
          data: customerData
        })
      }

      setInsights(newInsights)
    } catch (error) {
      console.error('AI Analysis Error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-run analysis on component mount and data changes
  useEffect(() => {
    if (ingredients && recipes && financialRecords && !isAnalyzing) {
      runComprehensiveAnalysis()
    }
  }, [ingredients, recipes, financialRecords])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pricing': return <Calculator className="h-4 w-4" />
      case 'inventory': return <Package className="h-4 w-4" />
      case 'production': return <Clock className="h-4 w-4" />
      case 'customer': return <Users className="h-4 w-4" />
      case 'financial': return <DollarSign className="h-4 w-4" />
      case 'forecast': return <TrendingUp className="h-4 w-4" />
      default: return <Brain className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getStatusIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (confidence >= 70) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Intelligence Hub</h1>
            <p className="text-gray-600">Insight bisnis cerdas berbasis AI untuk UMKM F&amp;B Indonesia</p>
          </div>
        </div>
        <Button 
          onClick={runComprehensiveAnalysis}
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menganalisa...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Jalankan Analisa AI</>
          )}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.priority === 'critical').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actionable Items</p>
                <p className="text-2xl font-bold text-green-600">
                  {insights.filter(i => i.actionable).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {insights.length > 0 ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {insights.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada insight AI</h3>
                    <p className="text-gray-600 mb-4">Klik tombol "Jalankan Analisa AI" untuk mendapatkan insight bisnis cerdas</p>
                    <Button 
                      onClick={runComprehensiveAnalysis}
                      disabled={isAnalyzing}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isAnalyzing ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menganalisa...</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" /> Jalankan Analisa AI</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(insight.priority) as any}>
                          {insight.priority.toUpperCase()}
                        </Badge>
                        {getStatusIcon(insight.confidence)}
                        <span className="text-sm text-gray-600">{insight.confidence}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    {insight.actionable && (
                      <Button variant="outline" size="sm" className="w-full">
                        Lihat Detail & Tindakan
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <PricingAIModule insights={insights.filter(i => i.type === 'pricing')} />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryAIModule insights={insights.filter(i => i.type === 'inventory')} />
        </TabsContent>

        <TabsContent value="production">
          <ProductionAIModule insights={insights.filter(i => i.type === 'production')} />
        </TabsContent>

        <TabsContent value="customer">
          <CustomerAIModule insights={insights.filter(i => i.type === 'customer')} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialAIModule insights={insights.filter(i => i.type === 'financial')} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Individual AI Module Components
const PricingAIModule: React.FC<{ insights: AIInsight[] }> = ({ insights }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Smart Pricing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Analisa AI untuk optimasi harga produk dengan mempertimbangkan HPP, margin target, dan kondisi pasar Indonesia.
        </p>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Alert key={index} className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada analisa pricing. Jalankan analisa AI untuk mendapatkan saran harga optimal.
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)

const InventoryAIModule: React.FC<{ insights: AIInsight[] }> = ({ insights }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Smart Inventory Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Prediksi kebutuhan stok, titik reorder optimal, dan deteksi pola penggunaan berbasis AI.
        </p>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Alert key={index} className="mb-4">
              <Package className="h-4 w-4" />
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada analisa inventory. Jalankan analisa AI untuk mendapatkan insight manajemen stok.
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)

const ProductionAIModule: React.FC<{ insights: AIInsight[] }> = ({ insights }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Production Planning AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Optimasi jadwal produksi, estimasi batch size, dan perencanaan resource berbasis AI.
        </p>
        <div className="text-center py-8 text-gray-500">
          Modul production AI akan segera hadir dengan fitur prediksi demand dan optimasi jadwal produksi.
        </div>
      </CardContent>
    </Card>
  </div>
)

const CustomerAIModule: React.FC<{ insights: AIInsight[] }> = ({ insights }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Customer Analytics AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Analisa perilaku pelanggan, segmentasi, dan prediksi churn berbasis AI.
        </p>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Alert key={index} className="mb-4">
              <Users className="h-4 w-4" />
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada data customer yang cukup untuk analisa AI. Tambahkan lebih banyak data order dan pelanggan.
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)

const FinancialAIModule: React.FC<{ insights: AIInsight[] }> = ({ insights }) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Financial Intelligence AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          Analisa keuangan mendalam, forecasting revenue, dan insight profitabilitas berbasis AI.
        </p>
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <Alert key={index} className="mb-4">
              <DollarSign className="h-4 w-4" />
              <AlertDescription>{insight.description}</AlertDescription>
            </Alert>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Belum ada analisa financial. Jalankan analisa AI untuk mendapatkan insight keuangan mendalam.
          </div>
        )}
      </CardContent>
    </Card>
  </div>
)

export default AIIntegrationHub
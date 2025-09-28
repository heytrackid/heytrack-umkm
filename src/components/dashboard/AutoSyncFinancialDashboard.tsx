'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sync,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  Zap,
  Info,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react'

interface SyncStatus {
  isEnabled: boolean
  lastSyncTime?: string
  totalSynced: number
  totalErrors: number
  syncHealth: 'healthy' | 'warning' | 'error'
}

interface SyncedTransaction {
  id: string
  transactionId: string
  type: string
  amount: number
  syncedAt: string
  source: string
  reference: string
}

interface SyncRecommendations {
  recommendations: string[]
  missingSync: number
  healthScore: number
}

interface CashflowSummary {
  totalExpenses: number
  totalIncome: number
  netCashflow: number
  expenseBreakdown: Record<string, number>
  recentTransactions: Array<{
    date: string
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    category: string
  }>
}

interface AutoSyncData {
  status: SyncStatus
  recentTransactions: SyncedTransaction[]
  recommendations: SyncRecommendations
  cashflow: CashflowSummary
}

export default function AutoSyncFinancialDashboard() {
  const [data, setData] = useState<AutoSyncData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAutoSyncData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/financial/auto-sync')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch auto-sync data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAutoSyncData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Sehat</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Perhatian</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const UMKMTooltip = ({ title, content, children }: { title: string, content: string, children: React.ReactNode }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            {children}
            <Info className="h-3 w-3 text-gray-400" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-80 p-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-xs text-gray-600">{content}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sync className="h-5 w-5 animate-spin" />
          <span>Loading sync status...</span>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to load auto-sync data'}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchAutoSyncData}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Auto-Sync Keuangan</h2>
          <p className="text-gray-600 text-sm">
            Sinkronisasi otomatis transaksi ke catatan keuangan
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchAutoSyncData}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <UMKMTooltip
                  title="Status Sinkronisasi"
                  content="Menunjukkan apakah sistem auto-sync sedang aktif dan berjalan dengan baik"
                >
                  <p className="text-sm font-medium text-gray-600">Status Sync</p>
                </UMKMTooltip>
                <div className="mt-2">
                  {getHealthBadge(data.status.syncHealth)}
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <UMKMTooltip
                  title="Total Tersinkronisasi"
                  content="Jumlah transaksi yang sudah otomatis masuk ke catatan keuangan dalam 30 hari terakhir"
                >
                  <p className="text-sm font-medium text-gray-600">Total Synced</p>
                </UMKMTooltip>
                <p className="text-2xl font-bold">{data.status.totalSynced}</p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <UMKMTooltip
                  title="Skor Kesehatan"
                  content="Indikator seberapa baik sistem auto-sync berjalan (0-100)"
                >
                  <p className="text-sm font-medium text-gray-600">Health Score</p>
                </UMKMTooltip>
                <div className="mt-2 space-y-2">
                  <p className="text-lg font-bold">{data.recommendations.healthScore}/100</p>
                  <Progress value={data.recommendations.healthScore} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <UMKMTooltip
                  title="Last Sync"
                  content="Waktu terakhir sistem melakukan sinkronisasi otomatis"
                >
                  <p className="text-sm font-medium text-gray-600">Last Sync</p>
                </UMKMTooltip>
                <p className="text-sm font-medium">
                  {data.status.lastSyncTime ? formatDate(data.status.lastSyncTime) : 'Belum ada'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {data.recommendations.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Rekomendasi Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.recommendations.map((rec, index) => (
                <Alert key={index} className={rec.includes('✅') ? 'border-green-200 bg-green-50' : ''}>
                  <AlertDescription className="flex items-center">
                    {rec.includes('✅') ? 
                      <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" /> :
                      <Info className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                    }
                    {rec}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cashflow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Ringkasan Cashflow (30 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-700">Pengeluaran</span>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-xl font-bold text-red-800">
                    {formatCurrency(data.cashflow.totalExpenses)}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Pemasukan</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xl font-bold text-green-800">
                    {formatCurrency(data.cashflow.totalIncome)}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Net Cashflow</span>
                <p className={`text-xl font-bold ${data.cashflow.netCashflow >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  {formatCurrency(data.cashflow.netCashflow)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Transaksi Auto-Sync Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentTransactions.slice(0, 5).map((tx, index) => (
                <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {tx.source === 'stock_transaction' ? '📦 Pembelian Bahan' : 
                       tx.source === 'operational_cost' ? '🏭 Biaya Operasional' :
                       tx.source === 'order_completion' ? '💰 Penjualan' : tx.source}
                    </p>
                    <p className="text-xs text-gray-600">{formatDate(tx.syncedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500">{tx.reference}</p>
                  </div>
                </div>
              ))}
              {data.recentTransactions.length === 0 && (
                <p className="text-center text-gray-500 py-4">Belum ada transaksi auto-sync</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button variant="outline" onClick={() => window.open('/finance', '_blank')}>
              <DollarSign className="h-4 w-4 mr-2" />
              Lihat Catatan Keuangan
            </Button>
            <Button variant="outline" onClick={() => window.open('/inventory', '_blank')}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Kelola Inventory
            </Button>
            {data.recommendations.missingSync > 0 && (
              <Button variant="secondary">
                <Sync className="h-4 w-4 mr-2" />
                Manual Sync ({data.recommendations.missingSync})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
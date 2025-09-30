'use client'

import React, { lazy, Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, RefreshCw, Eye, BarChart3, Plus, DollarSign } from 'lucide-react'

const SummaryCards = lazy(() => import('./SummaryCards'))
const RecentTransactions = lazy(() => import('./RecentTransactions'))

interface OverviewTabProps {
  cashFlowData: any
  selectedPeriod: string
  setSelectedPeriod: (value: string) => void
  setCurrentView: (view: string) => void
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

export default function OverviewTab({
  cashFlowData,
  selectedPeriod,
  setSelectedPeriod,
  setCurrentView,
  formatCurrency,
  isMobile = false
}: OverviewTabProps) {
  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'day': return 'Hari Ini'
      case 'week': return 'Minggu Ini'
      case 'month': return 'Bulan Ini'
      case 'year': return 'Tahun Ini'
      default: return 'Periode'
    }
  }

  const allTransactions = [
    ...cashFlowData.incomeTransactions,
    ...cashFlowData.expenseTransactions
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Laporan Arus Kas
          </h1>
          <p className="text-muted-foreground">
            Monitor pemasukan dan pengeluaran bisnis
          </p>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className={isMobile ? 'w-full' : 'w-40'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className={isMobile ? 'w-full' : ''}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className={isMobile ? 'w-full' : ''}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Suspense fallback={<div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-800 rounded" />}>
        <SummaryCards
          totalIncome={cashFlowData.totalIncome}
          totalExpenses={cashFlowData.totalExpenses}
          netFlow={cashFlowData.netFlow}
          formatCurrency={formatCurrency}
          getPeriodText={getPeriodText}
          isMobile={isMobile}
        />
      </Suspense>

      {/* Quick Actions */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => setCurrentView('detail')}
        >
          <Eye className="h-5 w-5" />
          <span>Lihat Detail Transaksi</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => setCurrentView('chart')}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Analisis Grafik</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => setCurrentView('add')}
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Transaksi</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-800 rounded" />}>
        <RecentTransactions
          transactions={allTransactions}
          formatCurrency={formatCurrency}
          onViewAll={() => setCurrentView('detail')}
        />
      </Suspense>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Tips: Kelola Arus Kas dengan Baik
              </h3>
              <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                <span>• Monitor harian untuk deteksi dini</span>
                <span>• Catat semua transaksi secara rutin</span>
                <span>• Analisis tren bulanan</span>
                <span>• Siapkan cadangan untuk operasional</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

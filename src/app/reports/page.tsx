'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useResponsive } from '@/hooks/use-mobile'
import { useFinancialAnalytics } from '@/hooks/useDatabase'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Download,
  Calendar,
  RefreshCw,
  Filter
} from 'lucide-react'

export default function FinancialReportsPage() {
  const { isMobile } = useResponsive()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Set default date range (current month)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])
  
  const { analytics: stats, loading, records } = useFinancialAnalytics(startDate, endDate)

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className={`${isMobile ? 'text-center' : ''}`}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Laporan Profit
            </h1>
            <p className="text-muted-foreground">
              Ringkasan performa keuangan dan analisis bisnis
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className={`${isMobile ? 'text-sm' : ''}`}>Memuat data laporan keuangan...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Laporan Profit
            </h1>
            <p className="text-muted-foreground">
              Ringkasan performa keuangan dan analisis bisnis
            </p>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
            <Button variant="outline" className={isMobile ? 'w-full' : ''} onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button className={isMobile ? 'w-full' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Filter Periode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
              <div>
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Tanggal Akhir</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Total Pemasukan
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Rp {stats.totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">bulan ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Total Pengeluaran
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-red-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Rp {stats.totalExpense.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">bulan ini</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Keuntungan Bersih
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-primary ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Rp {stats.netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Margin: {stats.profitMargin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Total Transaksi
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {stats.totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground">transaksi</p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
              <div className="space-y-4">
                <h3 className="font-medium">Ringkasan Bulanan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <span>Total Pemasukan</span>
                    <span className="font-medium text-green-600">
                      Rp {stats.totalIncome.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded">
                    <span>Total Pengeluaran</span>
                    <span className="font-medium text-red-600">
                      Rp {stats.totalExpense.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-primary/10 rounded">
                    <span>Keuntungan Bersih</span>
                    <span className="font-bold text-primary">
                      Rp {stats.netProfit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-medium">Analisis Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Margin Keuntungan</span>
                    <Badge variant={stats.profitMargin > 20 ? 'default' : 'destructive'}>
                      {stats.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Transaksi</span>
                    <span>{stats.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rata-rata per Transaksi</span>
                    <span>Rp {(stats.totalIncome / stats.totalTransactions).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Bisnis</span>
                    <Badge variant={stats.netProfit > 0 ? 'default' : 'destructive'}>
                      {stats.netProfit > 0 ? 'Profitable' : 'Loss'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {records.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                Belum ada data transaksi keuangan
              </h3>
              <p className="text-muted-foreground mb-4">
                Silakan tambahkan transaksi keuangan terlebih dahulu di halaman Finance
              </p>
              <Button onClick={() => window.location.href = '/finance'}>
                Ke Halaman Finance
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Category Breakdown */}
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
              <Card>
                <CardHeader>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>Breakdown Pemasukan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.categoryBreakdown)
                      .filter(([category]) => records.some(r => r.category === category && r.type === 'INCOME'))
                      .map(([category, amount]) => {
                        const incomeAmount = records
                          .filter(r => r.type === 'INCOME' && r.category === category)
                          .reduce((sum, r) => sum + r.amount, 0)
                        const percentage = stats.totalIncome > 0 ? (incomeAmount / stats.totalIncome * 100) : 0
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-sm'}`}>
                              <span>{category}</span>
                              <div className="text-right">
                                <div className="font-medium">Rp {incomeAmount.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    {Object.keys(stats.categoryBreakdown).filter(category => 
                      records.some(r => r.category === category && r.type === 'INCOME')
                    ).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Belum ada data pemasukan</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className={isMobile ? 'text-lg' : ''}>Breakdown Pengeluaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.categoryBreakdown)
                      .filter(([category]) => records.some(r => r.category === category && r.type === 'EXPENSE'))
                      .map(([category, amount]) => {
                        const expenseAmount = records
                          .filter(r => r.type === 'EXPENSE' && r.category === category)
                          .reduce((sum, r) => sum + r.amount, 0)
                        const percentage = stats.totalExpense > 0 ? (expenseAmount / stats.totalExpense * 100) : 0
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-sm'}`}>
                              <span>{category}</span>
                              <div className="text-right">
                                <div className="font-medium">Rp {expenseAmount.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    {Object.keys(stats.categoryBreakdown).filter(category => 
                      records.some(r => r.category === category && r.type === 'EXPENSE')
                    ).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Belum ada data pengeluaran</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className={isMobile ? 'text-lg' : ''}>Insight & Rekomendasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
              <div className="space-y-3">
                <h3 className="font-medium text-green-600">✅ Kekuatan</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Margin keuntungan {stats.profitMargin.toFixed(1)}% {stats.profitMargin > 20 ? 'sangat baik' : 'perlu ditingkatkan'}</li>
                  <li>• Total transaksi {stats.totalTransactions} menunjukkan aktivitas yang {stats.totalTransactions > 3 ? 'aktif' : 'perlu ditingkatkan'}</li>
                  <li>• Keuntungan bersih positif Rp {stats.netProfit.toLocaleString()}</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-amber-600">⚠️ Perlu Perhatian</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {stats.profitMargin < 20 ? 'Margin keuntungan masih bisa ditingkatkan' : 'Pertahankan margin keuntungan yang baik'}</li>
                  <li>• Monitor rasio pengeluaran vs pemasukan secara berkala</li>
                  <li>• Evaluasi efisiensi biaya operasional bulanan</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
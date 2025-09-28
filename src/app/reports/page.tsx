'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Download,
  Calendar
} from 'lucide-react'

// Sample transaction data
const sampleTransactions = [
  { id: '1', type: 'INCOME', category: 'Penjualan', amount: 2450000, date: '2024-01-25' },
  { id: '2', type: 'EXPENSE', category: 'Bahan Baku', amount: 600000, date: '2024-01-25' },
  { id: '3', type: 'INCOME', category: 'Penjualan', amount: 1850000, date: '2024-01-24' },
  { id: '4', type: 'EXPENSE', category: 'Operasional', amount: 300000, date: '2024-01-24' },
  { id: '5', type: 'EXPENSE', category: 'Gaji', amount: 2500000, date: '2024-01-23' },
]

const incomeCategories = ['Penjualan', 'Investasi', 'Lain-lain']
const expenseCategories = ['Bahan Baku', 'Gaji', 'Operasional', 'Equipment', 'Marketing', 'Transport']

export default function FinancialReportsPage() {
  const { isMobile } = useResponsive()

  // Calculate stats
  const totalIncome = sampleTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = sampleTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome * 100) : 0
  const totalTransactions = sampleTransactions.length

  const stats = {
    totalIncome,
    totalExpense,
    netProfit,
    profitMargin,
    totalTransactions
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
            <Button variant="outline" className={isMobile ? 'w-full' : ''}>
              <Calendar className="h-4 w-4 mr-2" />
              Filter Periode
            </Button>
            <Button className={isMobile ? 'w-full' : ''}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

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

        {/* Category Breakdown */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
          <Card>
            <CardHeader>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Breakdown Pemasukan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeCategories.map(category => {
                  const amount = sampleTransactions
                    .filter(t => t.type === 'INCOME' && t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
                  const percentage = totalIncome > 0 ? (amount / totalIncome * 100) : 0
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-sm'}`}>
                        <span>{category}</span>
                        <div className="text-right">
                          <div className="font-medium">Rp {amount.toLocaleString()}</div>
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className={isMobile ? 'text-lg' : ''}>Breakdown Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseCategories.slice(0, 4).map(category => {
                  const amount = sampleTransactions
                    .filter(t => t.type === 'EXPENSE' && t.category === category)
                    .reduce((sum, t) => sum + t.amount, 0)
                  const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className={`flex justify-between ${isMobile ? 'text-sm' : 'text-sm'}`}>
                        <span>{category}</span>
                        <div className="text-right">
                          <div className="font-medium">Rp {amount.toLocaleString()}</div>
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
              </div>
            </CardContent>
          </Card>
        </div>

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
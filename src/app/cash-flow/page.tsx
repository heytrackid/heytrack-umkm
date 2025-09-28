'use client'

import React, { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettings } from '@/contexts/settings-context'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Eye,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react'

export default function CashFlowPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency, t } = useSettings()
  const [selectedPeriod, setSelectedPeriod] = useState('month') // 'day', 'week', 'month', 'year'
  const [currentView, setCurrentView] = useState('overview') // 'overview', 'detail', 'chart'

  // Mock cash flow data - replace with actual data fetching
  const [cashFlowData] = useState({
    totalIncome: 15750000,
    totalExpenses: 8950000,
    netFlow: 6800000,
    incomeTransactions: [
      {
        id: 1,
        date: '2024-01-28',
        description: 'Penjualan Roti Tawar Premium',
        category: 'Penjualan Produk',
        amount: 450000,
        type: 'income'
      },
      {
        id: 2,
        date: '2024-01-28',
        description: 'Penjualan Kue Ulang Tahun',
        category: 'Penjualan Produk',
        amount: 750000,
        type: 'income'
      },
      {
        id: 3,
        date: '2024-01-27',
        description: 'Penjualan Cookies & Pastry',
        category: 'Penjualan Produk',
        amount: 325000,
        type: 'income'
      },
    ],
    expenseTransactions: [
      {
        id: 4,
        date: '2024-01-28',
        description: 'Pembelian Tepung & Gula',
        category: 'Bahan Baku',
        amount: -235000,
        type: 'expense'
      },
      {
        id: 5,
        date: '2024-01-27',
        description: 'Tagihan Listrik',
        category: 'Operasional',
        amount: -150000,
        type: 'expense'
      },
      {
        id: 6,
        date: '2024-01-26',
        description: 'Gaji Karyawan',
        category: 'SDM',
        amount: -800000,
        type: 'expense'
      },
    ]
  })

  const allTransactions = [
    ...cashFlowData.incomeTransactions,
    ...cashFlowData.expenseTransactions
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Laporan Arus Kas', href: currentView === 'overview' ? undefined : '/cash-flow' }
    ]
    
    if (currentView !== 'overview') {
      items.push({ 
        label: currentView === 'detail' ? 'Detail Transaksi' : 'Grafik Analisis' 
      })
    }
    
    return items
  }

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'day': return 'Hari Ini'
      case 'week': return 'Minggu Ini'
      case 'month': return 'Bulan Ini'
      case 'year': return 'Tahun Ini'
      default: return 'Periode'
    }
  }

  const OverviewTab = () => (
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
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className={`font-bold text-green-800 dark:text-green-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(cashFlowData.totalIncome)}
            </div>
            <p className="text-sm text-green-600 font-medium">Total Pemasukan</p>
            <p className="text-xs text-green-600 mt-1">{getPeriodText()}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className={`font-bold text-red-800 dark:text-red-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(cashFlowData.totalExpenses)}
            </div>
            <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
            <p className="text-xs text-red-600 mt-1">{getPeriodText()}</p>
          </CardContent>
        </Card>

        <Card className={`${cashFlowData.netFlow >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} dark:${cashFlowData.netFlow >= 0 ? 'bg-blue-900/20 border-blue-800' : 'bg-orange-900/20 border-orange-800'}`}>
          <CardContent className="p-6 text-center">
            <DollarSign className={`h-8 w-8 ${cashFlowData.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} mx-auto mb-2`} />
            <div className={`font-bold ${cashFlowData.netFlow >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'} ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(cashFlowData.netFlow)}
            </div>
            <p className={`text-sm ${cashFlowData.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} font-medium`}>
              Arus Kas Bersih
            </p>
            <Badge variant={cashFlowData.netFlow >= 0 ? 'default' : 'destructive'} className="mt-1">
              {cashFlowData.netFlow >= 0 ? 'Surplus' : 'Defisit'}
            </Badge>
          </CardContent>
        </Card>
      </div>

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
          onClick={() => window.location.href = '/operational-costs'}
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Pengeluaran</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaksi Terbaru</span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('detail')}>
              Lihat Semua
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

  const DetailTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Detail Transaksi</h2>
        <Button variant="outline" onClick={() => setCurrentView('overview')}>
          Kembali ke Overview
        </Button>
      </div>

      <div className="space-y-4">
        {allTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{transaction.category}</Badge>
                      <span>•</span>
                      <span>{transaction.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ChartTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Analisis Grafik</h2>
        <Button variant="outline" onClick={() => setCurrentView('overview')}>
          Kembali ke Overview
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Grafik akan tersedia segera</h3>
          <p className="text-muted-foreground">
            Fitur visualisasi data cash flow dengan chart interaktif sedang dalam pengembangan
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {currentView === 'overview' && <OverviewTab />}
        {currentView === 'detail' && <DetailTab />}
        {currentView === 'chart' && <ChartTab />}
      </div>
    </AppLayout>
  )
}
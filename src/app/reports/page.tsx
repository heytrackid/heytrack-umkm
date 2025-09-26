'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Download,
  Filter,
  Eye,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Printer,
  Mail
} from 'lucide-react'

// Sample data for reports
const salesData = {
  daily: [
    { date: '2024-01-20', revenue: 1200000, orders: 15, avgOrder: 80000 },
    { date: '2024-01-21', revenue: 1850000, orders: 22, avgOrder: 84090 },
    { date: '2024-01-22', revenue: 1650000, orders: 18, avgOrder: 91666 },
    { date: '2024-01-23', revenue: 2100000, orders: 28, avgOrder: 75000 },
    { date: '2024-01-24', revenue: 1900000, orders: 24, avgOrder: 79166 },
    { date: '2024-01-25', revenue: 2450000, orders: 30, avgOrder: 81666 },
    { date: '2024-01-26', revenue: 2200000, orders: 26, avgOrder: 84615 }
  ],
  topProducts: [
    { name: 'Croissant Original', sales: 1250, revenue: 6250000, percentage: 25.2 },
    { name: 'Roti Tawar Premium', sales: 980, revenue: 4900000, percentage: 19.8 },
    { name: 'Kue Ulang Tahun Custom', sales: 45, revenue: 4050000, percentage: 16.3 },
    { name: 'Danish Pastry Mix', sales: 560, revenue: 3360000, percentage: 13.6 },
    { name: 'Sourdough Artisan', sales: 380, revenue: 2850000, percentage: 11.5 },
    { name: 'Baguette French', sales: 420, revenue: 2100000, percentage: 8.5 },
    { name: 'Muffin Blueberry', sales: 680, revenue: 1360000, percentage: 5.1 }
  ],
  categories: [
    { name: 'Roti', sales: 2180, revenue: 13080000, percentage: 42.1 },
    { name: 'Kue', sales: 890, revenue: 8900000, percentage: 28.7 },
    { name: 'Pastry', sales: 1240, revenue: 6200000, percentage: 20.0 },
    { name: 'Custom Orders', sales: 85, revenue: 2890000, percentage: 9.2 }
  ]
}

const inventoryData = {
  lowStock: [
    { name: 'Tepung Terigu Premium', current: 15, minimum: 50, unit: 'kg', status: 'critical' },
    { name: 'Butter Unsalted', current: 8, minimum: 20, unit: 'kg', status: 'critical' },
    { name: 'Telur Ayam', current: 120, minimum: 200, unit: 'butir', status: 'warning' },
    { name: 'Gula Pasir', current: 18, minimum: 30, unit: 'kg', status: 'warning' },
    { name: 'Vanilla Extract', current: 2, minimum: 5, unit: 'botol', status: 'critical' }
  ],
  movements: [
    { date: '2024-01-25', item: 'Tepung Terigu Premium', type: 'OUT', quantity: 25, reason: 'Produksi harian' },
    { date: '2024-01-25', item: 'Butter Unsalted', type: 'OUT', quantity: 8, reason: 'Produksi croissant' },
    { date: '2024-01-24', item: 'Telur Ayam', type: 'IN', quantity: 300, reason: 'Pembelian rutin' },
    { date: '2024-01-24', item: 'Gula Pasir', type: 'OUT', quantity: 12, reason: 'Produksi kue' },
    { date: '2024-01-23', item: 'Vanilla Extract', type: 'OUT', quantity: 1, reason: 'Produksi muffin' }
  ],
  wastage: [
    { date: '2024-01-25', item: 'Roti Tawar', quantity: 8, value: 64000, reason: 'Kadaluarsa' },
    { date: '2024-01-24', item: 'Croissant', quantity: 12, value: 60000, reason: 'Overproduksi' },
    { date: '2024-01-23', item: 'Danish Pastry', quantity: 5, value: 30000, reason: 'Cacat produksi' },
    { date: '2024-01-22', item: 'Baguette', quantity: 6, value: 30000, reason: 'Kadaluarsa' }
  ]
}

const financialData = {
  monthly: {
    income: 24750000,
    expense: 18950000,
    profit: 5800000,
    margin: 23.4,
    growth: 12.8
  },
  expenses: [
    { category: 'Bahan Baku', amount: 9500000, percentage: 50.1 },
    { category: 'Gaji', amount: 4200000, percentage: 22.2 },
    { category: 'Operasional', amount: 2800000, percentage: 14.8 },
    { category: 'Equipment', amount: 1450000, percentage: 7.7 },
    { category: 'Marketing', amount: 650000, percentage: 3.4 },
    { category: 'Lainnya', return: 350000, percentage: 1.8 }
  ],
  cashFlow: [
    { date: '2024-01-20', inflow: 1200000, outflow: 850000, net: 350000 },
    { date: '2024-01-21', inflow: 1850000, outflow: 920000, net: 930000 },
    { date: '2024-01-22', inflow: 1650000, outflow: 780000, net: 870000 },
    { date: '2024-01-23', inflow: 2100000, outflow: 1200000, net: 900000 },
    { date: '2024-01-24', inflow: 1900000, outflow: 950000, net: 950000 },
    { date: '2024-01-25', inflow: 2450000, outflow: 1150000, net: 1300000 },
    { date: '2024-01-26', inflow: 2200000, outflow: 980000, net: 1220000 }
  ]
}

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState('sales')
  const [dateRange, setDateRange] = useState({ from: '2024-01-20', to: '2024-01-26' })
  const [reportType, setReportType] = useState('summary')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
      case 'good': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Laporan & Analitik</h1>
            <p className="text-muted-foreground">Analisa performa bisnis dengan laporan komprehensif</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="dateFrom">Periode Laporan:</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-40"
                />
                <span className="text-muted-foreground self-center">sampai</span>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-40"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Hari Ini</Button>
                <Button variant="outline" size="sm">Minggu Ini</Button>
                <Button variant="outline" size="sm">Bulan Ini</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Indicators */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                Rp {financialData.monthly.income.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{financialData.monthly.growth}% dari bulan lalu
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {salesData.daily.reduce((sum, day) => sum + day.orders, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Rata-rata: {Math.round(salesData.daily.reduce((sum, day) => sum + day.orders, 0) / salesData.daily.length)} per hari
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margin Keuntungan</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {financialData.monthly.margin}%
              </div>
              <p className="text-xs text-muted-foreground">
                Rp {financialData.monthly.profit.toLocaleString()} laba bersih
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item Stok Rendah</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {inventoryData.lowStock.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {inventoryData.lowStock.filter(i => i.status === 'critical').length} kritis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Laporan Penjualan</TabsTrigger>
            <TabsTrigger value="inventory">Laporan Inventory</TabsTrigger>
            <TabsTrigger value="financial">Laporan Keuangan</TabsTrigger>
          </TabsList>

          {/* Sales Reports */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tren Penjualan Harian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesData.daily.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">{day.date}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rp {day.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{day.orders} pesanan</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Produk Terlaris
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesData.topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.sales} terjual</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rp {product.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{product.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Penjualan per Kategori
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {salesData.categories.map((category, index) => (
                    <div key={category.name} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">{category.percentage}%</div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Rp {category.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.sales} item terjual
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Reports */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Stok Rendah & Kritis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventoryData.lowStock.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Min: {item.minimum} {item.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.current} {item.unit}</p>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status === 'critical' ? 'Kritis' : 'Peringatan'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Pergerakan Stok Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventoryData.movements.map((movement, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {movement.type === 'IN' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{movement.item}</p>
                            <p className="text-xs text-muted-foreground">{movement.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${movement.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                          </p>
                          <p className="text-xs text-muted-foreground">{movement.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Laporan Wastage & Kerugian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {inventoryData.wastage.map((waste, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{waste.item}</h4>
                        <Badge variant="outline" className="text-red-600">
                          {waste.quantity} item
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-red-600 mb-1">
                        Rp {waste.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{waste.reason}</p>
                      <p className="text-xs text-muted-foreground">{waste.date}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Kerugian Wastage:</span>
                    <span className="text-lg font-bold text-red-600">
                      Rp {inventoryData.wastage.reduce((sum, w) => sum + w.value, 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Dalam periode {dateRange.from} - {dateRange.to}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Reports */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Ringkasan Keuangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pemasukan:</span>
                      <span className="font-bold text-green-600">
                        Rp {financialData.monthly.income.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pengeluaran:</span>
                      <span className="font-bold text-red-600">
                        Rp {financialData.monthly.expense.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Keuntungan Bersih:</span>
                        <span className="font-bold text-primary">
                          Rp {financialData.monthly.profit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground">Margin:</span>
                        <span className="font-bold text-primary">
                          {financialData.monthly.margin}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Breakdown Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialData.expenses.map((expense, index) => (
                      <div key={expense.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary" style={{
                            backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                          }}></div>
                          <span className="text-sm">{expense.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            Rp {expense.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.percentage}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Cash Flow Harian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {financialData.cashFlow.slice(-5).map((day, index) => (
                      <div key={day.date} className="border-b pb-2 last:border-b-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{day.date}</span>
                          <span className={`font-bold ${day.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {day.net >= 0 ? '+' : ''}Rp {day.net.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Masuk: Rp {day.inflow.toLocaleString()}</span>
                          <span>Keluar: Rp {day.outflow.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Laporan Keuangan Detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-6 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">Revenue Growth</h3>
                    <p className="text-2xl font-bold text-green-600">+{financialData.monthly.growth}%</p>
                    <p className="text-sm text-muted-foreground">Vs bulan lalu</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">ROI Average</h3>
                    <p className="text-2xl font-bold text-blue-600">24.5%</p>
                    <p className="text-sm text-muted-foreground">Return on Investment</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg">
                    <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <h3 className="font-medium mb-1">Avg Order Value</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      Rp {Math.round(salesData.daily.reduce((sum, d) => sum + d.avgOrder, 0) / salesData.daily.length).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Per transaksi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Siap Pakai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Download className="h-5 w-5" />
                <span>Laporan Harian</span>
                <span className="text-xs text-muted-foreground">PDF</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analisa Penjualan</span>
                <span className="text-xs text-muted-foreground">Excel</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Package className="h-5 w-5" />
                <span>Stok & Inventory</span>
                <span className="text-xs text-muted-foreground">PDF</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <DollarSign className="h-5 w-5" />
                <span>Laporan Keuangan</span>
                <span className="text-xs text-muted-foreground">Excel</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
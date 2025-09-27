'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  ShoppingCart,
  Users,
  Package,
  Receipt,
  Eye,
  Download,
  PieChart,
  LineChart
} from 'lucide-react'

interface LaporanData {
  periode: string
  penjualan: {
    total: number
    transaksi: number
    rataPerTransaksi: number
    produkTerlaris: { nama: string, jumlah: number, pendapatan: number }[]
  }
  pengeluaran: {
    total: number
    kategoriBesar: string
    persentaseFromPenjualan: number
  }
  profit: {
    kotor: number
    bersih: number
    margin: number
  }
  pelanggan: {
    total: number
    baru: number
    returning: number
  }
}

export default function LaporanSimplePage() {
  const { toast } = useToast()
  
  const [selectedPeriod, setSelectedPeriod] = useState('7hari')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')

  // Data laporan simulasi
  const laporanData: LaporanData = {
    periode: selectedPeriod === '7hari' ? '7 Hari Terakhir' : 
             selectedPeriod === '30hari' ? '30 Hari Terakhir' : 
             selectedPeriod === 'bulan' ? 'Bulan Ini' : 'Periode Custom',
    penjualan: {
      total: 2450000,
      transaksi: 45,
      rataPerTransaksi: 54444,
      produkTerlaris: [
        { nama: 'Roti Sobek Coklat', jumlah: 15, pendapatan: 375000 },
        { nama: 'Cookies Vanilla', jumlah: 120, pendapatan: 240000 },
        { nama: 'Donat Gula', jumlah: 48, pendapatan: 240000 },
        { nama: 'Roti Tawar', jumlah: 8, pendapatan: 120000 },
        { nama: 'Croissant', jumlah: 25, pendapatan: 200000 }
      ]
    },
    pengeluaran: {
      total: 950000,
      kategoriBesar: 'Bahan Baku',
      persentaseFromPenjualan: 38.8
    },
    profit: {
      kotor: 1500000,
      bersih: 1500000 - 950000,
      margin: ((1500000 - 950000) / 2450000) * 100
    },
    pelanggan: {
      total: 28,
      baru: 8,
      returning: 20
    }
  }

  const downloadLaporan = () => {
    toast({ 
      title: 'Laporan berhasil diunduh!', 
      description: `Laporan ${laporanData.periode} telah disimpan`
    })
  }

  const getPeriodOptions = () => [
    { value: '7hari', label: '7 Hari Terakhir' },
    { value: '30hari', label: '30 Hari Terakhir' },
    { value: 'bulan', label: 'Bulan Ini' },
    { value: 'custom', label: 'Periode Custom' }
  ]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              Laporan Sederhana
            </h1>
            <p className="text-muted-foreground mt-1">
              Ringkasan keuangan dan performa bisnis Anda
            </p>
          </div>

          <Button onClick={downloadLaporan} className="gap-2">
            <Download className="h-4 w-4" />
            Unduh Laporan
          </Button>
        </div>

        {/* Period Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label>Periode:</Label>
              </div>
              
              <select 
                className="px-3 py-2 border border-input rounded-md bg-background"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {getPeriodOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {selectedPeriod === 'custom' && (
                <>
                  <Input
                    type="date"
                    placeholder="Dari"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                    className="w-auto"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    placeholder="Sampai"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                    className="w-auto"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Penjualan</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    Rp {laporanData.penjualan.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">+15.3%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    Rp {laporanData.pengeluaran.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{laporanData.pengeluaran.persentaseFromPenjualan.toFixed(1)}%</span>
                  </div>
                </div>
                <Receipt className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Bersih</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    Rp {laporanData.profit.bersih.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{laporanData.profit.margin.toFixed(1)}% margin</span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transaksi</p>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {laporanData.penjualan.transaksi}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ShoppingCart className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Rp {laporanData.penjualan.rataPerTransaksi.toLocaleString()}/avg
                    </span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Penjualan Detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Analisis Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                  <div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{laporanData.penjualan.transaksi}</p>
                    <p className="text-sm text-muted-foreground">Total Transaksi</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      Rp {(laporanData.penjualan.rataPerTransaksi / 1000).toFixed(0)}K
                    </p>
                    <p className="text-sm text-muted-foreground">Rata-rata/Transaksi</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {laporanData.penjualan.produkTerlaris.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Jenis Produk Terjual</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    Produk Terlaris:
                  </h4>
                  <div className="space-y-2">
                    {laporanData.penjualan.produkTerlaris.map((produk, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-medium">{produk.nama}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-600 dark:text-gray-400">
                            Rp {produk.pendapatan.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {produk.jumlah} terjual
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit & Expense Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Analisis Keuangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Profit Breakdown */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-medium mb-3">Breakdown Profit:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Pendapatan Kotor:</span>
                      <span className="font-semibold">Rp {laporanData.penjualan.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Pengeluaran:</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-400">- Rp {laporanData.pengeluaran.total.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium">Profit Bersih:</span>
                      <span className="font-bold text-gray-600 dark:text-gray-400">Rp {laporanData.profit.bersih.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Margin Profit:</span>
                      <span className="font-medium">{laporanData.profit.margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Expense Insight */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 dark:bg-red-950 rounded-lg">
                  <h4 className="font-medium mb-3">Insight Pengeluaran:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Kategori Terbesar:</span>
                      <span className="font-semibold">{laporanData.pengeluaran.kategoriBesar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>% dari Penjualan:</span>
                      <span className="font-semibold">{laporanData.pengeluaran.persentaseFromPenjualan.toFixed(1)}%</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      💡 Pengeluaran dalam batas wajar jika di bawah 40% dari penjualan
                    </div>
                  </div>
                </div>

                {/* Customer Insight */}
                <div className="p-4 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-medium mb-3">Insight Pelanggan:</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-600 dark:text-gray-400">{laporanData.pelanggan.total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-600 dark:text-gray-400">{laporanData.pelanggan.baru}</div>
                      <div className="text-xs text-muted-foreground">Baru</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-600 dark:text-gray-400">{laporanData.pelanggan.returning}</div>
                      <div className="text-xs text-muted-foreground">Returning</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    📈 {((laporanData.pelanggan.returning / laporanData.pelanggan.total) * 100).toFixed(0)}% pelanggan kembali lagi
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-600" />
              Indikator Kesehatan Bisnis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profit Margin Health */}
              <div className="text-center p-4 rounded-lg border">
                <div className="text-3xl mb-2">
                  {laporanData.profit.margin >= 25 ? '🟢' : 
                   laporanData.profit.margin >= 15 ? '🟡' : '🔴'}
                </div>
                <h3 className="font-semibold mb-1">Profit Margin</h3>
                <div className="text-2xl font-bold mb-1">{laporanData.profit.margin.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">
                  {laporanData.profit.margin >= 25 ? 'Sangat Baik' : 
                   laporanData.profit.margin >= 15 ? 'Baik' : 'Perlu Perhatian'}
                </p>
              </div>

              {/* Expense Ratio Health */}
              <div className="text-center p-4 rounded-lg border">
                <div className="text-3xl mb-2">
                  {laporanData.pengeluaran.persentaseFromPenjualan <= 30 ? '🟢' : 
                   laporanData.pengeluaran.persentaseFromPenjualan <= 40 ? '🟡' : '🔴'}
                </div>
                <h3 className="font-semibold mb-1">Rasio Pengeluaran</h3>
                <div className="text-2xl font-bold mb-1">{laporanData.pengeluaran.persentaseFromPenjualan.toFixed(1)}%</div>
                <p className="text-sm text-muted-foreground">
                  {laporanData.pengeluaran.persentaseFromPenjualan <= 30 ? 'Sangat Efisien' : 
                   laporanData.pengeluaran.persentaseFromPenjualan <= 40 ? 'Efisien' : 'Perlu Dikurangi'}
                </p>
              </div>

              {/* Customer Retention */}
              <div className="text-center p-4 rounded-lg border">
                <div className="text-3xl mb-2">
                  {(laporanData.pelanggan.returning / laporanData.pelanggan.total) >= 0.7 ? '🟢' : 
                   (laporanData.pelanggan.returning / laporanData.pelanggan.total) >= 0.5 ? '🟡' : '🔴'}
                </div>
                <h3 className="font-semibold mb-1">Customer Retention</h3>
                <div className="text-2xl font-bold mb-1">
                  {((laporanData.pelanggan.returning / laporanData.pelanggan.total) * 100).toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {(laporanData.pelanggan.returning / laporanData.pelanggan.total) >= 0.7 ? 'Excellent' : 
                   (laporanData.pelanggan.returning / laporanData.pelanggan.total) >= 0.5 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {laporanData.profit.margin < 20 && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-red-950 rounded-lg border-l-4 border-gray-300 dark:border-gray-600">
                    <p className="font-medium text-red-900 dark:text-red-100">Tingkatkan Margin Profit</p>
                    <p className="text-sm text-red-700 dark:text-red-200">
                      Cek ulang harga jual atau kurangi biaya operasional
                    </p>
                  </div>
                )}
                
                {laporanData.pengeluaran.persentaseFromPenjualan > 40 && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border-l-4 border-orange-500">
                    <p className="font-medium text-orange-900 dark:text-orange-100">Kontrol Pengeluaran</p>
                    <p className="text-sm text-orange-700 dark:text-orange-200">
                      Pengeluaran terlalu tinggi, optimasi kategori {laporanData.pengeluaran.kategoriBesar}
                    </p>
                  </div>
                )}

                {(laporanData.pelanggan.returning / laporanData.pelanggan.total) < 0.6 && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg border-l-4 border-gray-300 dark:border-gray-600">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Improve Customer Retention</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Buat program loyalty atau tingkatkan customer service
                    </p>
                  </div>
                )}

                {laporanData.profit.margin >= 20 && 
                 laporanData.pengeluaran.persentaseFromPenjualan <= 40 && 
                 (laporanData.pelanggan.returning / laporanData.pelanggan.total) >= 0.6 && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg border-l-4 border-gray-300 dark:border-gray-600">
                    <p className="font-medium text-green-900 dark:text-green-100">🎉 Bisnis Sehat!</p>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      Semua indikator baik. Pertahankan dan ekspansi jika memungkinkan
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Tips Optimasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                  <p className="font-medium text-blue-900 dark:text-blue-100">📊 Monitor Harian</p>
                  <p className="text-blue-700 dark:text-blue-200">
                    Cek laporan setiap hari untuk deteksi dini masalah keuangan
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                  <p className="font-medium text-green-900 dark:text-green-100">💰 Fokus Produk Laris</p>
                  <p className="text-green-700 dark:text-green-200">
                    Produk terlaris adalah {laporanData.penjualan.produkTerlaris[0]?.nama}, tingkatkan produksi
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-yellow-950 rounded-lg">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">🎯 Target Margin</p>
                  <p className="text-yellow-700 dark:text-yellow-200">
                    Target margin profit minimal 20% untuk bisnis bakery yang sehat
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-purple-950 rounded-lg">
                  <p className="font-medium text-purple-900 dark:text-purple-100">📈 Analisa Trend</p>
                  <p className="text-purple-700 dark:text-purple-200">
                    Bandingkan laporan minggu ini dengan minggu lalu untuk lihat trend
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
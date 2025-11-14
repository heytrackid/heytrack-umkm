'use client'

import { RevenueChart } from '@/components/analytics/RevenueChart'
import { TopProductsChart } from '@/components/analytics/TopProductsChart'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Calendar, PieChart, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function AnalyticsPage(): JSX.Element {
  const [revenuePeriod, setRevenuePeriod] = useState<number>(90)
  const [productsPeriod, setProductsPeriod] = useState<number>(30)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Analisis mendalam tentang performa bisnis Anda
        </p>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Pendapatan
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Produk
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Pelanggan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Analisis Pendapatan</h2>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={revenuePeriod.toString()}
                onValueChange={(value) => setRevenuePeriod(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Hari</SelectItem>
                  <SelectItem value="60">60 Hari</SelectItem>
                  <SelectItem value="90">90 Hari</SelectItem>
                  <SelectItem value="180">6 Bulan</SelectItem>
                  <SelectItem value="365">1 Tahun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <RevenueChart days={revenuePeriod} height={400} />

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Rata-rata Harian</h3>
              <p className="text-2xl font-bold text-foreground">Rp 0</p>
              <p className="text-xs text-muted-foreground">+0% dari periode sebelumnya</p>
            </Card>
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Hari Terbaik</h3>
              <p className="text-2xl font-bold text-foreground">Rp 0</p>
              <p className="text-xs text-muted-foreground">-</p>
            </Card>
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Pertumbuhan</h3>
              <p className="text-2xl font-bold text-foreground">0%</p>
              <p className="text-xs text-muted-foreground">Dibanding periode sebelumnya</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Analisis Produk</h2>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={productsPeriod.toString()}
                onValueChange={(value) => setProductsPeriod(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Hari</SelectItem>
                  <SelectItem value="30">30 Hari</SelectItem>
                  <SelectItem value="60">60 Hari</SelectItem>
                  <SelectItem value="90">90 Hari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TopProductsChart days={productsPeriod} limit={10} height={400} />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Kategori Terlaris</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Makanan Utama</span>
                  <span className="font-semibold text-foreground">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Minuman</span>
                  <span className="font-semibold text-foreground">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dessert</span>
                  <span className="font-semibold text-foreground">10%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Performa Produk</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Produk Aktif</span>
                  <span className="font-semibold text-foreground">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Produk Terjual</span>
                  <span className="font-semibold text-foreground">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-semibold text-foreground">0%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Analisis Pelanggan</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Total Pelanggan</h3>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">+0 bulan ini</p>
            </Card>
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Pelanggan Aktif</h3>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">30 hari terakhir</p>
            </Card>
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Rata-rata Order</h3>
              <p className="text-2xl font-bold text-foreground">Rp 0</p>
              <p className="text-xs text-muted-foreground">Per pelanggan</p>
            </Card>
            <Card className="p-4 bg-card border-border">
              <h3 className="font-semibold text-sm text-muted-foreground">Retention Rate</h3>
              <p className="text-2xl font-bold text-foreground">0%</p>
              <p className="text-xs text-muted-foreground">Pelanggan kembali</p>
            </Card>
          </div>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Segmentasi Pelanggan</h3>
            <div className="text-center py-12 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-3" />
              <p>Fitur segmentasi pelanggan akan tersedia segera</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

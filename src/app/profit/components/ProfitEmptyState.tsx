'use client'

import { TrendingUp, ShoppingCart, Package, Receipt, Lightbulb, Zap } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const ProfitEmptyState = () => {
  const router = useRouter()

  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="flex flex-col items-center justify-center text-center py-16 px-4">
        {/* Main Icon */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center mb-6 shadow-lg">
          <TrendingUp className="w-16 h-16 text-muted-foreground opacity-60" />
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
          Belum Ada Data Keuntungan
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-8 max-w-lg leading-relaxed text-lg">
          Analisis laba riil akan muncul setelah Anda memiliki data pesanan, bahan baku, dan biaya operasional. 
          Mulai sekarang untuk melihat profitabilitas bisnis Anda!
        </p>

        {/* Primary Actions */}
        <div className="grid md:grid-cols-3 gap-3 mb-8 w-full max-w-2xl">
          <Button 
            size="lg" 
            className="h-14 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push('/orders/new')}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Buat Pesanan Pertama
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 border-2 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push('/ingredients')}
          >
            <Package className="w-5 h-5 mr-2" />
            Tambah Bahan Baku
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="h-14 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => router.push('/operational-costs')}
          >
            <Receipt className="w-5 h-5 mr-2" />
            Setup Biaya Op.
          </Button>
        </div>

        {/* Tips Section */}
        <div className="w-full max-w-md space-y-3 mb-8 pt-8 border-t border-border/50">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
            <span className="text-2xl flex-shrink-0 mt-0.5">💡</span>
            <div>
              <p className="font-semibold text-foreground mb-1">Pesanan = Revenue</p>
              <p className="text-sm text-muted-foreground">Setiap pesanan terjual menghasilkan data revenue & profit otomatis</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
            <span className="text-2xl flex-shrink-0 mt-0.5">📊</span>
            <div>
              <p className="font-semibold text-foreground mb-1">HPP dari Bahan + OpCost</p>
              <p className="text-sm text-muted-foreground">WAC otomatis dari pembelian bahan & biaya operasional</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
            <span className="text-2xl flex-shrink-0 mt-0.5">🔔</span>
            <div>
              <p className="font-semibold text-foreground mb-1">Update Harian</p>
              <p className="text-sm text-muted-foreground">Data real-time, analisis akurat setiap hari</p>
            </div>
          </div>
        </div>

        {/* Quick Tip Highlight */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl border border-blue-200/50 shadow-xl max-w-2xl w-full">
          <div className="flex items-start gap-4">
            <Lightbulb className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-xl text-foreground mb-2">Formula Laba Bersih</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                <strong>Laba Bersih = Revenue - HPP (WAC) - Biaya Operasional</strong>
                <br />
                <span className="text-sm mt-2 block">Contoh: Rp10jt revenue - Rp6jt HPP - Rp2jt opcost = <strong>Rp2jt profit (20% margin)</strong></span>
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
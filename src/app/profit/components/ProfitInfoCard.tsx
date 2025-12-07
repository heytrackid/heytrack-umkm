import { AlertCircle } from '@/components/icons'

import { Card, CardContent } from '@/components/ui/card'

/**
 * Profit Info Card Component
 * Information about WAC methodology
 */


export const ProfitInfoCard = () => (
    <Card className="border-border/20 bg-muted ">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-foreground">
              Tentang Metode WAC (Weighted Average Cost)
            </p>
            <p className="text-foreground dark:text-gray-200">
              Laporan ini menggunakan metode WAC untuk menghitung Harga Pokok Penjualan (HPP).
              WAC menghitung rata-rata tertimbang dari semua pembelian bahan baku, memberikan
              gambaran biaya produksi yang akurat menggunakan metode WAC.
            </p>
            <p className="text-foreground dark:text-gray-200">
              <strong>Formula:</strong> Laba Bersih = Pendapatan - HPP (WAC) - Biaya Operasional
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

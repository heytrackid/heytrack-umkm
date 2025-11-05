import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

/**
 * Profit Info Card Component
 * Information about WAC methodology
 */


export const ProfitInfoCard = () => (
    <Card className="border-gray-300 bg-gray-50 dark:bg-gray-950 dark:border-gray-800">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Tentang Metode WAC (Weighted Average Cost)
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              Laporan ini menggunakan metode WAC untuk menghitung Harga Pokok Penjualan (HPP).
              WAC menghitung rata-rata tertimbang dari semua pembelian bahan baku, memberikan
              gambaran biaya produksi yang lebih akurat dibanding FIFO atau LIFO.
            </p>
            <p className="text-gray-800 dark:text-gray-200">
              <strong>Formula:</strong> Laba Bersih = Pendapatan - HPP (WAC) - Biaya Operasional
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

/**
 * Profit Info Card Component
 * Information about WAC methodology
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export function ProfitInfoCard() {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              Tentang Metode WAC (Weighted Average Cost)
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              Laporan ini menggunakan metode WAC untuk menghitung Harga Pokok Penjualan (HPP).
              WAC menghitung rata-rata tertimbang dari semua pembelian bahan baku, memberikan
              gambaran biaya produksi yang lebih akurat dibanding FIFO atau LIFO.
            </p>
            <p className="text-blue-800 dark:text-blue-200">
              <strong>Formula:</strong> Laba Bersih = Pendapatan - HPP (WAC) - Biaya Operasional
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

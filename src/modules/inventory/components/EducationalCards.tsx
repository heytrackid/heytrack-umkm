'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Target, BookOpen } from 'lucide-react'

/**
 * Educational cards component for UMKM users
 * Provides helpful information about inventory management concepts
 */
export function EducationalCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Target className="h-5 w-5" />
            Manfaat Harga Rata-rata untuk UMKM
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 text-sm space-y-2">
          <p>✅ <strong>HPP lebih akurat:</strong> Tidak pakai harga lama yang bisa bikin rugi</p>
          <p>✅ <strong>Profit stabil:</strong> Harga jual berdasarkan cost yang real</p>
          <p>✅ <strong>Planning lebih baik:</strong> Tahu trend harga bahan naik/turun</p>
          <p>✅ <strong>Laporan lebih rapi:</strong> Nilai inventory yang tepat</p>
        </CardContent>
      </Card>

      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <BookOpen className="h-5 w-5" />
            Kapan Perlu Review Harga?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-700 text-sm space-y-2">
          <p>🔄 <strong>Setiap kali beli bahan:</strong> Harga berubah dari pembelian sebelumnya</p>
          <p>📈 <strong>Harga naik &gt;10%:</strong> Perlu update price list dan harga jual</p>
          <p>⚠️ <strong>Stock tinggal sedikit:</strong> Pastikan harga untuk pembelian berikutnya</p>
          <p>📊 <strong>Sebelum bikin HPP:</strong> Gunakan harga rata-rata terbaru</p>
        </CardContent>
      </Card>
    </div>
  )
}

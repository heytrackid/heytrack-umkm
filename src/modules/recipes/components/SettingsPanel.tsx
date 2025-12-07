'use client'

import { Calculator, Package } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings } from '@/contexts/settings-context'

import { UMKMTooltip } from '@/modules/recipes/components/UMKMTooltip'






// WAC method info - constant for display (exported for potential future use)
export const WAC_METHOD_INFO = {
  name: 'WAC (Weighted Average Cost)',
  description: 'Metode perhitungan biaya bahan baku yang paling akurat untuk bisnis kuliner',
  icon: '📦',
  pros: 'Akurat, sesuai standar akuntansi, otomatis update',
  cons: 'Tidak ada - ini metode terbaik'
}

interface SettingsPanelProps {
  profitMarginPercent: number
  includeOperationalCosts: boolean
  onProfitMarginChange: (margin: number) => void
  onIncludeOperationalCostsChange: (include: boolean) => void
}

/**
 * Settings panel component for HPP calculation parameters
 */
export const SettingsPanel = ({
  profitMarginPercent,
  includeOperationalCosts,
  onProfitMarginChange,
  onIncludeOperationalCostsChange
}: SettingsPanelProps) => {
  const { formatCurrency } = useSettings()

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pengaturan Perhitungan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pricing Method Info - WAC Only */}
          <div>
            <Label className="text-sm font-medium">Metode Perhitungan Harga</Label>
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span>📦</span>
                <span className="font-medium text-green-800">WAC (Weighted Average Cost)</span>
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Aktif</Badge>
              </div>
              <p className="text-green-700 mb-2">Metode perhitungan biaya bahan baku yang paling akurat dan sesuai standar akuntansi</p>
              <div className="grid grid-cols-1 gap-1">
                <p className="text-green-700">✅ Akurat untuk bisnis kuliner</p>
                <p className="text-green-700">✅ Otomatis update dengan pembelian baru</p>
                <p className="text-green-700">✅ Sesuai standar akuntansi</p>
              </div>
            </div>
          </div>

          {/* Profit Margin */}
          <div>
            <UMKMTooltip
              title="Target Keuntungan"
              content={`Berapa persen keuntungan yang Anda inginkan? 30% artinya jika HPP ${formatCurrency(10000)}, harga jual jadi ${formatCurrency(13000)}`}
            >
              <Label className="text-sm font-medium">Target Keuntungan (%)</Label>
            </UMKMTooltip>
            <Input
              type="number"
              value={profitMarginPercent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onProfitMarginChange(Number(e.target.value))}
              className="mt-2"

            />
            <p className="text-xs text-muted mt-1">
              Rekomendasi: 25-40% untuk produk UMKM
            </p>
          </div>

          {/* Include Operational Costs */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeOperationalCosts}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onIncludeOperationalCostsChange(e.target.checked)}
              className="rounded"
            />
            <UMKMTooltip
              title="Biaya Operasional"
              content="Termasuk biaya listrik, gaji, sewa tempat, dll. Penting untuk HPP yang lengkap!"
            >
              <Label className="text-sm">Sertakan Biaya Operasional</Label>
            </UMKMTooltip>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Info Resep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <h3 className="font-semibold">Pilih resep untuk kalkulasi</h3>
            <p className="text-sm text-muted-foreground">Hasil: - porsi</p>
            <div className="space-y-1">
              <p className="text-xs font-medium">Bahan-bahan:</p>
              <p className="text-xs text-muted italic">Tidak ada resep yang dipilih</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



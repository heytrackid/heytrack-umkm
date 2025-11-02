import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calculator, Package } from 'lucide-react'
import type { PricingMethod } from '@/modules/recipes/types'
import { UMKMTooltip } from './UMKMTooltip'
import { useSettings } from '@/contexts/settings-context'

'use client'




// Method descriptions for UMKM
const getPricingMethodDescription = (method: PricingMethod) => {
  const descriptions = {
    'list_price': {
      name: 'Harga List Tetap',
      description: 'Pakai harga yang sudah ditulis di daftar, tidak berubah',
      icon: '📋',
      pros: 'Gampang, tidak ribet',
      cons: 'Bisa kurang akurat jika harga bahan sudah beda'
    },
    'weighted': {
      name: 'Rata-rata Tertimbang',
      description: 'Hitung rata-rata dari semua pembelian, yang banyak lebih berpengaruh',
      icon: '⚖️',
      pros: 'Akurat untuk pembelian besar',
      cons: 'Agak susah dipahami'
    },
    'fifo': {
      name: 'FIFO (Masuk Pertama Keluar Pertama)',
      description: 'Bahan yang dibeli duluan dipakai duluan, seperti di warung',
      icon: '📦',
      pros: 'Sesuai cara kerja gudang',
      cons: 'Ribet track bahan mana yang duluan'
    },
    'moving': {
      name: 'Rata-rata Bergerak',
      description: 'Harga rata-rata yang selalu update setiap beli bahan baru',
      icon: '📈',
      pros: 'Paling akurat untuk HPP, otomatis update',
      cons: 'Perlu sistem yang bagus'
    },
    'latest': {
      name: 'Harga Terakhir',
      description: 'Pakai harga dari pembelian paling baru',
      icon: '🆕',
      pros: 'Sederhana, harga terkini',
      cons: 'Bisa fluktuatif, tidak stabil'
    }
  }
  return descriptions[method] || descriptions['list_price']
}

interface SettingsPanelProps {
  selectedPricingMethod: PricingMethod
  profitMarginPercent: number
  includeOperationalCosts: boolean
  onPricingMethodChange: (method: PricingMethod) => void
  onProfitMarginChange: (margin: number) => void
  onIncludeOperationalCostsChange: (include: boolean) => void
}

/**
 * Settings panel component for HPP calculation parameters
 */
export const SettingsPanel = ({
  selectedPricingMethod,
  profitMarginPercent,
  includeOperationalCosts,
  onPricingMethodChange,
  onProfitMarginChange,
  onIncludeOperationalCostsChange
}: SettingsPanelProps) => {
  const methodInfo = getPricingMethodDescription(selectedPricingMethod)
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
          {/* Pricing Method Selection */}
          <div>
            <UMKMTooltip
              title="Metode Harga Bahan"
              content="Cara sistem menghitung harga bahan baku. Pilih 'Rata-rata Bergerak' untuk hasil paling akurat!"
            >
              <Label className="text-sm font-medium">Metode Harga Bahan</Label>
            </UMKMTooltip>
            <Select value={selectedPricingMethod} onValueChange={onPricingMethodChange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['list_price', 'weighted', 'fifo', 'moving', 'latest'] as PricingMethod[]).map(method => {
                  const methodDesc = getPricingMethodDescription(method)
                  return (
                    <SelectItem key={method} value={method}>
                      <div className="flex items-center gap-2">
                        <span>{methodDesc.icon}</span>
                        <span>{methodDesc.name}</span>
                        {method === 'moving' && <Badge variant="secondary" className="text-xs">Rekomendasi</Badge>}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Method explanation */}
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs">
              <div className="flex items-center gap-2 mb-1">
                <span>{methodInfo.icon}</span>
                <span className="font-medium">{methodInfo.name}</span>
              </div>
              <p className="text-gray-600 mb-2">{methodInfo.description}</p>
              <div className="grid grid-cols-1 gap-1">
                <p className="text-green-600">✅ {methodInfo.pros}</p>
                <p className="text-orange-600">⚠️ {methodInfo.cons}</p>
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
              onChange={(e) => onProfitMarginChange(Number(e.target.value))}
              className="mt-2"

            />
            <p className="text-xs text-gray-500 mt-1">
              Rekomendasi: 25-40% untuk produk UMKM
            </p>
          </div>

          {/* Include Operational Costs */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeOperationalCosts}
              onChange={(e) => onIncludeOperationalCostsChange(e.target.checked)}
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
            <p className="text-sm text-gray-600">Hasil: - porsi</p>
            <div className="space-y-1">
              <p className="text-xs font-medium">Bahan-bahan:</p>
              <p className="text-xs text-gray-500 italic">Tidak ada resep yang dipilih</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

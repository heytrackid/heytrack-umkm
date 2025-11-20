'use client'
 

import { Info, BarChart3, TrendingUp, CheckCircle, AlertTriangle, Lightbulb, ArrowRight, TrendingDown } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCurrency } from '@/hooks/useCurrency'





interface ComparisonItem {
  id: string
  name: string
  hppValue: number
  sellingPrice: number
  marginPercentage: number
}

interface ProductComparisonCardProps {
  comparison: ComparisonItem[]
}

export const ProductComparisonCard = ({ comparison }: ProductComparisonCardProps) => {
  const { formatCurrency } = useCurrency()
  const router = useRouter()



  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📈 Langkah 4: Bandingkan dengan Produk Lain
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold mb-1">Kenapa Perlu Bandingkan?</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    <li>Lihat produk mana yang paling untung</li>
                    <li>Fokus produksi ke produk terbaik</li>
                    <li>Identifikasi produk yang perlu perbaikan</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Lihat performa produk Anda dibanding yang lain
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/hpp/comparison')}
          >
            Lihat Detail
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {comparison.length > 0 ? (
            <>
              {comparison.slice(0, 5).map((item, index) => {
                const marginPct = item.marginPercentage || 0
                const isGood = marginPct >= 50
                const isWarning = marginPct >= 30 && marginPct < 50
                const profit = item.sellingPrice - item.hppValue

                return (
                  <div
                    key={item['id']}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover: ${
                      isGood
                        ? 'bg-muted/20 border-border/20 '
                        : (isWarning
                          ? 'bg-accent/10 dark:bg-accent/20 border-accent/30'
                          : 'bg-destructive/10 dark:bg-destructive/20 border-destructive/30')
                      }`}
                  >
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      index === 0
                        ? 'bg-primary text-primary-foreground'
                        : (index === 1
                          ? 'bg-secondary text-secondary-foreground'
                          : (index === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'))
                      }`}>
                      {index + 1}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-base mb-1">{item.name}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Modal: {formatCurrency(item.hppValue)}</span>
                        <span>→</span>
                        <span>Jual: {formatCurrency(item.sellingPrice)}</span>
                        <span className="text-muted-foreground font-medium">
                          Untung: {formatCurrency(profit)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge className={`${isGood ? 'bg-primary' : (isWarning ? 'bg-primary' : 'bg-red-600')} gap-1`}>
                        {isGood ? (
                          <>
                            <TrendingUp className="h-3 w-3" />
                            Untung Besar
                          </>
                        ) : isWarning ? (
                          <>
                            <Info className="h-3 w-3" />
                            Untung Kecil
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3" />
                            Perlu Perbaikan
                          </>
                        )}
                      </Badge>
                      <span className="text-sm font-semibold">
                        Margin: {marginPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}

              {comparison.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/hpp/comparison')}
                >
                  Lihat {comparison.length - 5} Produk Lainnya
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted" />
              <h4 className="text-lg font-semibold mb-2">Belum Ada Data Perbandingan</h4>
              <p className="text-sm text-muted-foreground mb-6">
                Hitung HPP produk lain untuk melihat perbandingan dan analisis
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/recipes')}
              >
                Kelola Produk
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Recommendations */}
        {comparison.length > 0 && (
          <div className="bg-gradient-to-r from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 p-5 rounded-lg border-2 border-border/20 ">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base mb-3">💡 Rekomendasi Aksi:</h4>
                <ul className="space-y-2.5 text-sm">
                  {comparison[0] && comparison[0].marginPercentage >= 50 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>{comparison[0].name}</strong>: Produk terbaik! Pertahankan kualitas dan pertimbangkan tingkatkan produksi.
                      </span>
                    </li>
                  )}
                  {comparison.find((c) => c.marginPercentage < 30) && (
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>{comparison.find((c) => c.marginPercentage < 30)?.name}</strong>: Margin rendah. Pertimbangkan naikkan harga atau cari supplier bahan lebih murah.
                      </span>
                    </li>
                  )}
                  {comparison.length >= 3 && (
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>
                        Fokuskan produksi pada 3 produk teratas untuk maksimalkan keuntungan.
                      </span>
                    </li>
                  )}
                  {comparison.length < 3 && (
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>
                        Tambahkan lebih banyak produk untuk mendapat analisis perbandingan yang lebih lengkap.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/hpp/comparison')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analisis Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

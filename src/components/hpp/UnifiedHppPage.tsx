'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useUnifiedHpp } from '@/hooks/useUnifiedHpp'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'

export const UnifiedHppPage = memo(() => {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const {
    recipes,
    overview,
    recipe,
    comparison,
    alerts,
    isLoading,
    recipeLoading,
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,
    updatePrice,
    markAlertAsRead
  } = useUnifiedHpp()

  const [marginPercentage, setMarginPercentage] = useState(60)
  const [suggestedPrice, setSuggestedPrice] = useState(0)

  // Auto-calculate when recipe or margin changes
  useEffect(() => {
    if (recipe) {
      const price = recipe.total_cost * (1 + marginPercentage / 100)
      setSuggestedPrice(Math.round(price / 100) * 100) // Round to nearest 100
    }
  }, [recipe, marginPercentage])

  // Set initial margin from recipe data (only when recipe ID changes)
  useEffect(() => {
    if (recipe?.margin_percentage && recipe.id) {
      void setMarginPercentage(recipe.margin_percentage)
    }
  }, [recipe?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRecipeSelect = useCallback((recipeId: string) => {
    if (recipeId === 'new') {
      // TODO: Navigate to create new recipe page
      return
    }
    void setSelectedRecipeId(recipeId)
  }, [setSelectedRecipeId])

  const handleSavePrice = useCallback(() => {
    if (!recipe) { return }

    updatePrice.mutate({
      recipeId: recipe.id,
      price: suggestedPrice,
      margin: marginPercentage
    })
  }, [recipe, suggestedPrice, marginPercentage, updatePrice])

  const handleMarkAlertAsRead = useCallback((alertId: string) => {
    markAlertAsRead.mutate(alertId)
  }, [markAlertAsRead])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Quick Summary */}
        {overview && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">📊 Ringkasan Cepat</CardTitle>
              {overview.recipesWithHpp < overview.totalRecipes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/hpp/calculate', {
                        method: 'PUT'
                      })
                      if (response.ok) {
                        toast({
                          title: 'Berhasil ✓',
                          description: 'Semua biaya produksi berhasil dihitung'
                        })
                        // Refresh data
                        window.location.reload()
                      }
                    } catch (err) {
                      toast({
                        title: 'Error',
                        description: 'Gagal menghitung biaya',
                        variant: 'destructive'
                      })
                    }
                  }}
                >
                  🔄 Hitung Semua Biaya
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {overview.recipesWithHpp}/{overview.totalRecipes}
                  </div>
                  <div className="text-sm text-muted-foreground">Sudah Dihitung</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(overview.averageHpp)}
                  </div>
                  <div className="text-sm text-muted-foreground">Biaya Rata-rata</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {overview.unreadAlerts}
                  </div>
                  <div className="text-sm text-muted-foreground">Peringatan Baru</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {overview.recipesWithHpp > 0
                      ? Math.round((overview.recipesWithHpp / overview.totalRecipes) * 100)
                      : 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Select Product */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Langkah 1: Pilih Produk
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pilih produk yang mau dihitung biaya dan harga jualnya</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRecipeId} onValueChange={handleRecipeSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih produk yang mau dihitung..." />
              </SelectTrigger>
              <SelectContent>
                {recipes.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Buat Produk Baru</SelectItem>
              </SelectContent>
            </Select>

            {recipeLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State - No Recipe Selected */}
        {!selectedRecipeId && !recipeLoading && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16">
              <div className="text-center">
                <Calculator className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Yuk Mulai Hitung Biaya & Harga Jual!</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Pilih produk di atas untuk menghitung berapa modal yang dibutuhkan dan berapa harga jual yang pas
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-md mx-auto">
                  <p className="text-sm font-medium mb-2">💡 Yang Akan Anda Dapatkan:</p>
                  <ul className="text-xs text-left space-y-1">
                    <li>✓ Hitung modal buat 1 porsi secara otomatis</li>
                    <li>✓ Saran harga jual yang menguntungkan</li>
                    <li>✓ Bandingkan dengan produk lain</li>
                    <li>✓ Peringatan jika harga bahan naik</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Calculate Cost */}
        {recipe && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧮 Langkah 2: Hitung Berapa Modal Buat 1 Porsi
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold mb-1">HPP = Harga Pokok Produksi</p>
                    <p>Artinya: Total uang yang keluar untuk buat 1 porsi</p>
                    <p className="text-xs mt-2">Termasuk:</p>
                    <ul className="text-xs list-disc list-inside">
                      <li>Bahan-bahan (tepung, gula, dll)</li>
                      <li>Gas/listrik untuk masak</li>
                      <li>Kemasan</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">Contoh: Brownies = Rp 26.000</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ingredients */}
              <div>
                <h4 className="font-semibold mb-2">🛒 Bahan-bahan yang Dibutuhkan:</h4>
                <div className="space-y-2">
                  {recipe.ingredients.length > 0 ? (
                    <>
                      {recipe.ingredients.map((ingredient: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            • {ingredient.name} {ingredient.quantity} {ingredient.unit}
                            {ingredient.unit_price === 0 && (
                              <span className="ml-2 text-xs text-red-600">⚠️ Belum ada harga</span>
                            )}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(ingredient.quantity * ingredient.unit_price)}
                          </span>
                        </div>
                      ))}

                      {/* Warning jika ada bahan tanpa harga */}
                      {recipe.ingredients.some((i: any) => i.unit_price === 0) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Perhatian: Ada bahan yang belum ada harganya
                              </p>
                              <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                                Biaya produksi belum bisa dihitung akurat karena ada bahan yang belum diisi harganya.
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open('/ingredients', '_blank')}
                                className="text-xs"
                              >
                                Update Harga Bahan →
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Belum ada bahan. Tambahkan bahan terlebih dahulu di halaman Resep.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Operational Costs */}
              <div>
                <h4 className="font-semibold mb-2">⚡ Biaya Lain-lain:</h4>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    • Gas, Listrik, Kemasan, dll
                    <span className="text-xs ml-1">(otomatis 15% dari bahan)</span>
                  </span>
                  <span className="font-medium">{formatCurrency(recipe.operational_costs)}</span>
                </div>
              </div>

              {/* Total Cost */}
              <div className="pt-4 border-t bg-blue-50 dark:bg-blue-900/20 -mx-6 px-6 py-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-semibold">💰 Total Modal Buat 1 Porsi:</span>
                    <p className="text-xs text-muted-foreground mt-1">Ini yang harus Anda keluarkan</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(recipe.total_cost)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recipe && calculateHpp.mutate(recipe.id)}
                  disabled={calculateHpp.isPending}
                >
                  {calculateHpp.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menghitung...
                    </>
                  ) : (
                    '🔄 Hitung Ulang'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Determine Price */}
        {recipe && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💵 Langkah 3: Tentukan Harga Jual yang Pas
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold mb-1">Cara Hitung Harga Jual:</p>
                    <p className="text-xs">Modal + Untung = Harga Jual</p>
                    <p className="text-xs mt-2">Contoh:</p>
                    <ul className="text-xs list-disc list-inside">
                      <li>Modal: Rp 25.000</li>
                      <li>Untung 60%: Rp 15.000</li>
                      <li>Harga Jual: Rp 40.000</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">Rekomendasi: 50-70% untuk makanan/kue</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">💰 Modal Buat 1 Porsi:</span>
                  <span className="font-semibold text-lg">{formatCurrency(recipe.total_cost)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Ini uang yang keluar untuk bahan & operasional</p>
              </div>

              {/* Margin Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">🎯 Mau Untung Berapa Persen?</span>
                  <Badge variant="secondary" className="text-base">{marginPercentage}%</Badge>
                </div>
                <Slider
                  value={[marginPercentage]}
                  onValueChange={(value) => setMarginPercentage(value[0])}
                  min={30}
                  max={150}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>30% (Minimum)</span>
                  <span>60% (Rekomendasi)</span>
                  <span>150% (Premium)</span>
                </div>
              </div>

              {/* Suggested Price */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    ✨ Harga Jual yang Pas:
                  </div>
                  <div className="text-5xl font-bold text-purple-600 mb-3">
                    {formatCurrency(suggestedPrice)}
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg inline-block">
                    <div className="text-xs text-muted-foreground mb-1">Rincian:</div>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between gap-4">
                        <span>Modal:</span>
                        <span className="font-medium">{formatCurrency(recipe.total_cost)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-green-600">
                        <span>Untung ({marginPercentage}%):</span>
                        <span className="font-medium">+ {formatCurrency(suggestedPrice - recipe.total_cost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2">
                    <div><span className="font-semibold">💡 Tips Biar Untung Maksimal:</span></div>
                    <ul className="ml-4 space-y-1.5">
                      <li>• <strong>50-70% untung</strong> → Cocok untuk kue/makanan premium</li>
                      <li>• <strong>30-50% untung</strong> → Buat bersaing dengan tetangga</li>
                      <li>• <strong>Cek harga kompetitor</strong> di area Anda dulu</li>
                      <li>• <strong>Jangan lupa</strong> tambahkan biaya kemasan & ongkir</li>
                    </ul>
                    <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                      <strong>⚠️ Ingat:</strong> Harga terlalu murah = rugi. Harga terlalu mahal = gak laku!
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSavePrice}
                  className="flex-1"
                  disabled={updatePrice.isPending}
                >
                  {updatePrice.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Pakai Harga Ini
                    </>
                  )}
                </Button>
                <Button variant="outline">Masukkan Harga Sendiri</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Comparison */}
        {recipe && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 Langkah 4: Lihat Perbandingan
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bandingkan dengan produk lain</p>
                    <p className="text-xs mt-1">Lihat mana yang paling untung</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {comparison.length > 0 ? (
                  comparison.slice(0, 5).map((item: any) => {
                    const marginPct = item.marginPercentage || 0
                    const isGood = marginPct >= 50
                    const isWarning = marginPct >= 30 && marginPct < 50

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${isGood ? 'bg-green-50 dark:bg-green-900/20' :
                          isWarning ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                            'bg-red-50 dark:bg-red-900/20'
                          }`}
                      >
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.hppValue)} → {formatCurrency(item.sellingPrice)}
                          </div>
                        </div>
                        <Badge className={
                          isGood ? 'bg-green-600' :
                            isWarning ? 'bg-yellow-600' :
                              'bg-red-600'
                        }>
                          {isGood ? '💚 Untung Besar' :
                            isWarning ? '⚠️ Untung Kecil' :
                              '🔴 Rugi'}
                        </Badge>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium mb-1">Belum Ada Data Perbandingan</p>
                    <p className="text-xs text-muted-foreground">
                      Hitung HPP produk lain untuk melihat perbandingan
                    </p>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {comparison.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    💡 Rekomendasi:
                  </div>
                  <ul className="text-sm space-y-1 ml-6">
                    {comparison[0] && comparison[0].marginPercentage >= 50 && (
                      <li>• {comparison[0].name}: Produk terbaik! Pertahankan harga dan kualitas</li>
                    )}
                    {comparison.find((c: any) => c.marginPercentage < 30) && (
                      <li>• {comparison.find((c: any) => c.marginPercentage < 30)?.name}: Pertimbangkan naikkan harga atau kurangi biaya bahan</li>
                    )}
                    {comparison.length < 3 && (
                      <li>• Tambahkan lebih banyak produk untuk analisis yang lebih baik</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm">Lihat Detail Lengkap</Button>
                <Button variant="outline" size="sm">Download Laporan Excel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                ⚠️ Peringatan & Notifikasi
                <Badge variant="destructive">3 Baru</Badge>
              </span>
              <Button variant="ghost" size="sm">Tandai Semua Sudah Dibaca</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    onClick={() => handleMarkAlertAsRead(alert.id)}
                  >
                    <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{alert.recipe_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(alert.created_at), {
                          addSuffix: true,
                          locale: idLocale
                        })}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.alert_type}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-1">Semua Aman! 👍</h3>
                  <p className="text-sm text-muted-foreground">
                    Tidak ada peringatan. Semua produk dalam kondisi baik.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
})

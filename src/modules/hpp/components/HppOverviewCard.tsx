'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, Bell, CheckCircle, Lightbulb, History, BarChart3, FileSpreadsheet } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface HppOverviewCardProps {
    overview: {
        totalRecipes: number
        recipesWithHpp: number
        averageHpp: number
        unreadAlerts: number
    }
}

export const HppOverviewCard = ({ overview }: HppOverviewCardProps) => {
    const { formatCurrency } = useCurrency()
    const router = useRouter()
    const { toast } = useToast()

    const handleCalculateAll = async () => {
        try {
            const response = await fetch('/api/hpp/calculate', {
                method: 'PUT'
            })
            if (response.ok) {
                toast({
                    title: 'Berhasil ✓',
                    description: 'Semua biaya produksi berhasil dihitung'
                })
                window.location.reload()
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Gagal menghitung biaya',
                variant: 'destructive'
            })
        }
    }

    return (
        <Card className="border-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            📊 Ringkasan HPP & Pricing
                            <Badge variant={overview.recipesWithHpp === overview.totalRecipes ? "default" : "secondary"}>
                                {overview.recipesWithHpp === overview.totalRecipes ? "Lengkap" : "Perlu Perhatian"}
                            </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau biaya produksi dan profitabilitas produk Anda
                        </p>
                    </div>
                    {overview.recipesWithHpp < overview.totalRecipes && (
                        <Button size="sm" onClick={handleCalculateAll}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Hitung Semua
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {overview.recipesWithHpp}/{overview.totalRecipes}
                                </div>
                                <div className="text-sm text-muted-foreground">Produk Dihitung</div>
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all"
                                            style={{ width: `${overview.totalRecipes > 0 ? (overview.recipesWithHpp / overview.totalRecipes) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">
                                    {formatCurrency(overview.averageHpp)}
                                </div>
                                <div className="text-sm text-muted-foreground">Biaya Rata-rata</div>
                                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-600">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>Per produk</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={`border-2 ${overview.unreadAlerts > 0 ? 'border-orange-500 dark:border-orange-600' : 'border-gray-200 dark:border-gray-700'}`}>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className={`text-3xl font-bold mb-1 ${overview.unreadAlerts > 0 ? 'text-orange-600 animate-pulse' : 'text-gray-400'}`}>
                                    {overview.unreadAlerts}
                                </div>
                                <div className="text-sm text-muted-foreground">Peringatan Baru</div>
                                <div className="flex items-center justify-center gap-1 mt-2 text-xs">
                                    {overview.unreadAlerts > 0 ? (
                                        <>
                                            <Bell className="h-3 w-3 text-orange-600" />
                                            <span className="text-orange-600">Perlu tindakan</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                            <span className="text-green-600">Semua aman</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-800">
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-1">
                                    {overview.recipesWithHpp > 0
                                        ? Math.round((overview.recipesWithHpp / overview.totalRecipes) * 100)
                                        : 0}%
                                </div>
                                <div className="text-sm text-muted-foreground">Progress</div>
                                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-purple-600">
                                    <Calculator className="h-3 w-3" />
                                    <span>Kelengkapan data</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Aksi Cepat
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/calculator')}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Kalkulator HPP
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/snapshots')}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Riwayat Snapshot
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/comparison')}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Bandingkan Produk
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/reports')}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export Laporan
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, Bell, CheckCircle, History, BarChart3, FileSpreadsheet } from 'lucide-react'
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
                    title: 'Berhasil',
                    description: 'Semua biaya produksi berhasil dihitung'
                })
                window.location.reload()
            }
        } catch {
            toast({
                title: 'Gagal',
                description: 'Gagal menghitung biaya',
                variant: 'destructive'
            })
        }
    }

    const completionPercentage = overview.totalRecipes > 0
        ? Math.round((overview.recipesWithHpp / overview.totalRecipes) * 100)
        : 0

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            Ringkasan HPP
                            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                                {completionPercentage === 100 ? "Lengkap" : "Perlu Perhatian"}
                            </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau biaya produksi dan profitabilitas produk
                        </p>
                    </div>
                    {completionPercentage < 100 && (
                        <Button size="sm" onClick={handleCalculateAll}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Hitung Semua
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Produk Dihitung */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                            {overview.recipesWithHpp}/{overview.totalRecipes}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">Produk Dihitung</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Biaya Rata-rata */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                            {formatCurrency(overview.averageHpp)}
                        </div>
                        <div className="text-xs text-muted-foreground">Biaya Rata-rata</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>Per produk</span>
                        </div>
                    </div>

                    {/* Peringatan */}
                    <div className={`p-4 rounded-lg border ${overview.unreadAlerts > 0
                            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                        }`}>
                        <div className={`text-2xl font-bold mb-1 ${overview.unreadAlerts > 0 ? 'text-orange-600' : 'text-gray-400'
                            }`}>
                            {overview.unreadAlerts}
                        </div>
                        <div className="text-xs text-muted-foreground">Peringatan Baru</div>
                        <div className="flex items-center gap-1 mt-1 text-xs">
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

                    {/* Progress */}
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {completionPercentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">Progress</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-purple-600">
                            <Calculator className="h-3 w-3" />
                            <span>Kelengkapan data</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3">Aksi Cepat</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/calculator')}
                        >
                            <Calculator className="h-4 w-4 mr-2" />
                            Kalkulator
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/snapshots')}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Riwayat
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/comparison')}
                        >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Bandingkan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => router.push('/hpp/reports')}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

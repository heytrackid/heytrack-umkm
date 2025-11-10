'use client'

import { BarChart3, Bell, Calculator, CheckCircle, FileSpreadsheet, History, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'




interface HppOverviewCardProps {
    overview: {
        totalRecipes: number
        recipesWithHpp: number
        averageHpp: number
        unreadAlerts: number
    }
}

export const HppOverviewCard = ({ overview }: HppOverviewCardProps): JSX.Element => {
    const { formatCurrency } = useCurrency()
    const router = useRouter()
    const { toast } = useToast()

    const handleCalculateAll = async (): Promise<void> => {
        try {
            const response = await fetch('/api/hpp/calculate', {
                method: 'PUT',
                credentials: 'include', // Include cookies for authentication
            })
            if (response.ok) {
                toast({
                    title: 'Berhasil',
                    description: 'Semua biaya produksi berhasil dihitung'
                })
                router.refresh()
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
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
                        <Button size="sm" onClick={handleCalculateAll} className="w-full sm:w-auto">
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
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="text-2xl font-bold text-gray-600 mb-1">
                            {overview.recipesWithHpp}/{overview.totalRecipes}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">Produk Dihitung</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                                className="bg-gray-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Biaya Rata-rata */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="text-2xl font-bold text-gray-600 mb-1">
                            {formatCurrency(overview.averageHpp)}
                        </div>
                        <div className="text-xs text-muted-foreground">Biaya Rata-rata</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>Per produk</span>
                        </div>
                    </div>

                    {/* Peringatan */}
                    <div className={`p-4 rounded-lg border ${overview.unreadAlerts > 0
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                        : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                        }`}>
                        <div className="text-2xl font-bold mb-1 text-gray-600">
                            {overview.unreadAlerts}
                        </div>
                        <div className="text-xs text-muted-foreground">Peringatan Baru</div>
                        <div className="flex items-center gap-1 mt-1 text-xs">
                            {overview.unreadAlerts > 0 ? (
                                <>
                                    <Bell className="h-3 w-3 text-gray-600" />
                                    <span className="text-gray-600">Perlu tindakan</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-3 w-3 text-gray-600" />
                                    <span className="text-gray-600">Semua aman</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="text-2xl font-bold text-gray-600 mb-1">
                            {completionPercentage}%
                        </div>
                        <div className="text-xs text-muted-foreground">Progress</div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
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

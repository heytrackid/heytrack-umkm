'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, TrendingUp, BarChart3, Bell, Plus, ArrowRight, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const HppEmptyState = () => {
    const router = useRouter()

    return (
        <Card className="border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="py-12">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Calculator className="h-12 w-12 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-3">Yuk Mulai Hitung Biaya & Harga Jual!</h3>
                    <p className="text-muted-foreground mb-8 text-base">
                        Pilih produk di atas untuk menghitung berapa modal yang dibutuhkan dan berapa harga jual yang pas
                    </p>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                    <Calculator className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Hitung Modal Otomatis</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sistem menghitung biaya bahan, gas, listrik, dan kemasan secara otomatis
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Saran Harga Jual</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Dapatkan rekomendasi harga jual yang menguntungkan berdasarkan margin
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Bandingkan Produk</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Lihat produk mana yang paling menguntungkan untuk fokus produksi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                    <Bell className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Peringatan Otomatis</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Notifikasi jika harga bahan naik atau margin menurun
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            size="lg"
                            onClick={() => router.push('/recipes/new')}
                            className="gap-2"
                        >
                            <Plus className="h-5 w-5" />
                            Buat Produk Baru
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => router.push('/recipes')}
                            className="gap-2"
                        >
                            Lihat Semua Produk
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Quick Tip */}
                    <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-left">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                    💡 Tips: Pastikan Harga Bahan Sudah Diisi
                                </p>
                                <p className="text-yellow-800 dark:text-yellow-200">
                                    Sebelum menghitung HPP, pastikan semua bahan sudah memiliki harga.
                                    Kunjungi halaman <button onClick={() => router.push('/ingredients')} className="underline font-medium">Bahan Baku</button> untuk update harga.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

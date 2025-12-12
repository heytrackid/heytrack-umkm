'use client'

import { ArrowRight, BarChart3, Bell, Calculator, Lightbulb, Plus, TrendingUp } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'




export const HppEmptyState = (): JSX.Element => {
    const router = useRouter()

    return (
        <Card className="border-2 border-dashed border-border/20 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20">
            <CardContent className="py-12">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted-foreground/60 to-muted-foreground/80 rounded-full flex items-center justify-center">
                        <Calculator className="h-12 w-12 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold mb-3">Yuk Mulai Hitung Biaya & Harga Jual!</h3>
                    <p className="text-muted-foreground mb-8 text-base">
                        Pilih produk di atas untuk menghitung berapa modal yang dibutuhkan dan berapa harga jual yang pas
                    </p>

                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <div className="bg-card p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                    <Calculator className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Hitung Modal Otomatis</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Sistem menghitung biaya bahan, gas, listrik, dan kemasan secara otomatis
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Saran Harga Jual</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Dapatkan rekomendasi harga jual yang menguntungkan berdasarkan margin
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Bandingkan Produk</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Lihat produk mana yang paling menguntungkan untuk fokus produksi
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-lg border text-left">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                                    <Bell className="h-5 w-5 text-muted-foreground" />
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
                    <div className="mt-8 p-4 bg-muted/20 rounded-lg border border-border/20  text-left">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-semibold text-foreground mb-1">
                                    💡 Tips: Lengkapi Data untuk Perhitungan Akurat
                                </p>
                                <p className="text-muted-foreground mb-2">
                                    Untuk hasil HPP yang akurat, pastikan:
                                </p>
                                <ul className="text-muted-foreground text-sm space-y-1 ml-4">
                                    <li>• Semua bahan sudah memiliki harga jual</li>
                                    <li>• Resep sudah lengkap dengan jumlah bahan</li>
                                    <li>• Jumlah hasil per resep sudah ditentukan</li>
                                </ul>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => router.push('/ingredients')} className="text-primary underline font-medium text-sm">
                                        Update Harga Bahan →
                                    </button>
                                    <button onClick={() => router.push('/recipes')} className="text-primary underline font-medium text-sm">
                                        Kelola Resep →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

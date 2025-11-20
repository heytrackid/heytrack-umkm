'use client'

import { BookOpen, Package, Plus, Video } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'



interface EnhancedEmptyStateProps {
    onAdd: () => void
    showTutorial?: boolean
}

/**
  * Enhanced Empty State for Ingredients
  *
  * Provides rich onboarding experience with:
  * - Clear visual hierarchy
  * - Action-oriented CTA
  * - Links to documentation
  * - Quick start guide
  */
export const EnhancedEmptyState = ({
     onAdd,
     showTutorial = true
 }: EnhancedEmptyStateProps) => (
        <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Package className="w-10 h-10 text-muted-foreground" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Belum Ada Bahan Baku
                </h3>

                {/* Description */}
                <p className="text-center text-muted-foreground mb-6 max-w-md">
                    Mulai kelola stok bahan baku Anda dengan menambahkan bahan pertama.
                    Pantau harga, stok, dan dapatkan alert otomatis saat stok menipis.
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full max-w-2xl">
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl mb-2">📊</div>
                        <p className="text-sm font-medium text-foreground">Tracking Real-time</p>
                        <p className="text-xs text-muted-foreground mt-1">Monitor stok secara otomatis</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl mb-2">🔔</div>
                        <p className="text-sm font-medium text-foreground">Alert Stok Rendah</p>
                        <p className="text-xs text-muted-foreground mt-1">Notifikasi saat perlu restock</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl mb-2">💰</div>
                        <p className="text-sm font-medium text-foreground">Kalkulasi HPP</p>
                        <p className="text-xs text-muted-foreground mt-1">Hitung biaya produksi akurat</p>
                    </div>
                </div>

                {/* Primary CTA */}
                <Button
                    onClick={onAdd}
                    size="lg"
                    className="mb-4 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Bahan Baku Pertama
                </Button>

                {/* Secondary Actions */}
                {showTutorial && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('/docs/ingredients', '_blank')}
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Baca Panduan
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('/docs/video-tutorial', '_blank')}
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Tonton Tutorial
                        </Button>
                    </div>
                )}

                {/* Quick Start Steps */}
                <div className="mt-8 p-4 bg-muted rounded-lg w-full max-w-md">
                    <h4 className="font-semibold text-sm text-foreground mb-3">
                        🚀 Quick Start
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">1.</span>
                            <span>Klik tombol &#34;Tambah Bahan Baku&#34;</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">2.</span>
                            <span>Isi nama, satuan, dan harga bahan</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">3.</span>
                            <span>Set stok minimum untuk alert otomatis</span>
                        </li>
                        <li className="flex items-start">
                            <span className="font-semibold mr-2">4.</span>
                            <span>Mulai tracking dan kelola stok Anda!</span>
                        </li>
                    </ol>
                 </div>
             </CardContent>
         </Card>
     )

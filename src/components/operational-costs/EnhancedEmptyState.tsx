'use client'

import { Receipt, Plus, Zap, Lightbulb } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'



interface EnhancedEmptyStateProps {
    onAdd: () => void
    onQuickSetup: () => void
}

export const EnhancedEmptyState = ({ onAdd, onQuickSetup }: EnhancedEmptyStateProps) => (
    <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center py-12">
            {/* Icon */}
            <div className="rounded-full bg-muted flex items-center justify-center mb-4 w-20 h-20">
                <Receipt className="w-10 h-10 text-muted-foreground" />
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground mb-2 text-xl">
                Belum Ada Biaya Operasional
            </h3>

            {/* Description */}
            <p className="text-muted-foreground mb-6 max-w-md text-base">
                Mulai dengan menambahkan biaya operasional pertama Anda. Gunakan Setup Cepat untuk template biaya umum atau tambah manual.
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-center mb-6">
                <Button onClick={onAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Biaya Manual
                </Button>
                <Button variant="outline" onClick={onQuickSetup}>
                    <Zap className="w-4 h-4 mr-2" />
                    Setup Cepat (8 Template)
                </Button>
            </div>

            {/* Tips */}
            <div className="w-full max-w-md space-y-2 mt-4 pt-4 border-t">
                <div className="flex items-start gap-2 text-left text-sm text-muted-foreground">
                    <span className="text-base flex-shrink-0">💡</span>
                    <span>Setup Cepat menambahkan 8 kategori biaya umum (listrik, air, gas, gaji, dll)</span>
                </div>
                <div className="flex items-start gap-2 text-left text-sm text-muted-foreground">
                    <span className="text-base flex-shrink-0">📊</span>
                    <span>Biaya operasional digunakan untuk menghitung HPP yang akurat</span>
                </div>
                <div className="flex items-start gap-2 text-left text-sm text-muted-foreground">
                    <span className="text-base flex-shrink-0">🔔</span>
                    <span>Atur biaya berulang untuk tracking otomatis setiap bulan</span>
                </div>
            </div>

            {/* Quick Tip */}
            <div className="mt-6 p-4 bg-muted rounded-lg border border-border/20  text-left w-full max-w-md">
                <div className="flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold text-foreground mb-1">
                            💡 Tips: Catat Semua Biaya
                        </p>
                        <p className="text-muted-foreground">
                            Catat biaya tetap (sewa, gaji) dan variabel (listrik, transport) untuk perhitungan HPP yang lebih akurat.
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)


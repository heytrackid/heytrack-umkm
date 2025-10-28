'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Receipt, Plus, Zap, BookOpen } from 'lucide-react'

interface EnhancedEmptyStateProps {
    onAdd: () => void
    onQuickSetup: () => void
}

export const EnhancedEmptyState = ({ onAdd, onQuickSetup }: EnhancedEmptyStateProps) => {
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium">Biaya Operasional</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Receipt className="h-8 w-8" />
                    Biaya Operasional
                </h1>
                <p className="text-muted-foreground mt-1">Kelola semua biaya operasional bisnis Anda</p>
            </div>

            {/* Empty State Card */}
            <Card>
                <CardContent className="p-12">
                    <div className="text-center max-w-md mx-auto">
                        <div className="mb-6">
                            <Receipt className="h-16 w-16 mx-auto text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Belum Ada Biaya Operasional</h2>
                        <p className="text-muted-foreground mb-8">
                            Mulai dengan menambahkan biaya operasional pertama Anda. Anda bisa menambahkan manual atau
                            menggunakan template cepat untuk memulai.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={onAdd} size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Tambah Biaya Pertama
                            </Button>
                            <Button variant="outline" size="lg" onClick={onQuickSetup}>
                                <Zap className="h-5 w-5 mr-2" />
                                Setup Cepat
                            </Button>
                        </div>

                        {/* Tips */}
                        <div className="mt-12 pt-8 border-t">
                            <div className="flex items-start gap-3 text-left">
                                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium mb-1">Tips Memulai</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Gunakan Setup Cepat untuk menambahkan template biaya umum</li>
                                        <li>• Catat semua biaya tetap (sewa, gaji) dan variabel (listrik, transport)</li>
                                        <li>• Data biaya digunakan untuk menghitung HPP dan harga jual yang akurat</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

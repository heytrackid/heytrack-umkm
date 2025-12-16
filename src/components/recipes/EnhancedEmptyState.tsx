 
'use client'

import { BookOpen, ChefHat, Plus, Sparkles } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'



interface EnhancedEmptyStateProps {
    onAdd: () => void
}

export const EnhancedEmptyState = ({ onAdd }: EnhancedEmptyStateProps) => {
  const router = useRouter()
  return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium">Resep Produk</span>
            </div>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ChefHat className="h-8 w-8" />
                    Resep Produk
                </h1>
                <p className="text-muted-foreground mt-1">
                    Kelola resep dan hitung HPP dengan sistem otomatis
                </p>
            </div>

            {/* Empty State Card */}
            <Card>
                <CardContent className="p-12">
                    <div className="text-center max-w-md mx-auto">
                        <div className="mb-6">
                            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Belum Ada Resep</h2>
                        <p className="text-muted-foreground mb-8">
                            Mulai dengan menambahkan resep pertama Anda. Anda bisa membuat resep secara manual
                            atau menggunakan AI Generator untuk membantu.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={onAdd} size="lg">
                                <Plus className="h-5 w-5 mr-2" />
                                Tambah Resep Pertama
                            </Button>
                            <Button variant="outline" size="lg" onClick={() => router.push('/chef-wise')}>
                                <Sparkles className="h-5 w-5 mr-2" />
                                Coba AI Generator
                            </Button>
                        </div>

                        {/* Tips */}
                        <div className="mt-12 pt-8 border-t">
                            <div className="flex items-start gap-3 text-left">
                                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium mb-1">Tips Memulai</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>• Pastikan bahan baku sudah ditambahkan terlebih dahulu</li>
                                        <li>• Gunakan AI Generator untuk inspirasi resep baru</li>
                                        <li>• Hitung HPP untuk menentukan harga jual yang tepat</li>
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



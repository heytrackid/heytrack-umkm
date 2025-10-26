'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ListSkeleton } from '@/components/ui'
import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'

interface LoadingStateProps {
    className?: string
}

export function LoadingState({ className }: LoadingStateProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Rekomendasi Optimasi
                </CardTitle>
                <CardDescription>Saran untuk meningkatkan efisiensi dan profitabilitas</CardDescription>
            </CardHeader>
            <CardContent>
                <ListSkeleton items={3} />
            </CardContent>
        </Card>
    )
}

interface ErrorStateProps {
    className?: string
}

export function ErrorState({ className }: ErrorStateProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Rekomendasi Optimasi
                </CardTitle>
                <CardDescription>Saran untuk meningkatkan efisiensi dan profitabilitas</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gagal memuat rekomendasi</p>
                </div>
            </CardContent>
        </Card>
    )
}

interface EmptyStateProps {
    className?: string
}

export function EmptyState({ className }: EmptyStateProps) {
    return (
        <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p className="font-medium">Tidak ada rekomendasi saat ini</p>
            <p className="text-sm mt-2">
                HPP produk Anda sudah optimal. Terus pantau untuk perubahan di masa depan.
            </p>
        </div>
    )
}

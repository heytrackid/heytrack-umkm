'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListSkeleton } from '@/components/ui'
import { AlertCircle, Check } from 'lucide-react'

interface LoadingStateProps {
    className?: string
}

export function LoadingState({ className }: LoadingStateProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Alert HPP</CardTitle>
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
                <CardTitle>Alert HPP</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Gagal memuat alert</p>
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
            <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tidak ada alert</p>
            <p className="text-sm">Semua HPP produk dalam kondisi normal</p>
        </div>
    )
}

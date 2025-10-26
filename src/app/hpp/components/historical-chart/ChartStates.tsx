'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardSkeleton } from '@/components/ui'
import { AlertCircle, Calendar } from 'lucide-react'
import type { TimePeriod } from '@/types/hpp-tracking'

interface LoadingStateProps {
    className?: string
}

export function LoadingState({ className }: LoadingStateProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
                <CardSkeleton rows={6} />
            </CardContent>
        </Card>
    )
}

interface ErrorStateProps {
    className?: string
    error: string
    selectedPeriod: TimePeriod
    onRetry: () => void
}

export function ErrorState({ className, error, selectedPeriod, onRetry }: ErrorStateProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Tren HPP Historical</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button
                    onClick={onRetry}
                    className="mt-4"
                    variant="outline"
                >
                    Coba Lagi
                </Button>
            </CardContent>
        </Card>
    )
}

interface EmptyStateProps {
    className?: string
    recipeName?: string
}

export function EmptyState({ className, recipeName }: EmptyStateProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Tren HPP Historical</CardTitle>
                <CardDescription>
                    {recipeName && `Data historical untuk ${recipeName}`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Belum Ada Data Historical</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        Data snapshot HPP akan tersedia setelah sistem melakukan pencatatan otomatis.
                        Snapshot dibuat setiap hari pada pukul 00:00.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

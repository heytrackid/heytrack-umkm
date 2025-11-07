 
'use client'

import {
    AlertCircle,
    ArrowLeft,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    ServerCrash,
    ShieldAlert,
    WifiOff,
    XCircle
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
    title?: string
    message?: string
    error?: unknown
    onRetry?: () => void
    onGoBack?: () => void
    showTechnicalDetails?: boolean
    variant?: 'card' | 'inline' | 'page'
    className?: string
}

// Helper to get user-friendly error messages
 
function getUserFriendlyError(error: unknown): {
    title: string
    message: string
    icon: React.ComponentType<{ className?: string }>
    suggestions: string[]
} {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorLower = errorMessage.toLowerCase()

    // Network errors
    if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('timeout')) {
        return {
            title: 'Koneksi Internet Bermasalah',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
            icon: WifiOff,
            suggestions: [
                'Periksa koneksi WiFi atau data seluler Anda',
                'Coba refresh halaman',
                'Tunggu beberapa saat dan coba lagi'
            ]
        }
    }

    // Authentication errors
    if (errorLower.includes('unauthorized') || errorLower.includes('auth') || errorLower.includes('401')) {
        return {
            title: 'Sesi Anda Berakhir',
            message: 'Silakan login kembali untuk melanjutkan.',
            icon: ShieldAlert,
            suggestions: [
                'Login kembali ke akun Anda',
                'Periksa username dan password',
                'Hubungi admin jika masalah berlanjut'
            ]
        }
    }

    // Server errors
    if (errorLower.includes('500') || errorLower.includes('server') || errorLower.includes('internal')) {
        return {
            title: 'Server Sedang Bermasalah',
            message: 'Terjadi kesalahan di server. Tim kami sedang memperbaikinya.',
            icon: ServerCrash,
            suggestions: [
                'Tunggu beberapa menit dan coba lagi',
                'Data Anda aman, tidak ada yang hilang',
                'Hubungi support jika masalah berlanjut'
            ]
        }
    }

    // Validation errors
    if (errorLower.includes('validation') || errorLower.includes('invalid') || errorLower.includes('required')) {
        return {
            title: 'Data Tidak Valid',
            message: 'Periksa kembali data yang Anda masukkan.',
            icon: AlertCircle,
            suggestions: [
                'Pastikan semua field wajib sudah diisi',
                'Periksa format data (email, nomor, dll)',
                'Lihat pesan error di form'
            ]
        }
    }

    // Not found errors
    if (errorLower.includes('not found') || errorLower.includes('404')) {
        return {
            title: 'Data Tidak Ditemukan',
            message: 'Data yang Anda cari tidak ditemukan atau sudah dihapus.',
            icon: XCircle,
            suggestions: [
                'Periksa kembali ID atau nama yang dicari',
                'Data mungkin sudah dihapus',
                'Kembali ke halaman sebelumnya'
            ]
        }
    }

    // Generic error
    return {
        title: 'Terjadi Kesalahan',
        message: 'Maaf, terjadi kesalahan yang tidak terduga.',
        icon: AlertCircle,
        suggestions: [
            'Coba refresh halaman',
            'Coba lagi dalam beberapa saat',
            'Hubungi support jika masalah berlanjut'
        ]
    }
}

export const ErrorMessage = ({
    title,
    message,
    error,
    onRetry,
    onGoBack,
    showTechnicalDetails = false,
    variant = 'card',
    className
}: ErrorMessageProps) => {
    const [showDetails, setShowDetails] = useState(false)

    const errorInfo = error ? getUserFriendlyError(error) : null
    const ErrorIcon = errorInfo?.icon ?? AlertCircle

    const finalTitle = title ?? errorInfo?.title ?? 'Terjadi Kesalahan'
    const finalMessage = message ?? errorInfo?.message ?? 'Silakan coba lagi.'
    const suggestions = errorInfo?.suggestions ?? []

    // Inline variant (for forms, small sections)
    if (variant === 'inline') {
        return (
            <Alert variant="destructive" className={className}>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{finalTitle}</AlertTitle>
                <AlertDescription>{finalMessage}</AlertDescription>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="mt-2"
                    >
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Coba Lagi
                    </Button>
                )}
            </Alert>
        )
    }

    // Card variant (for sections, modals)
    if (variant === 'card') {
        return (
            <Card className={cn('border-destructive', className)}>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="rounded-full bg-destructive/10 p-3 mb-4">
                            <ErrorIcon className="h-6 w-6 text-destructive" />
                        </div>

                        <h3 className="font-semibold text-lg mb-2">{finalTitle}</h3>
                        <p className="text-muted-foreground mb-4">{finalMessage}</p>

                        <div className="flex gap-2">
                            {onRetry && (
                                <Button onClick={onRetry} size="sm">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Coba Lagi
                                </Button>
                            )}
                            {onGoBack && (
                                <Button onClick={onGoBack} variant="outline" size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Kembali
                                </Button>
                            )}
                        </div>

                        {showTechnicalDetails && error !== undefined && error !== null && (
                            <div className="mt-4 w-full">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-xs"
                                >
                                    {showDetails ? (
                                        <>
                                            <ChevronUp className="w-3 h-3 mr-1" />
                                            Sembunyikan Detail
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-3 h-3 mr-1" />
                                            Lihat Detail Teknis
                                        </>
                                    )}
                                </Button>

                                {showDetails && (
                                    <pre className="mt-2 p-3 bg-muted rounded text-xs text-left overflow-auto max-h-32">
                                        {String(error instanceof Error ? (error.stack ?? error.message) : error)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Page variant (for full page errors)
    return (
        <div className={cn('flex items-center justify-center min-h-[400px] p-6', className)}>
            <div className="max-w-md w-full text-center">
                <div className="rounded-full bg-destructive/10 p-6 inline-flex mb-6">
                    <ErrorIcon className="h-12 w-12 text-destructive" />
                </div>

                <h1 className="text-2xl font-bold mb-3">{finalTitle}</h1>
                <p className="text-muted-foreground mb-6">{finalMessage}</p>

                {suggestions.length > 0 && (
                    <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                        <p className="font-medium text-sm mb-2">Saran:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {suggestions.map((suggestion: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span>
                                    <span>{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {onRetry && (
                        <Button onClick={onRetry}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Coba Lagi
                        </Button>
                    )}
                    {onGoBack && (
                        <Button onClick={onGoBack} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                    )}
                </div>

                {showTechnicalDetails && error !== undefined && error !== null && (
                    <div className="mt-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs"
                        >
                            {showDetails ? (
                                <>
                                    <ChevronUp className="w-3 h-3 mr-1" />
                                    Sembunyikan Detail Teknis
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3 mr-1" />
                                    Lihat Detail Teknis
                                </>
                            )}
                        </Button>

                        {showDetails && (
                            <pre className="mt-3 p-4 bg-muted rounded text-xs text-left overflow-auto max-h-48">
                                {String(error instanceof Error ? (error.stack ?? error.message) : error)}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Hook for easy error handling
export function useErrorHandler(): JSX.Element {
    const [error, setError] = useState<Error | null>(null)

    const handleError = (error: unknown) => {
        if (error instanceof Error) {
            setError(error)
        } else {
            setError(new Error(String(error)))
        }
    }

    const clearError = () => setError(null)

    return { error, handleError, clearError }
}

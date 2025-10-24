'use client'

import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { TimePeriod } from '@/types/hpp-tracking'
import { Download, Loader2 } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'

import { apiLogger } from '@/lib/logger'
interface HPPExportButtonProps {
    recipeId: string
    recipeName: string
    period: TimePeriod
    variant?: 'default' | 'outline' | 'ghost' | 'secondary'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    disabled?: boolean
}

export default function HPPExportButton({
    recipeId,
    recipeName,
    period,
    variant = 'outline',
    size = 'default',
    className = '',
    disabled = false
}: HPPExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)

            // Call export API endpoint
            const response = await fetch(
                `/api/hpp/export?recipe_id=${recipeId}&period=${period}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Export failed')
            }

            // Get the blob from response
            const blob = await response.blob()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url

            // Generate filename
            const filename = `HPP_History_${recipeName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
            link.download = filename

            // Trigger download
            document.body.appendChild(link)
            link.click()

            // Cleanup
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            // Show success toast
            toast({
                title: 'Export Berhasil',
                description: `Data HPP ${recipeName} berhasil diekspor ke Excel`,
                variant: 'default'
            })
        } catch (error: unknown) {
            apiLogger.error({ error: error }, 'Export error:')

            // Show error toast
            toast({
                title: 'Export Gagal',
                description: error.message || 'Terjadi kesalahan saat mengekspor data',
                variant: 'destructive'
            })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleExport}
            disabled={disabled || isExporting}
        >
            {isExporting ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengekspor...
                </>
            ) : (
                <>
                    <Download className="h-4 w-4 mr-2" />
                    Export to Excel
                </>
            )}
        </Button>
    )
}

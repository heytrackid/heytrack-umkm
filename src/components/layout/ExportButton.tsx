'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { uiLogger } from '@/lib/logger'



interface ExportButtonProps {
    collapsed?: boolean
}

export const ExportButton = ({ collapsed = false }: ExportButtonProps = {}) => {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            toast.info('Memproses export...')

            const response = await fetch('/api/export/global')

            if (!response.ok) {
                throw new Error('Export gagal')
            }

            // Download file
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `HeyTrack_Export_${new Date().toISOString().split('T')[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Export berhasil!')
        } catch (error: unknown) {
            uiLogger.error({ error: String(error) }, 'Export error')
            toast.error('Export gagal. Silakan coba lagi.')
        } finally {
            setIsExporting(false)
        }
    }

    const getButtonTitle = () => {
        if (!collapsed) {return undefined}
        return isExporting ? 'Mengexport...' : 'Export Data'
    }

    const getButtonText = () => {
        if (collapsed) {return null}
        return isExporting ? 'Mengexport...' : 'Export Data'
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className={collapsed ? "w-auto" : "w-full justify-start gap-2"}
            title={getButtonTitle()}
        >
            <Download className="h-4 w-4 flex-shrink-0" />
            {getButtonText()}
        </Button>
    )
}

'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ExportButton() {
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
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Export gagal. Silakan coba lagi.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="w-full justify-start gap-2"
        >
            <Download className="h-4 w-4" />
            {isExporting ? 'Mengexport...' : 'Export Data'}
        </Button>
    )
}

'use client'
import { AlertCircle, CheckCircle2, Download, FileText, Loader2, Upload } from '@/components/icons'
import { useRef, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/lib/toast'
import { uiLogger } from '@/lib/logger'

interface ImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    templateUrl: string
    templateFilename: string
    onImport: (data: unknown[]) => Promise<{ success: boolean; count?: number; error?: string; details?: unknown[] }>
    parseCSV: (text: string) => unknown[]
}

export const ImportDialog = ({
    open,
    onOpenChange,
    title,
    description,
    templateUrl,
    templateFilename,
    onImport,
    parseCSV
}: ImportDialogProps): JSX.Element => {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        count?: number
        error?: string
        details?: Array<{ row: number; error: string }> | unknown[]
    } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error('File tidak valid - Hanya file CSV yang diperbolehkan')
                return
            }
            setFile(selectedFile)
            setResult(null)
        }
    }

    const handleImport = async (): Promise<void> => {
        if (!file) { return }

        setLoading(true)
        setResult(null)

        try {
            // Read file
            const text = await file.text()

            // Parse CSV
            const data = parseCSV(text)

            if (data.length === 0) {
                setResult({
                    success: false,
                    error: 'File CSV kosong atau format tidak valid'
                })
                setLoading(false)
                return
            }

            // Call import API
            const result = await onImport(data)
            setResult(result)

            if (result.success) {
                toast.success(`${result.count} data berhasil diimport`)

                // Close dialog after 2 seconds
                setTimeout(() => {
                    onOpenChange(false)
                    setFile(null)
                    setResult(null)
                }, 2000)
            }

        } catch (error: unknown) {
            uiLogger.error({ error: String(error) }, 'Import error')
            setResult({
                success: false,
                error: 'Terjadi kesalahan saat import'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadTemplate = (): void => {
        const link = document.createElement('a')
        link.href = templateUrl
        link.download = templateFilename
        document['body'].appendChild(link)
        link.click()
        document['body'].removeChild(link)
    }

    const handleClose = (): void => {
        if (!loading) {
            onOpenChange(false)
            setFile(null)
            setResult(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-wrap-mobile">{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Download Template */}
                    <div className="p-4 bg-muted border border-border/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-foreground text-sm mb-1">
                                    Template CSV
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Download template terlebih dahulu, isi data, lalu upload kembali
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDownloadTemplate}
                                    className="bg-background"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Template
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label htmlFor="import-csv-file" className="text-sm font-medium">Upload File CSV</label>
                        <div className="flex gap-2">
                            <input
                                id="import-csv-file"
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading}
                                className="flex-1"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {file ? file.name : 'Pilih File'}
                            </Button>
                            {file && (
                                <Button
                                    onClick={handleImport}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Import...
                                        </>
                                    ) : (
                                        'Import'
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Result */}
                    {result && (
                        <Alert variant={result.success ? 'default' : 'destructive'}>
                            <div className="flex items-start gap-2">
                                {result.success ? (
                                    <CheckCircle2 className="w-5 h-5 text-foreground" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                )}
                                <div className="flex-1">
                                    <AlertDescription>
                                        {result.success ? (
                                            <span className="text-foreground">
                                                Berhasil import {result.count} data
                                            </span>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="font-semibold">{result.error}</p>
                                                {result.details && result.details.length > 0 && (
                                                    <div className="mt-2 space-y-1 text-sm">
                                                        <p className="font-medium">Error detail:</p>
                                                        <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                                                            {result.details.slice(0, 10).map((detail, idx) => {
                                                                const errorDetail = detail as { row: number; error: string }
                                                                return (
                                                                    <li key={idx}>
                                                                        Baris {errorDetail.row}: {errorDetail.error}
                                                                    </li>
                                                                )
                                                            })}
                                                            {result.details.length > 10 && (
                                                                <li className="text-muted-foreground">
                                                                    ... dan {result.details.length - 10} error lainnya
                                                                </li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    )}

                    {/* Instructions */}
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium">Petunjuk:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Download template CSV</li>
                            <li>Isi data sesuai kolom yang tersedia</li>
                            <li>Simpan file dalam format CSV</li>
                            <li>Upload file dan klik Import</li>
                        </ol>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}



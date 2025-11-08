 
'use client'

import { AlertTriangle, ArrowRight, CheckCircle, Download, FileText, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { uiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'




interface ImportRow {
    row: number
    name: string
    unit: string
    price_per_unit: number
    current_stock: number
    min_stock: number
    description?: string
    errors: string[]
    warnings: string[]
}

interface BulkImportWizardProps {
    onImport: (data: ImportRow[]) => Promise<void>
    onCancel: () => void
}

type Step = 'complete' | 'import' | 'review' | 'upload' | 'validate'

export const BulkImportWizard = ({ onImport, onCancel }: BulkImportWizardProps) => {
    const [currentStep, setCurrentStep] = useState<Step>('upload')
    const [_file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ImportRow[]>([])
    const [_isImporting, setIsImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 })
    const fileInputRef = useRef<HTMLInputElement>(null)

    const validCount = parsedData.filter(row => row.errors.length === 0).length
    const errorCount = parsedData.filter(row => row.errors.length > 0).length
    const warningCount = parsedData.filter(row => row.warnings.length > 0).length

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            void parseFile(selectedFile)
        }
    }

    const parseFile = async (file: File) => {
        setCurrentStep('validate')

        try {
            // Parse CSV/Excel file
            const text = await file.text()
            const lines = text.split('\n').filter(line => line.trim())

            // Skip header row
            const dataLines = lines.slice(1)

            const parsedData: ImportRow[] = dataLines.map((line, index) => {
                const columns = line.split(',').map(col => col.trim())
                const parseNumber = (value?: string) => {
                  const parsed = Number(value)
                  return Number.isFinite(parsed) ? parsed : 0
                }
                const row = index + 2 // +2 because we skip header and arrays are 0-indexed

                const name = columns[0] || ''
                const unit = columns[1] || ''
                const price_per_unit = parseNumber(columns[2])
                const current_stock = parseNumber(columns[3])
                const min_stock = parseNumber(columns[4])
                const description = columns[5] || ''

                // Validation
                const errors: string[] = []
                const warnings: string[] = []

                if (!name) {
                    errors.push('Nama bahan harus diisi')
                }
                if (!unit) {
                    errors.push('Satuan harus diisi')
                }
                if (price_per_unit <= 0) {
                    errors.push('Harga harus lebih dari 0')
                }
                if (current_stock < 0) {
                    errors.push('Stok tidak boleh negatif')
                }
                if (min_stock < 0) {
                    errors.push('Stok minimum tidak boleh negatif')
                }

                // Warnings
                if (current_stock < min_stock) {
                    warnings.push('Stok saat ini di bawah minimum')
                }
                if (price_per_unit > 100000) {
                    warnings.push('Harga cukup tinggi, pastikan sudah benar')
                }

                return {
                    row,
                    name,
                    unit,
                    price_per_unit,
                    current_stock,
                    min_stock,
                    description,
                    errors,
                    warnings
                }
            })

            setParsedData(parsedData)
            setCurrentStep('review')
        } catch (error: unknown) {
            const message = getErrorMessage(error)
            uiLogger.error({ error: message }, 'Failed to parse file')
            // Handle error - show toast or error message
            setCurrentStep('upload')
        }
    }

    const handleImport = async () => {
        const validRows = parsedData.filter(row => row.errors.length === 0)

        setCurrentStep('import')
        setIsImporting(true)
        setImportProgress(0)

        try {
            // Simulate import progress
            for (let i = 0; i <= validRows.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 300))
                setImportProgress((i / validRows.length) * 100)
            }

            await onImport(validRows)

            setImportResults({
                success: validRows.length,
                failed: errorCount
            })
            setCurrentStep('complete')
        } catch (error: unknown) {
            const message = getErrorMessage(error)
            uiLogger.error({ error: message }, 'Import failed')
        } finally {
            setIsImporting(false)
        }
    }

    const downloadTemplate = () => {
        const csv = `name,unit,price_per_unit,current_stock,min_stock,description
Tepung Terigu,kg,12000,50,20,Tepung protein tinggi
Gula Pasir,kg,15000,30,15,Gula putih halus
Mentega,kg,45000,10,5,Mentega tawar
Telur,pcs,2500,100,50,Telur ayam negeri`

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'template_import_ingredients.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    const renderStepIndicator = () => {
        const steps = [
            { id: 'upload', label: 'Upload' },
            { id: 'validate', label: 'Validasi' },
            { id: 'review', label: 'Review' },
            { id: 'import', label: 'Import' },
            { id: 'complete', label: 'Selesai' }
        ]

        const currentIndex = steps.findIndex(s => s['id'] === currentStep)

        return (
            <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => {
                    const isCompleted = index < currentIndex
                    const isCurrent = index === currentIndex
                    const getCircleClasses = () => {
                        if (isCompleted || isCurrent) {return 'bg-gray-500 text-white'}
                        return 'bg-gray-200 text-gray-500'
                    }
                    const circleClasses = getCircleClasses()
                    const connectorClasses = index < currentIndex
                        ? 'bg-gray-500'
                        : 'bg-gray-200'

                    return (
                        <div key={step['id']} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${circleClasses}`}>
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : index + 1}
                                </div>
                                <div className="text-xs mt-2 font-medium">{step.label}</div>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`h-1 flex-1 mx-2 ${connectorClasses}`} />
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Upload Step */}
            {currentStep === 'upload' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload File CSV
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Template Download */}
                        <Alert>
                            <FileText className="h-4 w-4" />
                            <AlertDescription>
                                <div className="flex items-center justify-between">
                                    <span>Belum punya template? Download template CSV terlebih dahulu</span>
                                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Template
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>

                        {/* Upload Area */}
                        <div
                            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <p className="font-medium mb-2">Click to upload or drag and drop</p>
                            <p className="text-sm text-muted-foreground">CSV file only (max 5MB)</p>
                        </div>

                        {/* Format Guide */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-300">
                            <p className="font-semibold text-sm mb-2">📋 Format CSV:</p>
                            <div className="text-xs space-y-1 text-gray-800 dark:text-gray-200">
                                <p>• <strong>name</strong>: Nama bahan (required)</p>
                                <p>• <strong>unit</strong>: Satuan (kg, g, l, ml, pcs, dozen)</p>
                                <p>• <strong>price_per_unit</strong>: Harga per unit (number)</p>
                                <p>• <strong>current_stock</strong>: Stok saat ini (number)</p>
                                <p>• <strong>min_stock</strong>: Stok minimum (number)</p>
                                <p>• <strong>description</strong>: Deskripsi (optional)</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Validate Step */}
            {currentStep === 'validate' && (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                                <FileText className="h-8 w-8 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">Memvalidasi Data...</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Mohon tunggu sebentar
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
                <div className="space-y-4">
                    {/* Summary */}
                    <Card className="border-2 border-gray-300 bg-gray-50/50">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-600">{validCount}</div>
                                    <div className="text-xs text-muted-foreground">Valid</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-orange-600">{warningCount}</div>
                                    <div className="text-xs text-muted-foreground">Warnings</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                                    <div className="text-xs text-muted-foreground">Errors</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Preview Data ({parsedData.length} rows)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {parsedData.map((row) => (
                                    <div
                                        key={row.row}
                                        className={`p-3 rounded-lg border ${
                                          row.errors.length > 0 
                                            ? 'bg-red-50 border-red-200' 
                                            : row.warnings.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-300'
                                          }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        Row {row.row}
                                                    </Badge>
                                                    <span className="font-medium">{row.name || '(empty)'}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {row.unit} • Rp {row.price_per_unit.toLocaleString()} •
                                                    Stock: {row.current_stock} • Min: {row.min_stock}
                                                </div>
                                            </div>
                                            {row.errors.length === 0 && row.warnings.length === 0 && (
                                                <CheckCircle className="h-5 w-5 text-gray-600" />
                                            )}
                                            {row.errors.length > 0 && (
                                                <X className="h-5 w-5 text-red-600" />
                                            )}
                                            {row.warnings.length > 0 && row.errors.length === 0 && (
                                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                            )}
                                        </div>

                                        {/* Errors */}
                                        {row.errors.length > 0 && (
                                            <div className="space-y-1">
                                                {row.errors.map((error, idx) => (
                                                    <div key={idx} className="text-xs text-red-700 flex items-start gap-1">
                                                        <X className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                                        <span>{error}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Warnings */}
                                        {row.warnings.length > 0 && (
                                            <div className="space-y-1">
                                                {row.warnings.map((warning, idx) => (
                                                    <div key={idx} className="text-xs text-orange-700 flex items-start gap-1">
                                                        <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                                        <span>{warning}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={validCount === 0}
                        >
                            Import {validCount} Items
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Import Step */}
            {currentStep === 'import' && (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <Upload className="h-8 w-8 text-gray-600 animate-bounce" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg mb-2">Importing Data...</p>
                                <p className="text-sm text-muted-foreground">
                                    {Math.round(importProgress)}% complete
                                </p>
                            </div>
                            <div className="max-w-md mx-auto">
                                <Progress value={importProgress} className="h-3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
                <Card className="border-2 border-gray-300 bg-gray-50/50">
                    <CardContent className="py-12">
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-bold text-2xl text-gray-900 mb-2">Import Berhasil!</p>
                                <p className="text-muted-foreground">
                                    {importResults.success} items berhasil diimport
                                    {importResults.failed > 0 && `, ${importResults.failed} items gagal`}
                                </p>
                            </div>
                            <Button onClick={onCancel} size="lg">
                                Selesai
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

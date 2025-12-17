'use client'

import { AlertCircle, CheckCircle2, Download, FileText, Upload } from '@/components/icons'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { handleError } from '@/lib/error-handling'
import { generateTemplate, parseCSV, type CSVParseResult } from '@/lib/import-export/csv-handler'
import { useRef, useState } from 'react'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  templateHeaders: string[]
  templateFilename: string
  onImport: (data: unknown[]) => Promise<{ success: boolean; message: string }>
}

export function ImportDialog({
  open,
  onOpenChange,
  title,
  templateHeaders,
  templateFilename,
  onImport,
}: ImportDialogProps): JSX.Element {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [parseResult, setParseResult] = useState<CSVParseResult<unknown> | null>(null)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setParseResult(null)
      setImportResult(null)
    }
  }

  const handleParse = async (): Promise<void> => {
    if (!file) return

    setParsing(true)
    try {
      const result = await parseCSV<unknown>(file, templateHeaders)
      setParseResult(result)
    } catch (error) {
      handleError(error, 'Import Dialog: Parse CSV', true, 'Gagal memproses file CSV. Pastikan format file sudah benar.')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    if (!parseResult || parseResult.data.length === 0) return

    setImporting(true)
    try {
      const result = await onImport(parseResult.data)
      setImportResult(result)

      if (result.success) {
        setTimeout(() => {
          onOpenChange(false)
          resetState()
        }, 2000)
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
      })
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = (): void => {
    const template = generateTemplate(templateHeaders)
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = templateFilename
    link.click()
    URL.revokeObjectURL(url)
  }

  const resetState = (): void => {
    setFile(null)
    setParseResult(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Download template CSV untuk memastikan format yang benar
              <Button
                variant="link"
                size="sm"
                className="ml-2 h-auto p-0"
                onClick={handleDownloadTemplate}
              >
                <Download className="h-3 w-3 mr-1" />
                Download Template
              </Button>
            </AlertDescription>
          </Alert>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : 'Click to upload CSV file'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Maximum 1000 rows</p>
            </label>
          </div>

          {/* Parse Button */}
          {file && !parseResult && (
            <Button onClick={handleParse} disabled={parsing} className="w-full">
              {parsing ? 'Parsing...' : 'Validate CSV'}
            </Button>
          )}

          {/* Parse Results */}
          {parseResult && (
            <div className="space-y-3">
              <Alert variant={parseResult.errors.length > 0 ? 'destructive' : 'default'}>
                {parseResult.errors.length === 0 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div className="space-y-1">
                    <p>Total rows: {parseResult.meta.totalRows}</p>
                    <p>Valid rows: {parseResult.meta.validRows}</p>
                    {parseResult.meta.invalidRows > 0 && (
                      <p>Invalid rows: {parseResult.meta.invalidRows}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {parseResult.errors.slice(0, 10).map((error, index) => (
                    <p key={index} className="text-xs text-destructive">
                      Row {error.row}, {error.field}: {error.message}
                    </p>
                  ))}
                  {parseResult.errors.length > 10 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {parseResult.errors.length - 10} more errors
                    </p>
                  )}
                </div>
              )}

              {/* Import Button */}
              {parseResult.data.length > 0 && (
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : `Import ${parseResult.data.length} rows`}
                </Button>
              )}
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="space-y-2">
              <Progress value={50} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">Importing data...</p>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <Alert variant={importResult.success ? 'default' : 'destructive'}>
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{importResult.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

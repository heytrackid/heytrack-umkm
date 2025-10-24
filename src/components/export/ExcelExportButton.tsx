'use client'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { apiLogger } from '@/lib/logger'
import {
    AlertCircle,
    BarChart3,
    Building,
    CheckCircle,
    Download,
    Factory,
    FileSpreadsheet,
    Loader2,
    Package,
    Receipt,
    Sheet,
    ShoppingCart,
    Users,
    Utensils
} from 'lucide-react'
import { useState } from 'react'
// Dynamic import of export service to reduce bundle size
const loadExportService = () => import('@/services/excel-export-lazy.service').then(m => m.LazyExcelExportService)

interface ExcelExportButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const exportSheets = [
  { name: 'Resep', icon: Utensils, description: 'Data resep produk dan detail bahan', color: 'bg-orange-100 text-orange-800' },
  { name: 'Bahan Baku', icon: Package, description: 'Inventori bahan baku dan stok', color: 'bg-green-100 text-green-800' },
  { name: 'Pesanan', icon: ShoppingCart, description: 'Data pesanan pelanggan', color: 'bg-blue-100 text-blue-800' },
  { name: 'Pelanggan', icon: Users, description: 'Database pelanggan dan kontak', color: 'bg-purple-100 text-purple-800' },
  { name: 'Supplier', icon: Building, description: 'Data supplier dan vendor', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Inventori', icon: Sheet, description: 'Status inventori real-time', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Biaya Operasional', icon: Receipt, description: 'Pengeluaran dan biaya operasional', color: 'bg-red-100 text-red-800' },
  { name: 'Penjualan', icon: BarChart3, description: 'Data penjualan dan transaksi', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Batch Produksi', icon: Factory, description: 'Log produksi dan batch tracking', color: 'bg-cyan-100 text-cyan-800' }
]

import { memo } from 'react'

const ExcelExportButton = memo(function ExcelExportButton({ 
  className = '', 
  variant = 'default',
  size = 'md'
}: ExcelExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus('idle')

    try {
      // Dynamically load export service only when needed
      const ExcelExportService = await loadExportService()
      await ExcelExportService.exportAllData()
      setExportStatus('success')
      
      // Auto close dialog after 2 seconds if successful
      setTimeout(() => {
        setIsDialogOpen(false)
        setExportStatus('idle')
      }, 2000)
    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Export failed:')
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-8 px-3 text-sm'
      case 'lg': return 'h-12 px-6 text-lg'
      default: return 'h-10 px-4'
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          className={`${getButtonSize()} ${className}`}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-green-600" />
            Export Data ke Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Status */}
          {exportStatus !== 'idle' && (
            <Card className={`border-2 ${
              exportStatus === 'success' 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  {exportStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Export Berhasil!</p>
                        <p className="text-sm text-green-600">File Excel telah diunduh ke perangkat Anda</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Export Gagal</p>
                        <p className="text-sm text-red-600">Terjadi kesalahan saat mengekspor data. Silakan coba lagi.</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview Export</CardTitle>
              <CardDescription>
                Data berikut akan diekspor ke file Excel dengan sheet terpisah untuk setiap kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {exportSheets.map((sheet, index: number) => {
                  const Icon = sheet.icon
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-md ${sheet.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{sheet.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {sheet.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">
                    <Sheet className="h-3 w-3 mr-1" />
                    9 Sheets
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    📋 Semua Kolom
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    📊 Format Excel (.xlsx)
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    🔄 Data Real-time
                  </Badge>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Informasi File:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Format: Microsoft Excel (.xlsx)</li>
                    <li>• Setiap menu akan menjadi sheet terpisah</li>
                    <li>• Semua kolom akan diekspor tanpa penggabungan</li>
                    <li>• Nama file: HeyTrack-Export-{new Date().toISOString().split('T')[0]}.xlsx</li>
                    <li>• Data yang diekspor adalah data real-time saat ini</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              File akan otomatis terunduh setelah proses selesai
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isExporting}
              >
                Batal
              </Button>
              
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="min-w-32"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Sekarang
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default ExcelExportButton
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { RotateCcw, Save } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import to reduce bundle size
const ExcelExportButton = dynamic(
  () => import(/* webpackChunkName: "excel-export-button" */ '@/components/export/ExcelExportButton'),
  {
    ssr: false,
    loading: () => <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
  }
)

interface SettingsHeaderProps {
  isUnsavedChanges: boolean
  isSaving: boolean
  onSave: () => void
  onReset: () => void
}

export const SettingsHeader = ({ isUnsavedChanges, isSaving, onSave, onReset }: SettingsHeaderProps) => (
  <>
    {/* Breadcrumb */}
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <PrefetchLink href="/">Dashboard</PrefetchLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Pengaturan</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    {/* Header */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm md:text-base text-muted-foreground">Kelola konfigurasi aplikasi Anda</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <ExcelExportButton variant="outline" className="hidden sm:inline-flex" />
        {isUnsavedChanges && (
          <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs md:text-sm">
            Perubahan belum disimpan
          </Badge>
        )}
        <Button variant="outline" onClick={onReset} size="sm" className="flex-1 sm:flex-none">
          <RotateCcw className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
        <Button onClick={onSave} disabled={isSaving} size="sm" className="flex-1 sm:flex-none">
          <Save className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          <span className="sm:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
        </Button>
      </div>
    </div>
  </>
)

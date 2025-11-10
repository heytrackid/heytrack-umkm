import { Pencil, Trash2, Eye, MoreHorizontal, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { ComponentType } from 'react'


/**
 * Shared Status and Action Components
 * Reusable status badges, action buttons, and indicators
 */


// Status badge patterns for different entities
export const StatusBadges = {
  // Order statuses
  order: (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Menunggu', variant: 'secondary' as const, icon: Clock },
      'CONFIRMED': { label: 'Dikonfirmasi', variant: 'default' as const, icon: CheckCircle },
      'IN_PROGRESS': { label: 'Diproses', variant: 'default' as const, icon: Clock },
      'READY': { label: 'Siap Ambil', variant: 'default' as const, icon: CheckCircle },
      'DELIVERED': { label: 'Dikirim', variant: 'default' as const, icon: CheckCircle },
      'CANCELLED': { label: 'Dibatalkan', variant: 'destructive' as const, icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
      icon: AlertCircle
    }

    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  },

  // Ingredient stock status
  ingredient: (currentStock: number, minStock: number) => {
    if (currentStock <= 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Habis
        </Badge>
      )
    }

    if (currentStock <= minStock) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Stok Rendah
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Tersedia
      </Badge>
    )
  },

  // Generic boolean status
  boolean: (value: boolean, labels?: { true: string; false: string }) => {
    const { true: trueLabel = 'Aktif', false: falseLabel = 'Tidak Aktif' } = labels ?? {}

    return (
      <Badge variant={value ? 'default' : 'secondary'}>
        {value ? trueLabel : falseLabel}
      </Badge>
    )
  }
}

// Action button groups for tables/lists
interface ActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  onMore?: () => void
  size?: 'default' | 'lg' | 'sm'
  variant?: 'ghost' | 'outline'
  showLabels?: boolean
}

export const ActionButtons = ({
  onEdit,
  onDelete,
  onView,
  onMore,
  size = 'sm',
  variant = 'ghost',
  showLabels = false
}: ActionButtonsProps) => (
  <div className="flex gap-1">
    {onView && (
      <Button
        variant={variant}
        size={size}
        onClick={onView}
        title="Lihat Detail"
      >
        <Eye className="h-4 w-4" />
        {showLabels && <span className="ml-1">Lihat</span>}
      </Button>
    )}

    {onEdit && (
      <Button
        variant={variant}
        size={size}
        onClick={onEdit}
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
        {showLabels && <span className="ml-1">Ubah</span>}
      </Button>
    )}

    {onDelete && (
      <Button
        variant="ghost"
        size={size}
        onClick={onDelete}
        title="Hapus"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        {showLabels && <span className="ml-1">Hapus</span>}
      </Button>
    )}

    {onMore && (
      <Button
        variant={variant}
        size={size}
        onClick={onMore}
        title="Lebih Banyak Aksi"
      >
        <MoreHorizontal className="h-4 w-4" />
        {showLabels && <span className="ml-1">Lebih Banyak</span>}
      </Button>
    )}
  </div>
)

// Quick action buttons for common operations
export const QuickActions = {
  refresh: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
    >
      <svg className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Refresh
    </Button>
  ),

  add: ({ onClick, label = "Tambah", icon: Icon = Plus }: {
    onClick: () => void;
    label?: string;
    icon?: ComponentType<{ className?: string }>
  }) => (
    <Button onClick={onClick}>
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  ),

  save: ({ onClick, loading }: { onClick: () => void; loading?: boolean }) => (
    <Button onClick={onClick} disabled={loading}>
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Menyimpan...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Simpan
        </>
      )}
    </Button>
  )
}

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

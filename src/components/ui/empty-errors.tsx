'use client'

import { AlertTriangle, FileX, Search, Package, Users, ShoppingCart, Calculator, RefreshCw, Plus, Home } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { ComponentType } from 'react' 

// Empty state for different contexts
interface EmptyStateProps {
    icon?: ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  icon?: ComponentType<{ className?: string }>
  } | undefined
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  variant?: 'card' | 'default' | 'minimal'
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default'
}: EmptyStateProps) => {
  const content = (
    <div className="text-center py-12">
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {action && (
          <Button onClick={action.onClick}>
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )

  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="p-0">
          {content}
        </CardContent>
      </Card>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="text-center py-8">
        {Icon && (
          <Icon className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
        )}
        <h4 className="text-sm font-medium text-foreground mb-1">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </div>
    )
  }

  return content
}

// Predefined empty states for common scenarios
export const EmptyStates = {
  // No data found
  noData: (onRefresh?: () => void) => (
    <EmptyState
      icon={FileX}
      title="Tidak ada data"
      description="Belum ada data yang tersedia saat ini."
      action={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh,
        icon: RefreshCw
      } : undefined}
    />
  ),

  // No search results
  noSearchResults: (searchTerm: string, onClearSearch: () => void) => (
    <EmptyState
      icon={Search}
      title="Tidak ada hasil"
      description={`Tidak ditemukan hasil untuk "${searchTerm}". Coba kata kunci yang berbeda.`}
      action={{
        label: "Hapus Pencarian",
        onClick: onClearSearch
      }}
    />
  ),

  // No ingredients
  noIngredients: (onAdd?: () => void) => (
    <EmptyState
      icon={Package}
      title="Belum ada bahan baku"
      description="Tambahkan bahan baku pertama Anda untuk memulai pengelolaan inventori."
      action={onAdd ? {
        label: "Tambah Bahan Baku",
        onClick: onAdd,
        icon: Plus
      } : undefined}
    />
  ),

  // No customers
  noCustomers: (onAdd?: () => void) => (
    <EmptyState
      icon={Users}
      title="Belum ada pelanggan"
      description="Tambahkan data pelanggan pertama Anda untuk melacak pesanan dan riwayat pembelian."
      action={onAdd ? {
        label: "Tambah Pelanggan",
        onClick: onAdd,
        icon: Plus
      } : undefined}
    />
  ),

  // No orders
  noOrders: (onAdd?: () => void) => (
    <EmptyState
      icon={ShoppingCart}
      title="Belum ada pesanan"
      description="Belum ada pesanan yang tercatat. Mulai terima pesanan dari pelanggan."
      action={onAdd ? {
        label: "Buat Pesanan Baru",
        onClick: onAdd,
        icon: Plus
      } : undefined}
    />
  ),

  // No recipes
  noRecipes: (onAdd?: () => void) => (
    <EmptyState
      icon={Calculator}
      title="Belum ada resep"
      description="Buat resep pertama Anda untuk mulai menghitung HPP dan strategi pricing."
      action={onAdd ? {
        label: "Buat Resep Baru",
        onClick: onAdd,
        icon: Plus
      } : undefined}
      secondaryAction={{
        label: "Pelajari Lebih Lanjut",
        onClick: () => window.open('/docs/recipes', '_blank')
      }}
    />
  ),

  // Page not found
  notFound: (onGoHome?: () => void) => (
    <EmptyState
      icon={AlertTriangle}
      title="Halaman tidak ditemukan"
      description="Halaman yang Anda cari tidak tersedia atau telah dipindahkan."
      action={onGoHome ? {
        label: "Kembali ke Beranda",
        onClick: onGoHome,
        icon: Home
      } : undefined}
    />
  )
}

// Error state components
interface ErrorStateProps {
  title?: string | undefined
  message: string
  onRetry?: (() => void) | undefined
  showHomeButton?: boolean | undefined
  variant?: 'inline' | 'page' | 'section' | undefined
}

export const ErrorState = ({
  title = "Terjadi Kesalahan",
  message,
  onRetry,
  showHomeButton = false,
  variant = 'page'
}: ErrorStateProps) => {
  const router = useRouter()
  const content = (
    <div className="text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        )}

        {showHomeButton && (
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        )}
      </div>
    </div>
  )

  if (variant === 'page') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    )
  }

  if (variant === 'section') {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          {content}
        </CardContent>
      </Card>
    )
  }

  // inline variant
  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>{message}</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

// Network error state
export const NetworkError = ({ onRetry }: { onRetry?: () => void }) => (
    <ErrorState
      title="Koneksi Terputus"
      message="Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
      onRetry={onRetry}
      showHomeButton
    />
  )

// Permission denied error
export const PermissionError = ({ resource = "halaman ini" }: { resource?: string }) => (
    <ErrorState
      title="Akses Ditolak"
      message={`Anda tidak memiliki izin untuk mengakses ${resource}.`}
      showHomeButton
      variant="page"
    />
  )

// Import React for types

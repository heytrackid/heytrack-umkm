/**
 * Empty State Component
 * Beautiful empty states for better first-time user experience
 */

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Button } from './button'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="rounded-full bg-muted/50 p-6 mb-4 ring-8 ring-muted/20">
        <div className="text-muted-foreground">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md">
        {description}
      </p>
      {action}
    </div>
  )
}

// Preset empty states for common scenarios
export function EmptyIngredients({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>}
      title="Belum ada bahan baku"
      description="Mulai dengan menambahkan bahan baku pertama Anda untuk memulai tracking inventory"
      action={onAdd && (
        <Button onClick={onAdd}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Bahan Baku
        </Button>
      )}
    />
  )
}

export function EmptyOrders({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>}
      title="Belum ada pesanan"
      description="Pesanan dari pelanggan akan muncul di sini. Buat pesanan pertama Anda sekarang!"
      action={onAdd && (
        <Button onClick={onAdd}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Pesanan
        </Button>
      )}
    />
  )
}

export function EmptyCustomers({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>}
      title="Belum ada pelanggan"
      description="Tambahkan pelanggan untuk melacak pesanan dan riwayat pembelian mereka"
      action={onAdd && (
        <Button onClick={onAdd}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pelanggan
        </Button>
      )}
    />
  )
}

export function EmptyRecipes({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>}
      title="Belum ada resep"
      description="Buat resep pertama Anda dengan menambahkan bahan-bahan dan langkah pembuatan"
      action={onAdd && (
        <Button onClick={onAdd}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Resep
        </Button>
      )}
    />
  )
}

export function EmptyData({ 
  title = "Tidak ada data",
  description = "Data akan muncul di sini setelah Anda menambahkannya",
  icon
}: { 
  title?: string
  description?: string
  icon?: ReactNode
}) {
  return (
    <EmptyState
      icon={icon || <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>}
      title={title}
      description={description}
    />
  )
}

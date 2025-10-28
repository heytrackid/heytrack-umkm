/**
 * Enhanced Toast Notifications for Ingredients
 * 
 * Provides specific, actionable feedback for ingredient operations
 */

import type { ToastActionElement } from '@/components/ui/toast'

interface ToastOptions {
  title: string
  description: string
  variant?: 'default' | 'destructive'
  action?: ToastActionElement
}

/**
 * Success toast for ingredient creation
 */
export const ingredientCreatedToast = (name: string): ToastOptions => ({
  title: '✅ Bahan Baku Ditambahkan',
  description: `"${name}" berhasil ditambahkan ke daftar bahan baku`,
  variant: 'default'
})

/**
 * Success toast for ingredient update
 */
export const ingredientUpdatedToast = (name: string, changes?: string[]): ToastOptions => {
  const changesText = changes && changes.length > 0
    ? ` (${changes.join(', ')} diperbarui)`
    : ''
  
  return {
    title: '✅ Bahan Baku Diperbarui',
    description: `"${name}" berhasil diperbarui${changesText}`,
    variant: 'default'
  }
}

/**
 * Success toast for ingredient deletion
 */
export const ingredientDeletedToast = (name: string, onUndo?: () => void): ToastOptions => ({
  title: '🗑️ Bahan Baku Dihapus',
  description: `"${name}" telah dihapus dari daftar`,
  variant: 'default',
  action: onUndo ? {
    altText: 'Undo',
    onClick: onUndo,
    children: 'Batalkan'
  } as ToastActionElement : undefined
})

/**
 * Error toast for duplicate name
 */
export const duplicateNameErrorToast = (name: string): ToastOptions => ({
  title: '❌ Nama Sudah Digunakan',
  description: `Bahan baku dengan nama "${name}" sudah ada. Gunakan nama yang berbeda.`,
  variant: 'destructive'
})

/**
 * Error toast for validation failure
 */
export const validationErrorToast = (field: string, message: string): ToastOptions => ({
  title: '⚠️ Validasi Gagal',
  description: `${field}: ${message}`,
  variant: 'destructive'
})

/**
 * Error toast for low stock
 */
export const lowStockWarningToast = (name: string, current: number, min: number, unit: string): ToastOptions => ({
  title: '⚠️ Stok Rendah',
  description: `"${name}" mencapai batas minimum (${current}/${min} ${unit}). Pertimbangkan untuk melakukan pemesanan.`,
  variant: 'default'
})

/**
 * Error toast for out of stock
 */
export const outOfStockErrorToast = (name: string): ToastOptions => ({
  title: '❌ Stok Habis',
  description: `"${name}" sudah habis. Segera lakukan pembelian untuk menghindari gangguan produksi.`,
  variant: 'destructive'
})

/**
 * Generic error toast
 */
export const genericErrorToast = (operation: string, error?: string): ToastOptions => ({
  title: '❌ Terjadi Kesalahan',
  description: error || `Gagal ${operation}. Silakan coba lagi atau hubungi support jika masalah berlanjut.`,
  variant: 'destructive'
})

/**
 * Loading toast for async operations
 */
export const loadingToast = (operation: string): ToastOptions => ({
  title: '⏳ Memproses...',
  description: `Sedang ${operation}. Mohon tunggu sebentar.`,
  variant: 'default'
})

/**
 * Bulk operation success toast
 */
export const bulkOperationSuccessToast = (count: number, operation: string): ToastOptions => ({
  title: '✅ Operasi Berhasil',
  description: `${count} bahan baku berhasil ${operation}`,
  variant: 'default'
})

/**
 * Bulk operation error toast
 */
export const bulkOperationErrorToast = (count: number, operation: string): ToastOptions => ({
  title: '❌ Operasi Gagal',
  description: `Gagal ${operation} ${count} bahan baku. Silakan coba lagi.`,
  variant: 'destructive'
})

/**
 * Import success toast
 */
export const importSuccessToast = (count: number, skipped?: number): ToastOptions => {
  const skippedText = skipped && skipped > 0 ? ` (${skipped} dilewati)` : ''
  return {
    title: '✅ Import Berhasil',
    description: `${count} bahan baku berhasil diimport${skippedText}`,
    variant: 'default'
  }
}

/**
 * Export success toast
 */
export const exportSuccessToast = (count: number, format = 'CSV'): ToastOptions => ({
  title: '✅ Export Berhasil',
  description: `${count} bahan baku berhasil di-export ke ${format}`,
  variant: 'default'
})

/**
 * Network error toast
 */
export const networkErrorToast = (): ToastOptions => ({
  title: '🌐 Koneksi Bermasalah',
  description: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  variant: 'destructive'
})

/**
 * Permission error toast
 */
export const permissionErrorToast = (): ToastOptions => ({
  title: '🔒 Akses Ditolak',
  description: 'Anda tidak memiliki izin untuk melakukan operasi ini.',
  variant: 'destructive'
})

/**
 * Session expired toast
 */
export const sessionExpiredToast = (): ToastOptions => ({
  title: '⏰ Sesi Berakhir',
  description: 'Sesi Anda telah berakhir. Silakan login kembali.',
  variant: 'destructive'
})

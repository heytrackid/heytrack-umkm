import { toast } from '@/hooks/use-toast'

/**
 * Standardized toast notifications with consistent styling and icons
 */

interface ToastAction {
  label: string
  onClick: () => void
}

export const showSuccess = (
  message: string, 
  title = 'Berhasil',
  _action?: ToastAction // Prefix with _ to indicate unused for now
) => {
  toast({
    title: `✅ ${title}`,
    description: message,
    duration: 5000, // Increased from 3000
    // Note: Action button requires TSX/JSX, will be implemented in component level
  })
}

export const showError = (message: string, title = 'Error') => {
  toast({
    title: `❌ ${title}`,
    description: message,
    variant: 'destructive',
    duration: 5000,
  })
}

export const showWarning = (message: string, title = 'Perhatian') => {
  toast({
    title: `⚠️ ${title}`,
    description: message,
    duration: 4000,
  })
}

export const showInfo = (message: string, title = 'Info') => {
  toast({
    title: `ℹ️ ${title}`,
    description: message,
    duration: 3000,
  })
}

export const showLoading = (message: string, title = 'Loading') => {
  toast({
    title: `⏳ ${title}`,
    description: message,
    duration: 2000,
  })
}

// Specialized toasts with celebrations
export const showSaveSuccess = (itemName?: string, action?: ToastAction) => {
  showSuccess(
    itemName 
      ? `${itemName} berhasil disimpan! 🎉` 
      : 'Data berhasil disimpan! 🎉',
    'Berhasil',
    action
  )
}

export const showDeleteSuccess = (itemName?: string) => {
  showSuccess(
    itemName 
      ? `${itemName} berhasil dihapus` 
      : 'Data berhasil dihapus',
    'Berhasil'
  )
}

export const showUpdateSuccess = (itemName?: string, action?: ToastAction) => {
  showSuccess(
    itemName 
      ? `${itemName} berhasil diperbarui! ✨` 
      : 'Data berhasil diperbarui! ✨',
    'Berhasil',
    action
  )
}

export const showOrderSuccess = (orderNo: string, action?: ToastAction) => {
  showSuccess(
    `Pesanan ${orderNo} berhasil dibuat! 🎊`,
    'Pesanan Berhasil',
    action
  )
}

export const showPaymentSuccess = (amount: string) => {
  showSuccess(
    `Pembayaran ${amount} berhasil diterima! 💰`,
    'Pembayaran Berhasil'
  )
}

export const showSaveError = (error?: string) => {
  showError(error || 'Gagal menyimpan data. Silakan coba lagi.')
}

export const showDeleteError = (error?: string) => {
  showError(error || 'Gagal menghapus data. Silakan coba lagi.')
}

export const showNetworkError = () => {
  showError('Koneksi internet bermasalah. Periksa koneksi Anda.', 'Koneksi Error')
}

export const showAuthError = () => {
  showError('Sesi Anda telah berakhir. Silakan login kembali.', 'Sesi Berakhir')
}

export const showValidationError = (message: string) => {
  showWarning(message, 'Validasi Error')
}

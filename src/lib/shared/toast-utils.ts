import type { useToast } from '@/hooks/use-toast'


/**
 * Shared Toast Utilities
 * Consistent toast notification patterns across the application
 */


// Toast presets for common actions
export const TOAST_PRESETS = {
  SUCCESS: {
    title: 'Berhasil',
    description: 'Operasi berhasil dilakukan',
    variant: 'default' as const
  },
  ERROR: {
    title: 'Error',
    description: 'Terjadi kesalahan yang tidak terduga',
    variant: 'destructive' as const
  },
  WARNING: {
    title: 'Peringatan',
    description: 'Periksa kembali data yang dimasukkan',
    variant: 'default' as const
  },
  INFO: {
    title: 'Informasi',
    description: 'Informasi penting untuk Anda',
    variant: 'default' as const
  }
} as const

// CRUD operation toasts
export const CRUD_TOASTS = {
  CREATE_SUCCESS: {
    title: 'Berhasil Ditambahkan',
    description: 'Data baru berhasil ditambahkan',
  },
  UPDATE_SUCCESS: {
    title: 'Berhasil Diperbarui',
    description: 'Data berhasil diperbarui',
  },
  DELETE_SUCCESS: {
    title: 'Berhasil Dihapus',
    description: 'Data berhasil dihapus',
  },
  CREATE_ERROR: {
    title: 'Gagal Menambah',
    description: 'Gagal menambahkan data baru',
    variant: 'destructive' as const
  },
  UPDATE_ERROR: {
    title: 'Gagal Memperbarui',
    description: 'Gagal memperbarui data',
    variant: 'destructive' as const
  },
  DELETE_ERROR: {
    title: 'Gagal Menghapus',
    description: 'Gagal menghapus data',
    variant: 'destructive' as const
  }
} as const

// Form submission toasts
export const FORM_TOASTS = {
  SUBMIT_SUCCESS: {
    title: 'Form Berhasil',
    description: 'Data form berhasil disimpan'
  },
  SUBMIT_ERROR: {
    title: 'Form Gagal',
    description: 'Gagal menyimpan data form',
    variant: 'destructive' as const
  },
  VALIDATION_ERROR: {
    title: 'Validasi Error',
    description: 'Periksa kembali field yang diisi',
    variant: 'destructive' as const
  }
} as const

// API operation toasts
export const API_TOASTS = {
  LOADING: {
    title: 'Memproses',
    description: 'Mohon tunggu sebentar...'
  },
  NETWORK_ERROR: {
    title: 'Koneksi Error',
    description: 'Periksa koneksi internet Anda',
    variant: 'destructive' as const
  },
  SERVER_ERROR: {
    title: 'Server Error',
    description: 'Server sedang mengalami masalah',
    variant: 'destructive' as const
  },
  UNAUTHORIZED: {
    title: 'Tidak Diizinkan',
    description: 'Anda tidak memiliki akses untuk operasi ini',
    variant: 'destructive' as const
  }
} as const

// Toast utility functions
export function showSuccessToast(
  toast: ReturnType<typeof useToast>['toast'],
  title?: string,
  description?: string
) {
  toast({
    title: title ?? TOAST_PRESETS.SUCCESS.title,
    description: description ?? TOAST_PRESETS.SUCCESS.description,
    variant: TOAST_PRESETS.SUCCESS.variant
  })
}

export function showErrorToast(
  toast: ReturnType<typeof useToast>['toast'],
  title?: string,
  description?: string
) {
  toast({
    title: title ?? TOAST_PRESETS.ERROR.title,
    description: description ?? TOAST_PRESETS.ERROR.description,
    variant: TOAST_PRESETS.ERROR.variant
  })
}

export function showWarningToast(
  toast: ReturnType<typeof useToast>['toast'],
  title?: string,
  description?: string
) {
  toast({
    title: title ?? TOAST_PRESETS.WARNING.title,
    description: description ?? TOAST_PRESETS.WARNING.description,
    variant: TOAST_PRESETS.WARNING.variant
  })
}

// CRUD operation helpers
export function showCrudSuccessToast(
  toast: ReturnType<typeof useToast>['toast'],
  operation: 'create' | 'delete' | 'update',
  entityName: string
) {
  const operationMap = {
    create: CRUD_TOASTS.CREATE_SUCCESS,
    update: CRUD_TOASTS.UPDATE_SUCCESS,
    delete: CRUD_TOASTS.DELETE_SUCCESS
  }

  const preset = operationMap[operation]
  toast({
    title: preset.title,
    description: `${entityName} ${preset.description.toLowerCase()}`,
  })
}

export function showCrudErrorToast(
  toast: ReturnType<typeof useToast>['toast'],
  operation: 'create' | 'delete' | 'update',
  entityName: string
) {
  const operationMap = {
    create: CRUD_TOASTS.CREATE_ERROR,
    update: CRUD_TOASTS.UPDATE_ERROR,
    delete: CRUD_TOASTS.DELETE_ERROR
  }

  const preset = operationMap[operation]
  toast({
    title: preset.title,
    description: `Gagal ${operation} ${entityName.toLowerCase()}`,
    variant: preset.variant
  })
}

// Form submission helpers
export function showFormSuccessToast(
  toast: ReturnType<typeof useToast>['toast'],
  message?: string
) {
  toast({
    title: FORM_TOASTS.SUBMIT_SUCCESS.title,
    description: message ?? FORM_TOASTS.SUBMIT_SUCCESS.description
  })
}

export function showFormErrorToast(
  toast: ReturnType<typeof useToast>['toast'],
  message?: string
) {
  toast({
    title: FORM_TOASTS.SUBMIT_ERROR.title,
    description: message ?? FORM_TOASTS.SUBMIT_ERROR.description,
    variant: FORM_TOASTS.SUBMIT_ERROR.variant
  })
}

// Loading state helpers
export function showLoadingToast(
  toast: ReturnType<typeof useToast>['toast'],
  message?: string
) {
  return toast({
    title: API_TOASTS.LOADING.title,
    description: message ?? API_TOASTS.LOADING.description,
  })
}

// Async operation wrapper with toast feedback
export async function withToastFeedback<T>(
  operation: () => Promise<T>,
  toast: ReturnType<typeof useToast>['toast'],
  options: {
    loadingMessage?: string
    successMessage?: string
    errorMessage?: string
    onSuccess?: (result: T) => void
    onError?: (error: Error) => void
  } = {}
): Promise<T | null> {
  const {
    loadingMessage,
    successMessage,
    errorMessage,
    onSuccess,
    onError
  } = options

  // Show loading toast
  const loadingToast = showLoadingToast(toast, loadingMessage)

  try {
    const result = await operation()

    // Dismiss loading toast
    loadingToast.dismiss()

    // Show success toast
    showSuccessToast(toast, 'Berhasil', successMessage)

    onSuccess?.(result)
    return result
  } catch (error) {
    // Dismiss loading toast
    loadingToast.dismiss()

    // Show error toast
    const errorMsg = error instanceof Error ? error.message : errorMessage
    showErrorToast(toast, 'Error', errorMsg)

    onError?.(error as Error)
    return null
  }
}

// Batch operation feedback
export function showBatchResultToast(
  toast: ReturnType<typeof useToast>['toast'],
  successful: number,
  failed: number,
  operation: string
) {
  if (failed === 0) {
    toast({
      title: 'Batch Berhasil',
      description: `${operation} berhasil untuk ${successful} item`,
    })
  } else if (successful === 0) {
    toast({
      title: 'Batch Gagal',
      description: `Semua ${failed} ${operation} gagal`,
      variant: 'destructive'
    })
  } else {
    toast({
      title: 'Batch Selesai dengan Peringatan',
      description: `${successful} berhasil, ${failed} gagal`,
      variant: 'destructive'
    })
  }
}

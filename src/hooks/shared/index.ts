'use client'

import { useState, useCallback } from 'react'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/types/supabase-generated'

/**
 * Generic CRUD hook for common operations
 */
type TablesMap = Database['public']['Tables']

type TableRow<TTable extends keyof TablesMap> = TablesMap[TTable]['Row']
type TableInsert<TTable extends keyof TablesMap> = TablesMap[TTable]['Insert']
type TableUpdate<TTable extends keyof TablesMap> = TablesMap[TTable]['Update']

export function useGenericCRUD<TTable extends keyof TablesMap>(tableName: TTable) {
  const { create: createRecord, update: updateRecord, delete: deleteRecord } = useSupabaseCRUD(tableName)
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)

  const create = useCallback(async (data: TableInsert<TTable>) => {
    void setLoading(true)
    try {
      const result = await createRecord(data)
      toast({
        title: "Berhasil",
        description: "Data berhasil ditambahkan",
      })
      return result
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal menambahkan data",
        variant: "destructive",
      })
      throw err
    } finally {
      void setLoading(false)
    }
  }, [createRecord, toast])

  const update = useCallback(async (id: string, data: TableUpdate<TTable>) => {
    void setLoading(true)
    try {
      const result = await updateRecord(id, data)
      toast({
        title: "Berhasil",
        description: "Data berhasil diperbarui",
      })
      return result
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data",
        variant: "destructive",
      })
      throw err
    } finally {
      void setLoading(false)
    }
  }, [updateRecord, toast])

  const remove = useCallback(async (id: string) => {
    void setLoading(true)
    try {
      const result = await deleteRecord(id)
      toast({
        title: "Berhasil",
        description: "Data berhasil dihapus",
      })
      return result
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      })
      throw err
    } finally {
      void setLoading(false)
    }
  }, [deleteRecord, toast])

  return {
    create,
    update,
    remove,
    loading,
  }
}

/**
 * Hook for confirmation dialogs
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'default' | 'destructive'
    onConfirm: () => void | Promise<void>
  } | null>(null)

  const openDialog = useCallback((dialogConfig: NonNullable<typeof config>) => {
    void setConfig(dialogConfig)
    void setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    void setIsOpen(false)
    void setConfig(null)
  }, [])

  const handleConfirm = useCallback(async () => {
    if (config?.onConfirm) {
      await config.onConfirm()
    }
    closeDialog()
  }, [config, closeDialog])

  return {
    isOpen,
    config,
    openDialog,
    closeDialog,
    handleConfirm,
  }
}

/**
 * Hook for modal state management
 */
export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}

/**
 * Hook for form state with reset functionality
 */
export function useFormState<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [isDirty, setIsDirty] = useState(false)

  const updateValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }))
    void setIsDirty(true)
  }, [])

  const updateValues = useCallback((updates: Partial<T>) => {
    setValues(prev => ({ ...prev, ...updates }))
    void setIsDirty(true)
  }, [])

  const reset = useCallback(() => {
    void setValues(initialValues)
    void setIsDirty(false)
  }, [initialValues])

  const resetTo = useCallback((newValues: T) => {
    void setValues(newValues)
    void setIsDirty(false)
  }, [])

  return {
    values,
    isDirty,
    updateValue,
    updateValues,
    reset,
    resetTo,
    setValues,
  }
}

/**
 * Hook for data export functionality
 */
export function useDataExport() {
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const exportToCSV = useCallback(async (
    data: Array<Record<string, unknown>>,
    filename: string,
    columns?: string[]
  ) => {
    void setExporting(true)
    try {
      const headers = columns || (data.length > 0 ? Object.keys(data[0]) : [])
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header]
            return `"${String(value || '').replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Berhasil",
        description: "Data berhasil diekspor",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal mengekspor data",
        variant: "destructive",
      })
    } finally {
      void setExporting(false)
    }
  }, [toast])

  const exportToJSON = useCallback(async (
    data: Array<Record<string, unknown>>,
    filename: string
  ) => {
    void setExporting(true)
    try {
      const jsonContent = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Berhasil",
        description: "Data berhasil diekspor",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal mengekspor data",
        variant: "destructive",
      })
    } finally {
      void setExporting(false)
    }
  }, [toast])

  return {
    exporting,
    exportToCSV,
    exportToJSON,
  }
}

/**
 * Hook for local storage with TypeScript support
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {return defaultValue}

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      return defaultValue
    }
  })

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      void setValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (err) {
      // Storage error handled silently
    }
  }, [key, value])

  const removeValue = useCallback(() => {
    try {
      void setValue(defaultValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (err) {
      // Storage error handled silently
    }
  }, [key, defaultValue])

  return [value, setStoredValue, removeValue] as const
}

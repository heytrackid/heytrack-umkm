'use client'

import { useCallback, useState } from 'react'








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
    onConfirm: () => Promise<void> | void
  } | null>(null)

  const openDialog = useCallback((dialogConfig: NonNullable<typeof config>) => {
    setConfig(dialogConfig)
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setConfig(null)
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
    setIsDirty(true)
  }, [])

  const updateValues = useCallback((updates: Partial<T>) => {
    setValues(prev => ({ ...prev, ...updates }))
    setIsDirty(true)
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setIsDirty(false)
  }, [initialValues])

  const resetTo = useCallback((newValues: T) => {
    setValues(newValues)
    setIsDirty(false)
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
 * Hook for local storage with TypeScript support
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {return defaultValue}

    try {
      const item = window.localStorage.getItem(key)
       
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue
      setValue(valueToStore)

       if (typeof window !== 'undefined') {
         window.localStorage.setItem(key, JSON.stringify(valueToStore))
       }
     } catch {
       // Storage error handled silently
     }
  }, [key, value])

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue)
       if (typeof window !== 'undefined') {
         window.localStorage.removeItem(key)
       }
     } catch {
       // Storage error handled silently
     }
  }, [key, defaultValue])

  return [value, setStoredValue, removeValue] as const
}

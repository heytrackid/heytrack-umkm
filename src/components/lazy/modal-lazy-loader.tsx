'use client'
import * as React from 'react'

import { lazy, Suspense, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

// Modal Loading Skeleton
const ModalLoadingSkeleton = ({ title }: { title?: string }) => (
  <div className="space-y-4">
    {title && <Skeleton className="h-6 w-64" />}
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="flex justify-end gap-2 pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

// Form Loading Skeleton
const FormLoadingSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }, (_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end gap-2 pt-4">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

// Lazy loaded form components
export const LazyIngredientForm = lazy(() => 
  import('@/components').then(m => ({ default: m.IngredientForm }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

export const LazyOrderForm = lazy(() => 
  import('@/components').then(m => ({ default: m.OrderForm }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

export const LazyCustomerForm = lazy(() => 
  import('@/components').then(m => ({ default: m.CustomerForm }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

export const LazyRecipeForm = lazy(() => 
  import('@/components').then(m => ({ default: m.RecipeForm }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

export const LazyFinanceForm = lazy(() => 
  import('@/components').then(m => ({ default: m.FinanceForm }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

// Lazy loaded detail/view components
export const LazyOrderDetail = lazy(() => 
  import('@/components').then(m => ({ default: m.OrderDetail }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

export const LazyCustomerDetail = lazy(() => 
  import('@/components').then(m => ({ default: m.CustomerDetail }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

export const LazyInventoryDetail = lazy(() => 
  import('@/components').then(m => ({ default: m.InventoryDetail }))
    .catch(() => ({ default: () => {
      return <div>Informasi</div>;
    }}))
)

// Lazy Modal Wrapper Component
interface LazyModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  component: 'ingredient-form' | 'order-form' | 'customer-form' | 'recipe-form' | 'finance-form' |
             'order-detail' | 'customer-detail' | 'inventory-detail'
  props?: any
  size?: 'sm' | 'md' | 'lg' | 'xl'
  mobile?: boolean
}

export const LazyModal = ({ 
  isOpen, 
  onClose, 
  title, 
  component, 
  props = {}, 
  size = 'md',
  mobile = false 
}: LazyModalProps) => {
  
  const getComponent = () => {
    switch (component) {
      case 'ingredient-form': return LazyIngredientForm
      case 'order-form': return LazyOrderForm
      case 'customer-form': return LazyCustomerForm
      case 'recipe-form': return LazyRecipeForm
      case 'finance-form': return LazyFinanceForm
      case 'order-detail': return LazyOrderDetail
      case 'customer-detail': return LazyCustomerDetail
      case 'inventory-detail': return LazyInventoryDetail
      default: return () => <div>Informasi</div>
    }
  }

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-md'
      case 'md': return 'max-w-lg'
      case 'lg': return 'max-w-2xl'
      case 'xl': return 'max-w-4xl'
      default: return 'max-w-lg'
    }
  }

  const Component = getComponent()
  const isFormComponent = component.includes('form')
  
  if (mobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh]">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Suspense fallback={
              isFormComponent ? <FormLoadingSkeleton /> : <ModalLoadingSkeleton title={title} />
            }>
              <Component {...props} onClose={onClose} />
            </Suspense>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={getSizeClass()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Suspense fallback={
          isFormComponent ? <FormLoadingSkeleton /> : <ModalLoadingSkeleton title={title} />
        }>
          <Component {...props} onClose={onClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}

// Hook for lazy modal management
export const useLazyModal = () => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    component: LazyModalProps['component'] | null
    title: string
    props: unknown
    size: LazyModalProps['size']
  }>({
    isOpen: false,
    component: null,
    title: '',
    props: {},
    size: 'md'
  })

  const openModal = useCallback((
    component: LazyModalProps['component'],
    title: string,
    props: { [key: string]: unknown } = {},
    size: LazyModalProps['size'] = 'md'
  ) => {
    setModalState({
      isOpen: true,
      component,
      title,
      props,
      size
    })
  }, [])

  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const ModalRenderer = useCallback(() => {
    if (!modalState.component) {return null}

    return (
      <LazyModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        component={modalState.component}
        props={modalState.props}
        size={modalState.size}
      />
    )
  }, [modalState, closeModal])

  return {
    openModal,
    closeModal,
    ModalRenderer,
    isOpen: modalState.isOpen
  }
}

// Preloader for modal components
export const preloadModalComponent = (component: LazyModalProps['component']) => {
  switch (component) {
    case 'ingredient-form': return import('@/components')
    case 'order-form': return import('@/components')
    case 'customer-form': return import('@/components')
    case 'recipe-form': return import('@/components')
    case 'finance-form': return import('@/components')
    case 'order-detail': return import('@/components')
    case 'customer-detail': return import('@/components')
    case 'inventory-detail': return import('@/components')
    default: return Promise.resolve()
  }
}

// Bulk Modal Components (for multiple items)
export const LazyBulkActionModal = lazy(() => 
  import('@/components').then(m => ({ default: m.BulkActionModal }))
    .catch(() => ({ default: () => <div>Bulk action modal not available</div> }))
)

export const LazyConfirmationModal = lazy(() => 
  import('@/components').then(m => ({ default: m.ConfirmationModal }))
    .catch(() => ({ default: () => <div>Confirmation modal not available</div> }))
)

export const LazyExportModal = lazy(() => 
  import('@/components').then(m => ({ default: m.ExportModal }))
    .catch(() => ({ default: () => <div>Export modal not available</div> }))
)

// Specialized modal hooks
export const useConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title: string
    message: string
    onConfirm: () => void
    confirmText?: string
    cancelText?: string
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  })

  const showConfirmation = (newConfig: typeof config) => {
    setConfig(newConfig)
    setIsOpen(true)
  }

  const hideConfirmation = () => {
    setIsOpen(false)
  }

  const ConfirmationModalRenderer = () => (
    <Dialog open={isOpen} onOpenChange={hideConfirmation}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<ModalLoadingSkeleton />}>
          <LazyConfirmationModal
            {...config}
            onClose={hideConfirmation}
            onConfirm={() => {
              config.onConfirm()
              hideConfirmation()
            }}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationModalRenderer,
    isOpen
  }
}

// Progressive modal loading strategy
export const ModalLoadingStrategy = {
  // Essential modals (preload immediately)
  essential: ['confirmation-modal'],
  
  // Form modals (load when user clicks "Add" button)
  forms: ['ingredient-form', 'order-form', 'customer-form', 'recipe-form', 'finance-form'],
  
  // Detail modals (load when user clicks "View" button)
  details: ['order-detail', 'customer-detail', 'inventory-detail'],
  
  // Advanced modals (load on demand)
  advanced: ['bulk-action-modal', 'export-modal'],
}
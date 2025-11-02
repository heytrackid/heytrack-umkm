'use client'

import { lazy, Suspense, useState, useCallback, type ComponentType } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import(/* webpackChunkName: "modal-customer-form" */ '@/components/forms/CustomerForm').then(m => ({ default: m.CustomerForm }))



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

// Lazy loaded form components - Placeholder implementations
// These components don't exist yet in @/components, so we provide fallbacks
const FormPlaceholder = () => <div className="p-4 text-center text-muted-foreground">Form component not available</div>
const DetailPlaceholder = () => <div className="p-4 text-center text-muted-foreground">Detail view not available</div>

export const LazyIngredientForm = lazy(() =>
  Promise.resolve({ default: FormPlaceholder })
)

export const LazyOrderForm = lazy(() =>
  Promise.resolve({ default: FormPlaceholder })
)

export const LazyCustomerForm = lazy(() =>
  import(/* webpackChunkName: "modal-customer-form" */ '@/components/forms/CustomerForm')
    .then(m => ({ default: m.CustomerForm }))
    .catch(() => ({ default: FormPlaceholder }))
)

export const LazyRecipeForm = lazy(() =>
  Promise.resolve({ default: FormPlaceholder })
)

export const LazyFinanceForm = lazy(() =>
  Promise.resolve({ default: FormPlaceholder })
)

// Lazy loaded detail/view components
export const LazyOrderDetail = lazy(() =>
  Promise.resolve({ default: DetailPlaceholder })
)

export const LazyCustomerDetail = lazy(() =>
  Promise.resolve({ default: DetailPlaceholder })
)

export const LazyInventoryDetail = lazy(() =>
  Promise.resolve({ default: DetailPlaceholder })
)

// Lazy Modal Wrapper Component
interface LazyModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  component: 'ingredient-form' | 'order-form' | 'customer-form' | 'recipe-form' | 'finance-form' |
  'order-detail' | 'customer-detail' | 'inventory-detail'
  props?: Record<string, unknown>
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
      // eslint-disable-next-line react/no-unstable-nested-components
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
  const ComponentToRender = Component as ComponentType<Record<string, unknown>>
  const isFormComponent = component.includes('form')

  const defaultProps = (() => {
    switch (component) {
      case 'customer-form':
        return {
          onSubmit: async () => {
            // Fallback to avoid runtime crash if caller forgets to pass handler
          }
        }
      default:
        return {}
    }
  })()

  const mergedProps = { ...defaultProps, ...(props ?? {}) }

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
              <ComponentToRender {...mergedProps} />
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
          <ComponentToRender {...mergedProps} />
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
    props: Record<string, unknown> | undefined
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
    if (!modalState.component) { return null }

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
    case 'customer-form':
      return import(/* webpackChunkName: "modal-customer-form" */ '@/components/forms/CustomerForm')
    case 'ingredient-form':
    case 'order-form':
    case 'recipe-form':
    case 'finance-form':
    case 'order-detail':
    case 'customer-detail':
    case 'inventory-detail':
    default:
      return Promise.resolve()
  }
}

// Bulk Modal Components (for multiple items) - Placeholders
const ModalPlaceholder = () => <div className="p-4 text-center text-muted-foreground">Modal component not available</div>

export const LazyBulkActionModal = lazy(() =>
  Promise.resolve({ default: ModalPlaceholder })
)

export const LazyConfirmationModal = lazy(() =>
  Promise.resolve({ default: ModalPlaceholder })
)

export const LazyExportModal = lazy(() =>
  Promise.resolve({ default: ModalPlaceholder })
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
    onConfirm: () => { },
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  })

  const showConfirmation = (newConfig: typeof config) => {
    void setConfig(newConfig)
    void setIsOpen(true)
  }

  const hideConfirmation = () => {
    void setIsOpen(false)
  }

  const ConfirmationModalRenderer = () => (
    <Dialog open={isOpen} onOpenChange={hideConfirmation}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{config.message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={hideConfirmation}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              {config.cancelText}
            </button>
            <button
              onClick={() => {
                config.onConfirm()
                hideConfirmation()
              }}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              {config.confirmText}
            </button>
          </div>
        </div>
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

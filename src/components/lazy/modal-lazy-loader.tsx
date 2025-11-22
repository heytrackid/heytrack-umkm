'use client'

import { lazy, Suspense, useState, useCallback, type ComponentType } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { logger } from '@/lib/logger'
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

// Placeholder components for forms/details that don't exist yet
const FormPlaceholder = () => <div className="p-4 text-center text-muted-foreground">Form component not available</div>
const DetailPlaceholder = () => <div className="p-4 text-center text-muted-foreground">Detail view not available</div>

// Form components - only CustomerForm exists as dynamic import
export const IngredientForm = FormPlaceholder
export const OrderForm = FormPlaceholder
export const RecipeForm = FormPlaceholder
export const FinanceForm = FormPlaceholder

export const LazyCustomerForm = lazy(() =>
  import(/* webpackChunkName: "modal-customer-form" */ '@/components/forms/CustomerForm')
    .then(m => ({ default: m.CustomerForm }))
    .catch((error) => {
      logger.warn({ error }, 'Failed to load CustomerForm')
      return { default: FormPlaceholder }
    })
)

// Detail components - OrderDetail exists, others are placeholders
export const CustomerDetail = DetailPlaceholder
export const InventoryDetail = DetailPlaceholder

export const LazyOrderDetail = lazy(() =>
  import(/* webpackChunkName: "modal-order-detail" */ '@/modules/orders/components/OrderDetailView')
    .then(m => ({ default: m.OrderDetailView }))
    .catch((error) => {
      logger.warn({ error }, 'Failed to load OrderDetailView')
      return { default: DetailPlaceholder }
    })
)

// Lazy Modal Wrapper Component
interface LazyModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  component: 'customer-detail' | 'customer-form' | 'finance-form' | 'ingredient-form' | 'inventory-detail' | 'order-detail' | 'order-form' | 'recipe-form'
  props?: Record<string, unknown>
  size?: 'lg' | 'md' | 'sm' | 'xl'
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
      case 'ingredient-form': return IngredientForm
      case 'order-form': return OrderForm
      case 'customer-form': return LazyCustomerForm
      case 'recipe-form': return RecipeForm
      case 'finance-form': return FinanceForm
      case 'order-detail': return LazyOrderDetail
      case 'customer-detail': return CustomerDetail
      case 'inventory-detail': return InventoryDetail

      default: {
        const DefaultComponent = () => <div>Informasi</div>
        Object.defineProperty(DefaultComponent, 'displayName', { value: 'DefaultComponent' })
        return DefaultComponent
      }
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
      case 'finance-form':
      case 'order-form':
      case 'order-detail':
      case 'ingredient-form':
      case 'inventory-detail':
      case 'customer-detail':
      case 'recipe-form':
        return {}
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
    props: Record<string, unknown> = {},
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
        {...(modalState.props && { props: modalState.props })}
        {...(modalState.size && { size: modalState.size })}
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
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{config.message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={hideConfirmation}
              className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
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

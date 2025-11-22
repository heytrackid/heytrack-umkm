import { Pencil, Trash2 } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CrudForm, FormActions } from '@/components/ui/crud-form'
import { Modal } from '@/components/ui/modal'

import type { ReactNode } from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'


/**
 * Shared CRUD Modal Components
 * Reusable modal components for CRUD operations
 */


interface CrudModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'lg' | 'md' | 'sm' | 'xl'
  fullScreenOnMobile?: boolean
  children: ReactNode
}

/**
 * Base modal wrapper for CRUD operations
 */
export const CrudModal = ({
  isOpen,
  onClose,
  title,
  size = 'lg',
  fullScreenOnMobile = true,
  children
}: CrudModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    size={size}
    fullScreenOnMobile={fullScreenOnMobile}
  >
    {children}
  </Modal>
)

interface CreateModalProps<FormData extends FieldValues = Record<string, unknown>> extends Omit<CrudModalProps, 'title'> {
  entityName: string
  form: UseFormReturn<FormData>
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
  children: ReactNode
}

/**
 * Create modal with form
 */
export const CreateModal = <FormData extends FieldValues = Record<string, unknown>>({
  entityName,
  form,
  onSubmit,
  isLoading,
  children,
  ...modalProps
}: CreateModalProps<FormData>) => (
    <CrudModal
      {...modalProps}
      title={`Tambah ${entityName} Baru`}
    >
      <CrudForm onSubmit={form.handleSubmit(onSubmit)}>
        {children}
         <FormActions
           onCancel={modalProps.onClose}
           submitText="Tambah"
           loading={isLoading || false}
           sticky
         />
      </CrudForm>
    </CrudModal>
  )

interface EditModalProps<FormData extends FieldValues = Record<string, unknown>> extends Omit<CrudModalProps, 'title'> {
  entityName: string
  form: UseFormReturn<FormData>
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
  children: ReactNode
}

/**
 * Edit modal with form
 */
export const EditModal = <FormData extends FieldValues = Record<string, unknown>>({
  entityName,
  form,
  onSubmit,
  isLoading,
  children,
  ...modalProps
}: EditModalProps<FormData>) => (
    <CrudModal
      {...modalProps}
      title={`Edit ${entityName}`}
    >
      <CrudForm onSubmit={form.handleSubmit(onSubmit)}>
        {children}
         <FormActions
           onCancel={modalProps.onClose}
           submitText="Simpan Perubahan"
           loading={isLoading || false}
           sticky
         />
      </CrudForm>
    </CrudModal>
  )

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  entityName: string
  itemName: string
  isLoading?: boolean
}

/**
 * Delete confirmation modal
 */
export const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  itemName,
  isLoading
}: DeleteModalProps) => (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={(open) => !open && onClose()}
        title={`Hapus ${entityName}`}
        description={`Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={onConfirm}
        confirmText="Ya, Hapus"
         loading={isLoading || false}
      />
)

interface CrudActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  size?: 'default' | 'lg' | 'sm'
  variant?: 'ghost' | 'outline'
}

/**
 * Standardized CRUD action buttons
 */
export const CrudActionButtons = ({
  onEdit,
  onDelete,
  size = 'sm',
  variant = 'ghost'
}: CrudActionButtonsProps) => (
  <div className="flex gap-1">
    {onEdit && (
      <Button
        variant={variant}
        size={size}
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    )}
    {onDelete && (
      <Button
        variant={variant}
        size={size}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )}
  </div>
)

// React types are imported via type imports at the top

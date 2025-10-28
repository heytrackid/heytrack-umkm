import type { ReactNode } from 'react'
/**
 * Shared CRUD Modal Components
 * Reusable modal components for CRUD operations
 */

import { Modal } from '@/components/ui/modal'
import { CrudForm, FormActions } from '@/components/ui/crud-form'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'

interface CrudModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
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

interface CreateModalProps<T = Record<string, unknown>> extends Omit<CrudModalProps, 'title'> {
  entityName: string
  form: any // This would be ReactHookForm type, kept as any for compatibility
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  children: ReactNode
}

/**
 * Create modal with form
 */
export const CreateModal = ({
  entityName,
  form,
  onSubmit,
  isLoading,
  children,
  ...modalProps
}: CreateModalProps) => (
    <CrudModal
      {...modalProps}
      title={`Tambah ${entityName} Baru`}
    >
      <CrudForm onSubmit={form.handleSubmit(onSubmit)}>
        {children}
        <FormActions
          onCancel={modalProps.onClose}
          submitText={`Simpan ${entityName}`}
          loading={isLoading}
          sticky
        />
      </CrudForm>
    </CrudModal>
  )

interface EditModalProps<T = Record<string, unknown>> extends Omit<CrudModalProps, 'title'> {
  entityName: string
  form: any // This would be ReactHookForm type, kept as any for compatibility
  onSubmit: (data: T) => Promise<void>
  isLoading?: boolean
  children: ReactNode
}

/**
 * Edit modal with form
 */
export const EditModal = ({
  entityName,
  form,
  onSubmit,
  isLoading,
  children,
  ...modalProps
}: EditModalProps) => (
    <CrudModal
      {...modalProps}
      title={`Edit ${entityName}`}
    >
      <CrudForm onSubmit={form.handleSubmit(onSubmit)}>
        {children}
        <FormActions
          onCancel={modalProps.onClose}
          submitText="Simpan Perubahan"
          loading={isLoading}
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
      variant="destructive"
      loading={isLoading}
    />
  )

interface CrudActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  size?: 'sm' | 'default' | 'lg'
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

// Import React for types
import type React from 'react'
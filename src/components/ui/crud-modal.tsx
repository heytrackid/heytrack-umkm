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
  children: React.ReactNode
}

/**
 * Base modal wrapper for CRUD operations
 */
export function CrudModal({
  isOpen,
  onClose,
  title,
  size = 'lg',
  fullScreenOnMobile = true,
  children
}: CrudModalProps) {
  return (
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
}

interface CreateModalProps extends Omit<CrudModalProps, 'title'> {
  entityName: string
  form: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  children: React.ReactNode
}

/**
 * Create modal with form
 */
export function CreateModal({
  entityName,
  form,
  onSubmit,
  isLoading,
  children,
  ...modalProps
}: CreateModalProps) {
  return (
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
          sticky={true}
        />
      </CrudForm>
    </CrudModal>
  )
}

interface EditModalProps extends Omit<CrudModalProps, 'title'> {
  entityName: string
  form: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
  children: React.ReactNode
}

/**
 * Edit modal with form
 */
export function EditModal({
  entityName,
  form,
  onSubmit,
  isLoading,
  children,
  ...modalProps
}: EditModalProps) {
  return (
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
          sticky={true}
        />
      </CrudForm>
    </CrudModal>
  )
}

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
export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  itemName,
  isLoading
}: DeleteModalProps) {
  return (
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
}

interface CrudActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'ghost' | 'outline'
}

/**
 * Standardized CRUD action buttons
 */
export function CrudActionButtons({
  onEdit,
  onDelete,
  size = 'sm',
  variant = 'ghost'
}: CrudActionButtonsProps) {
  return (
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
}

// Import React for types
import * as React from 'react'

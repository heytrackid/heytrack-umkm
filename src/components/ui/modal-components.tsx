'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Modal } from '@/components/ui/modal'
import { CrudForm, FormActions } from '@/components/ui/crud-form'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { uiLogger } from '@/lib/logger'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  entityName: string
  isLoading?: boolean
}

interface CreateModalProps<T extends Record<string, unknown>> extends BaseModalProps {
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<void> | void
  children: React.ReactNode
}

interface EditModalProps<T extends Record<string, unknown>> extends BaseModalProps {
  form: UseFormReturn<T>
  onSubmit: (data: T) => Promise<void> | void
  children: React.ReactNode
}

interface DeleteModalProps extends BaseModalProps {
  onConfirm: () => Promise<void> | void
  itemName?: string
}

/**
 * Create Modal Component
 * Reusable modal for creating new entities
 */
export function CreateModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  entityName,
  form,
  onSubmit,
  isLoading = false,
  children
}: CreateModalProps<T>) {
  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data)
    } catch (error) {
      uiLogger.error({ error: error }, 'Create error:')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tambah ${entityName} Baru`}
      size="lg"
      fullScreenOnMobile={true}
    >
      <CrudForm onSubmit={form.handleSubmit(handleSubmit)}>
        {children}
        <FormActions
          onCancel={onClose}
          submitText={`Simpan ${entityName}`}
          loading={isLoading}
          sticky={true}
        />
      </CrudForm>
    </Modal>
  )
}

/**
 * Edit Modal Component
 * Reusable modal for editing existing entities
 */
export function EditModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  entityName,
  form,
  onSubmit,
  isLoading = false,
  children
}: EditModalProps<T>) {
  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data)
    } catch (error) {
      uiLogger.error({ error: error }, 'Edit error:')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${entityName}`}
      size="lg"
      fullScreenOnMobile={true}
    >
      <CrudForm onSubmit={form.handleSubmit(handleSubmit)}>
        {children}
        <FormActions
          onCancel={onClose}
          submitText={`Simpan Perubahan`}
          loading={isLoading}
          sticky={true}
        />
      </CrudForm>
    </Modal>
  )
}

/**
 * Delete Modal Component
 * Reusable modal for confirming deletions
 */
export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  itemName,
  isLoading = false
}: DeleteModalProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      uiLogger.error({ error: error }, 'Delete error:')
    }
  }

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={`Hapus ${entityName}`}
      description={`Apakah Anda yakin ingin menghapus "${itemName || entityName}"? Tindakan ini tidak dapat dibatalkan.`}
      onConfirm={handleConfirm}
      confirmText="Ya, Hapus"
      variant="destructive"
      loading={isLoading}
    />
  )
}

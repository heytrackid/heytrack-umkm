/**
 * Confirmation Dialog Component
 * Prevents accidental destructive actions
 */

import { cn } from '@/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  loading = false
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            )}
          >
            {loading ? 'Memproses...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Preset confirmation dialogs
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  loading
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  itemName?: string
  loading?: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hapus ${itemName || 'item ini'}?`}
      description="Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen dari sistem."
      onConfirm={onConfirm}
      confirmText="Hapus"
      cancelText="Batal"
      variant="destructive"
      loading={loading}
    />
  )
}

export function BulkDeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  count,
  loading
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  count: number
  loading?: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Hapus ${count} item?`}
      description={`Anda akan menghapus ${count} item sekaligus. Tindakan ini tidak dapat dibatalkan.`}
      onConfirm={onConfirm}
      confirmText={`Hapus ${count} Item`}
      cancelText="Batal"
      variant="destructive"
      loading={loading}
    />
  )
}

export function ResetConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  loading?: boolean
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reset ke pengaturan default?"
      description="Semua perubahan yang belum disimpan akan hilang dan pengaturan akan kembali ke nilai default."
      onConfirm={onConfirm}
      confirmText="Reset"
      cancelText="Batal"
      variant="destructive"
      loading={loading}
    />
  )
}

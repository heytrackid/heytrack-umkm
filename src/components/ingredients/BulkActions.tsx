'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Trash2,
    Download,
    Edit,
    MoreVertical,
    CheckSquare,
    Square
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BulkActionsProps {
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
    allIds: string[]
    onBulkDelete?: (ids: string[]) => Promise<void>
    onBulkExport?: (ids: string[]) => void
    onBulkEdit?: (ids: string[]) => void
}

/**
 * Bulk Actions Component
 * 
 * Features:
 * - Select all / deselect all
 * - Bulk delete with confirmation
 * - Bulk export
 * - Bulk edit (future)
 * - Visual feedback
 */
export const BulkActions = ({
    selectedIds,
    onSelectionChange,
    allIds,
    onBulkDelete,
    onBulkExport,
    onBulkEdit
}: BulkActionsProps) => {
    const { toast } = useToast()
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const isAllSelected = selectedIds.length === allIds.length && allIds.length > 0
    const isSomeSelected = selectedIds.length > 0 && selectedIds.length < allIds.length

    const handleSelectAll = () => {
        if (isAllSelected) {
            onSelectionChange([])
        } else {
            onSelectionChange(allIds)
        }
    }

    const handleBulkDelete = async () => {
        if (!onBulkDelete) {return}

        setIsDeleting(true)
        try {
            await onBulkDelete(selectedIds)
            toast({
                title: 'Berhasil',
                description: `${selectedIds.length} bahan baku berhasil dihapus`,
            })
            onSelectionChange([])
            setShowDeleteDialog(false)
        } catch (error) {
            toast({
                title: 'Gagal',
                description: 'Terjadi kesalahan saat menghapus bahan baku',
                variant: 'destructive',
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleBulkExport = () => {
        if (!onBulkExport) {return}
        onBulkExport(selectedIds)
        toast({
            title: 'Export Berhasil',
            description: `${selectedIds.length} bahan baku berhasil di-export`,
        })
    }

    if (allIds.length === 0) {return null}

    return (
        <>
            <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg">
                {/* Select All Checkbox */}
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className={isSomeSelected ? 'data-[state=checked]:bg-blue-600' : ''}
                    />
                    <span className="text-sm font-medium">
                        {isAllSelected ? 'Batalkan Semua' : 'Pilih Semua'}
                    </span>
                </div>

                {/* Selected Count Badge */}
                {selectedIds.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                        {selectedIds.length} dipilih
                    </Badge>
                )}

                {/* Bulk Actions Menu */}
                {selectedIds.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4 mr-2" />
                                Aksi
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi Massal</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {onBulkExport && (
                                <DropdownMenuItem onClick={handleBulkExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export ({selectedIds.length})
                                </DropdownMenuItem>
                            )}

                            {onBulkEdit && (
                                <DropdownMenuItem onClick={() => onBulkEdit(selectedIds)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Massal
                                </DropdownMenuItem>
                            )}

                            {onBulkDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus ({selectedIds.length})
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus Massal</AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda akan menghapus <strong>{selectedIds.length} bahan baku</strong>.
                            Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus Semua'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

/**
 * Selectable Row Checkbox
 * Use in table rows for individual selection
 */
interface SelectableRowProps {
    id: string
    isSelected: boolean
    onToggle: (id: string) => void
}

export const SelectableRow = ({ id, isSelected, onToggle }: SelectableRowProps) => (
        <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggle(id)}
            onClick={(e) => e.stopPropagation()}
        />
    )

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { LoadingButton } from '@/components/ui/loading-button'
import { toast } from 'sonner'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import { useCreateIngredient, useUpdateIngredient } from '@/hooks/useIngredients'

import type { Row } from '@/types/database'

import { EnhancedIngredientForm } from '@/components/ingredients/EnhancedIngredientForm'





type Ingredient = Row<'ingredients'>

interface IngredientFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    ingredient?: Ingredient | undefined
    onSuccess?: () => Promise<void> | undefined | void
}

export const IngredientFormDialog = ({
    open,
    onOpenChange,
    ingredient,
    onSuccess
}: IngredientFormDialogProps) => {

    const mode = ingredient ? 'edit' : 'create'
    const createMutation = useCreateIngredient()
    const updateMutation = useUpdateIngredient()
    const isSubmitting = createMutation.isPending || updateMutation.isPending

    const form = useForm<SimpleIngredientFormData>({
        resolver: zodResolver(IngredientFormSchema),
        defaultValues: ingredient ? {
            name: ingredient.name,
            unit: ingredient.unit as "dozen" | "g" | "kg" | "l" | "ml" | "pcs",
            price_per_unit: ingredient.price_per_unit,
            current_stock: ingredient.current_stock ?? 0,
            min_stock: ingredient.min_stock ?? 0,
            description: ingredient.description ?? '',
        } : {
            name: '',
            unit: 'kg',
            price_per_unit: 0,
            current_stock: 0,
            min_stock: 0,
            description: '',
        }
    })

    const handleSubmit = async (data: SimpleIngredientFormData) => {
        try {
            if (ingredient) {
                // Update existing ingredient
                await updateMutation.mutateAsync({
                    id: ingredient.id,
                    data: data as never // Type mismatch between form and database schema
                })
            } else {
                // Create new ingredient
                await createMutation.mutateAsync(data as never) // Type mismatch between form and database schema
            }

            toast.success(`${data.name} berhasil ${ingredient ? 'diperbarui' : 'ditambahkan'}`)

            form.reset()
            onOpenChange(false)
            void onSuccess?.()
        } catch (error: unknown) {
            // Error handling is done by the mutations
            toast.error(error instanceof Error ? error.message : 'Terjadi kesalahan')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tambah Bahan Baku Baru' : `Edit ${ingredient?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <EnhancedIngredientForm
                        form={form}
                        mode={mode}
                        {...(ingredient ? {
                            initialData: {
                                name: ingredient.name || '',
                                unit: ingredient.unit || 'kg',
                                price_per_unit: ingredient.price_per_unit || 0,
                                current_stock: ingredient.current_stock ?? 0,
                                min_stock: ingredient.min_stock ?? 0,
                                description: ingredient.description ?? '',
                            }
                        } : {})}
                    />

                    <DialogFooter className="gap-2">
                         <LoadingButton
                             type="button"
                             variant="outline"
                             onClick={() => onOpenChange(false)}
                             disabled={isSubmitting}
                             hapticFeedback
                             hapticType="light"
                         >
                             Batal
                         </LoadingButton>
                         <LoadingButton
                             type="submit"
                             loading={isSubmitting}
                             loadingText="Menyimpan..."
                             hapticFeedback
                             hapticType="medium"
                         >
                             {mode === 'create' ? 'Tambah Bahan' : 'Simpan Perubahan'}
                         </LoadingButton>
                     </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

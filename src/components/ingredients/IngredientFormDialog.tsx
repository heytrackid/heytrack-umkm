'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/hooks/use-toast'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'

import { EnhancedIngredientForm } from './EnhancedIngredientForm'


import type { Row } from '@/types/database'



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
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const mode = ingredient ? 'edit' : 'create'

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
        setIsSubmitting(true)
        try {
            const url = ingredient ? `/api/ingredients/${ingredient['id']}` : '/api/ingredients'
            const method = ingredient ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const error = await response.json() as { error?: string }
                throw new Error(error.error ?? 'Gagal menyimpan bahan baku')
            }

            toast({
                title: ingredient ? 'Bahan baku diperbarui' : 'Bahan baku ditambahkan',
                description: `${data.name} berhasil ${ingredient ? 'diperbarui' : 'ditambahkan'}`,
            })

            form.reset()
            onOpenChange(false)
            void onSuccess?.()
        } catch (error: unknown) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan',
                variant: 'destructive'
            })
        } finally {
            setIsSubmitting(false)
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

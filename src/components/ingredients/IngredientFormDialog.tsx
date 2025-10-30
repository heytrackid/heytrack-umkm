'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { EnhancedIngredientForm } from './EnhancedIngredientForm'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import type { Database } from '@/types/supabase-generated'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface IngredientFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    ingredient?: Ingredient
    onSuccess?: () => void
}

export function IngredientFormDialog({
    open,
    onOpenChange,
    ingredient,
    onSuccess
}: IngredientFormDialogProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const mode = ingredient ? 'edit' : 'create'

    const form = useForm<SimpleIngredientFormData>({
        resolver: zodResolver(IngredientFormSchema),
        defaultValues: ingredient ? {
            name: ingredient.name,
            unit: ingredient.unit,
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
            const url = ingredient ? `/api/ingredients/${ingredient.id}` : '/api/ingredients'
            const method = ingredient ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Gagal menyimpan bahan baku')
            }

            toast({
                title: ingredient ? 'Bahan baku diperbarui' : 'Bahan baku ditambahkan',
                description: `${data.name} berhasil ${ingredient ? 'diperbarui' : 'ditambahkan'}`,
            })

            form.reset()
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tambah Bahan Baku Baru' : `Edit ${ingredient?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <EnhancedIngredientForm
                        form={form}
                        mode={mode}
                        initialData={ingredient}
                    />

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Tambah Bahan' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

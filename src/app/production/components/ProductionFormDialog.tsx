'use client'

import { Loader2 } from '@/components/icons'
import { useState } from 'react'
import { successToast, } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRecipes } from '@/hooks/useRecipes'
import { handleError } from '@/lib/error-handling'
import { useMutation, useQueryClient } from '@tanstack/react-query'





interface ProductionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export const ProductionFormDialog = ({ open, onOpenChange, onSuccess }: ProductionFormDialogProps) => {
    const { data: recipes = [], isLoading: loadingRecipes } = useRecipes({ limit: 1000 })
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        recipe_id: '',
        quantity: '',
        planned_date: new Date(),
        notes: ''
    })



    const createProductionBatchMutation = useMutation({
        mutationFn: async (data: {
            recipe_id: string
            quantity: number
            planned_date: string
            notes: string | null
        }) => {
            const { postApi } = await import('@/lib/query/query-helpers')
            return postApi('/api/production-batches', data)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['production-batches'] })
            successToast('Berhasil', 'Batch produksi berhasil dibuat')
            onSuccess()
            onOpenChange(false)
            resetForm()
        },
        onError: (error) => handleError(error, 'Create production batch', true, 'Terjadi kesalahan saat membuat batch produksi'),
    })

    const loading = createProductionBatchMutation.isPending

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.recipe_id || !formData.quantity) {
            handleError(new Error('Validation failed'), 'Production form validation', true, 'Mohon lengkapi semua field yang wajib diisi')
            return
        }

        const quantity = parseFloat(formData.quantity)
        if (isNaN(quantity) || quantity <= 0) {
            handleError(new Error('Validation failed'), 'Production form validation', true, 'Quantity harus berupa angka positif')
            return
        }

        await createProductionBatchMutation.mutateAsync({
            recipe_id: formData.recipe_id,
            quantity,
            planned_date: formData.planned_date.toISOString(),
            notes: formData.notes || null
        })
    }

    const resetForm = () => {
        setFormData({
            recipe_id: '',
            quantity: '',
            planned_date: new Date(),
            notes: ''
        })
    }

    // const selectedRecipe = recipes.find(r => r['id'] === formData.recipe_id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-wrap-mobile">Buat Batch Produksi Baru</DialogTitle>
                    <DialogDescription>
                        Rencanakan batch produksi untuk resep yang akan diproduksi
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recipe Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="recipe">
                            Resep <span className="text-muted-foreground">*</span>
                        </Label>
                        {loadingRecipes ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Select
                                value={formData.recipe_id}
                                onValueChange={(value: string) => setFormData({ ...formData, recipe_id: value })}
                            >
                                <SelectTrigger id="recipe">
                                    <SelectValue placeholder="Pilih resep" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.isArray(recipes) && recipes.length > 0 ? (
                                        recipes.map((recipe) => (
                                            <SelectItem key={recipe['id']} value={recipe['id']}>
                                                {recipe.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Tidak ada resep tersedia
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">
                            Jumlah Produksi <span className="text-muted-foreground">*</span>
                        </Label>
                        <Input
                            id="quantity"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                    </div>

                    {/* Planned Date */}
                    <div className="space-y-2">
                        <Label>
                            Tanggal Rencana Produksi <span className="text-muted-foreground">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.planned_date.toISOString().slice(0, 10)}
                          onChange={(e) => setFormData({ ...formData, planned_date: new Date(e.target.value) })}
                          placeholder="Pilih tanggal"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Tambahkan catatan untuk batch produksi ini..."
                            value={formData.notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading || loadingRecipes}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Buat Batch
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

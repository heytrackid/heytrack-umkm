'use client'

import { Loader2 } from '@/components/icons'
import { successToast, } from '@/hooks/use-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormSkeleton } from '@/components/ui/skeleton-loader'
import { SelectFieldSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { Textarea } from '@/components/ui/textarea'
import { useRecipes } from '@/hooks/useRecipes'
import { handleError } from '@/lib/error-handling'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Factory } from 'lucide-react'
import { VALIDATION_LIMITS } from '@/lib/shared/constants'

const CreateProductionBatchContent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const recipeIdParam = searchParams.get('recipeId')
    
    const { data: recipes = [], isLoading: loadingRecipes } = useRecipes({ limit: VALIDATION_LIMITS.LARGE_API_LIMIT })
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        recipe_id: '',
        quantity: '',
        planned_date: new Date(),
        notes: ''
    })

    // Pre-select recipe if recipeId param is present
    useEffect(() => {
        if (recipeIdParam && !formData.recipe_id) {
            setFormData(prev => ({ ...prev, recipe_id: recipeIdParam }))
        }
    }, [recipeIdParam, formData.recipe_id])

    const createProductionBatchMutation = useMutation({
        mutationFn: async (data: {
            recipe_id: string
            quantity: number
            planned_date: string
            notes: string | null
        }) => {
            const { postApi } = await import('@/lib/query/query-helpers')
            return postApi('/api/production/batches', data)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['production-batches'] })
            successToast('Berhasil', 'Batch produksi berhasil dibuat')
            router.push('/production')
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

    return (
        <div className="space-y-6">
            <PageHeader
                title="Buat Batch Produksi"
                description="Rencanakan batch produksi baru untuk resep Anda"
                icon={<Factory className="h-8 w-8 text-primary" />}
                breadcrumbs={[
                    { label: 'Produksi', href: '/production' },
                    { label: 'Buat Batch' }
                ]}
            />

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Form Produksi</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Recipe Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="recipe">
                                Resep <span className="text-muted-foreground">*</span>
                            </Label>
                            {loadingRecipes ? (
                                <SelectFieldSkeleton />
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
                            <p className="text-xs text-muted-foreground">
                                Masukkan jumlah porsi atau unit yang akan diproduksi
                            </p>
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
                                onClick={() => router.back()}
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
                </CardContent>
            </Card>
        </div>
    )
}

export default function CreateProductionBatchPage() {
    return (
        <Suspense
            fallback={(
                <div className="space-y-6">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Form Produksi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormSkeleton fields={4} hasSubmit={true} />
                        </CardContent>
                    </Card>
                </div>
            )}
        >
            <CreateProductionBatchContent />
        </Suspense>
    )
}

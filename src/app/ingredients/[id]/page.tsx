'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2 } from '@/components/icons'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { EnhancedIngredientForm } from '@/components/ingredients/index'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb'
import { PageHeader } from '@/components/layout/PageHeader'
import { useUpdateIngredient } from '@/hooks/useIngredients'
import { successToast, } from '@/hooks/use-toast'
import { handleError } from '@/lib/error-handling'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import { useIngredient } from '@/hooks/useIngredients'

import type { Update } from '@/types/database'






type IngredientUpdate = Update<'ingredients'>

const EditIngredientPage = (): JSX.Element | null => {
    const router = useRouter()
    const params = useParams()
    const id = params['id'] as string
    const updateIngredientMutation = useUpdateIngredient()

    const [loading, setLoading] = useState(false)

    // ✅ Use React Query instead of manual Supabase query
    const { data: ingredient, isLoading: fetching, error: fetchError } = useIngredient(id)

    const form = useForm<SimpleIngredientFormData>({
        resolver: zodResolver(IngredientFormSchema),
        defaultValues: {
            name: '',
            unit: 'kg',
            price_per_unit: 0,
            current_stock: 0,
            min_stock: 0,
            description: ''
        }
    })

    // Update form when ingredient data is loaded
    useEffect(() => {
        if (ingredient) {
            form.reset({
                name: ingredient.name,
                unit: ingredient.unit as 'dozen' | 'g' | 'kg' | 'l' | 'ml' | 'pcs',
                price_per_unit: ingredient.price_per_unit,
                current_stock: ingredient.current_stock ?? 0,
                min_stock: ingredient.min_stock ?? 0,
                description: ingredient.description ?? ''
            })
        }
    }, [ingredient, form])

    // Handle fetch error
    useEffect(() => {
        if (fetchError) {
            handleError(fetchError, 'Fetch ingredient', true, 'Gagal memuat data bahan baku')
            router.push('/ingredients')
        }
    }, [fetchError, router])

    const handleSubmit = async (data: SimpleIngredientFormData) => {
        try {
            setLoading(true)

            const payload: IngredientUpdate = {
                name: data.name,
                unit: data.unit,
                price_per_unit: data.price_per_unit,
                current_stock: data.current_stock,
                min_stock: data.min_stock ?? 0,
                description: data.description ?? null,
            }

            await updateIngredientMutation.mutateAsync({ id, data: payload })

            successToast("Berhasil", `Bahan baku "${data.name}" berhasil diperbarui`)

            router.push('/ingredients')
        } catch (error) {
            handleError(error, 'Update ingredient', true, 'Gagal memperbarui bahan baku')
        } finally {
            setLoading(false)
        }
    }

    const breadcrumbItems = [
        { label: 'Dashboard', href: '/' },
        { label: 'Bahan Baku', href: '/ingredients' },
        { label: ingredient?.name ?? 'Edit Bahan Baku' }
    ]

    if (fetching) {
        return (
            <AppLayout>
                <div className="space-y-6 p-6">
                    <PageBreadcrumb items={breadcrumbItems} />
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </div>
            </AppLayout>
        )
    }

    if (!ingredient) {
        return null
    }

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <PageBreadcrumb items={breadcrumbItems} />

                <PageHeader
                    title="Edit Bahan Baku"
                    description="Perbarui informasi bahan baku"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/' },
                        { label: 'Bahan Baku', href: '/ingredients' },
                        { label: ingredient?.name ?? 'Edit Bahan Baku' }
                    ]}
                    action={
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    }
                />

                {/* Form */}
                <div className="max-w-3xl">
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <EnhancedIngredientForm
                                    form={form}
                                    mode="edit"
                                    initialData={{
                                        name: ingredient.name,
                                        unit: ingredient.unit as 'dozen' | 'g' | 'kg' | 'l' | 'ml' | 'pcs',
                                        price_per_unit: ingredient.price_per_unit,
                                        current_stock: ingredient.current_stock ?? 0,
                                        min_stock: ingredient.min_stock ?? 0,
                                        description: ingredient.description ?? ''
                                    }}
                                />

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        disabled={loading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}

export default EditIngredientPage
'use client'

import { ArrowLeft } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { EnhancedIngredientForm } from '@/components/ingredients/index'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb'
import { FormSkeleton } from '@/components/ui/skeleton-loader'
import { successToast, } from '@/hooks/use-toast'
import { useIngredient, useUpdateIngredient } from '@/hooks/useIngredients'
import { handleError } from '@/lib/error-handling'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'

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
            spoilage_rate: 0.05,
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
                spoilage_rate: (ingredient as unknown as { spoilage_rate?: number }).spoilage_rate ?? 0.05,
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
                <div className="space-y-6">
                    <PageBreadcrumb items={breadcrumbItems} />
                    <Card>
                        <CardContent className="p-6">
                            <FormSkeleton fields={6} hasSubmit={true} />
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
    }

    if (!ingredient) {
        return (
            <AppLayout>
                <div className="space-y-6">
                    <PageBreadcrumb items={breadcrumbItems} />
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 text-muted-foreground">
                                Data bahan baku tidak ditemukan
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        )
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
                                        spoilage_rate: (ingredient as unknown as { spoilage_rate?: number }).spoilage_rate ?? 0.05,
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
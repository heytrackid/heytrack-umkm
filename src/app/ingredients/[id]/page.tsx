'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AppLayout from '@/components/layout/app-layout'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb'
import { EnhancedIngredientForm } from '@/components/ingredients'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { useSupabase } from '@/providers/SupabaseProvider'
import { ArrowLeft, Package, Loader2 } from 'lucide-react'
import type { Row, Update } from '@/types/database'




type Ingredient = Row<'ingredients'>
type IngredientUpdate = Update<'ingredients'>

const EditIngredientPage = () => {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const { update: updateIngredient } = useSupabaseCRUD('ingredients')
    const { toast } = useToast()
    const { supabase } = useSupabase()

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [ingredient, setIngredient] = useState<Ingredient | null>(null)

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

    // Fetch ingredient data
    useEffect(() => {
        const fetchIngredient = async () => {
            try {
                setFetching(true)

                const { data, error } = await supabase
                    .from('ingredients')
                    .select('*')
                    .eq('id', id)
                    .single<Ingredient>()

                if (error) { throw error }

                if (data) {
                    setIngredient(data)
                    form.reset({
                        name: data.name,
                        unit: data.unit as 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'dozen',
                        price_per_unit: data.price_per_unit,
                        current_stock: data.current_stock ?? 0,
                        min_stock: data.min_stock ?? 0,
                        description: data.description ?? ''
                    })
                }
            } catch (err: unknown) {
                apiLogger.error({ error: err }, 'Failed to fetch ingredient:')
                toast({
                    title: 'Gagal',
                    description: 'Gagal memuat data bahan baku',
                    variant: 'destructive',
                })
                router.push('/ingredients')
            } finally {
                setFetching(false)
            }
        }

        if (id) {
            void fetchIngredient()
        }
    }, [id, form, router, toast, supabase])

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

            await updateIngredient(id, payload)

            toast({
                title: 'Berhasil',
                description: `Bahan baku "${data.name}" berhasil diperbarui`,
            })

            router.push('/ingredients')
        } catch (err: unknown) {
            apiLogger.error({ error: err }, 'Failed to update ingredient:')
            toast({
                title: 'Gagal',
                description: 'Gagal memperbarui bahan baku. Silakan coba lagi.',
                variant: 'destructive',
            })
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

                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                            <Package className="h-7 w-7 sm:h-8 sm:w-8" />
                            Edit Bahan Baku
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Perbarui informasi bahan baku
                        </p>
                    </div>
                </div>

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
                                        unit: ingredient.unit as 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'dozen',
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

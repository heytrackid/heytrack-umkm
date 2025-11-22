'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EnhancedIngredientForm } from '@/components/ingredients/index'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BreadcrumbPatterns, PageBreadcrumb } from '@/components/ui/page-breadcrumb'
import { PageHeader } from '@/components/layout/PageHeader'
import { useAuth } from '@/hooks/index'
import { useCreateIngredient } from '@/hooks/useIngredients'
import { toast } from 'sonner'
import { apiLogger } from '@/lib/logger'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'



import type { Insert } from '@/types/database'




type IngredientInsert = Insert<'ingredients'>

const NewIngredientPage = (): JSX.Element => {
  const router = useRouter()

   const createIngredientMutation = useCreateIngredient()

  const { user } = useAuth() // Get user from auth hook

  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (data: SimpleIngredientFormData) => {
    try {
      setLoading(true)

      // Get user from client-side auth hook
      if (!user) {
        throw new Error('User not authenticated')
      }

      const payload: IngredientInsert = {
        name: data.name,
        unit: data.unit,
        price_per_unit: data.price_per_unit,
        current_stock: data.current_stock,
        min_stock: data.min_stock ?? 0,
        description: data.description ?? null,
        user_id: user['id'],
        is_active: true,
        weighted_average_cost: 0
      }

      await createIngredientMutation.mutateAsync(payload)

      toast.success(`Bahan baku "${data.name}" berhasil ditambahkan`)

      router.push('/ingredients')
    } catch (error) {
      apiLogger.error({ error }, 'Failed to create ingredient:')
      toast.error('Gagal menambahkan bahan baku. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredientNew} />

        <PageHeader
          title="Tambah Bahan Baku"
          description="Tambahkan bahan baku baru ke dalam sistem"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Bahan Baku', href: '/ingredients' },
            { label: 'Tambah Bahan Baku' }
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
                <EnhancedIngredientForm form={form} mode="create" />

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
                    {loading ? 'Menyimpan...' : 'Simpan Bahan Baku'}
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

export default NewIngredientPage
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import AppLayout from '@/components/layout/app-layout'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb'
import { PageHeader } from '@/components/ui/page-patterns'
import { CrudForm, FormActions } from '@/components/ui/crud-form'
import { EnhancedIngredientForm } from '@/components/ingredients'
import { apiLogger } from '@/lib/logger'
import { createClient } from '@/utils/supabase/client'
import type { Database } from '@/types/supabase-generated'

type IngredientInsert = Database['public']['Tables']['ingredients']['Insert']

export default function NewIngredientPage() {
  const router = useRouter()
  const { create: createIngredient } = useSupabaseCRUD('ingredients')

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
      void setLoading(true)

      const supabase = createClient()
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw authError ?? new Error('User not authenticated')
      }

      const payload: IngredientInsert = {
        name: data.name,
        unit: data.unit,
        price_per_unit: data.price_per_unit,
        current_stock: data.current_stock,
        min_stock: data.min_stock ?? 0,
        description: data.description || null,
        user_id: user.id,
        is_active: true,
        weighted_average_cost: 0
      }

      await createIngredient(payload)
      router.push('/ingredients')
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Failed to create ingredient:')
    } finally {
      void setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredientNew} />

        <PageHeader
          title="Tambah Bahan Baku Baru"
          description="Tambahkan bahan baku baru ke dalam sistem"
          backHref="/ingredients"
        />

        <div className="max-w-3xl">
          <CrudForm onSubmit={form.handleSubmit(handleSubmit)}>
            <EnhancedIngredientForm form={form} mode="create" />

            <FormActions
              onCancel={() => router.back()}
              submitText="Simpan Bahan Baku"
              loading={loading}
            />
          </CrudForm>
        </div>
      </div>
    </AppLayout>
  )
}

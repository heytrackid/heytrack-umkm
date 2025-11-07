'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { EnhancedIngredientForm } from '@/components/ingredients'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import { useSupabase } from '@/providers/SupabaseProvider'


import type { Insert } from '@/types/database'




type IngredientInsert = Insert<'ingredients'>

const NewIngredientPage = () => {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { create: createIngredient } = useSupabaseCRUD('ingredients')
  const { toast } = useToast()

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
        description: data.description ?? null,
        user_id: user['id'],
        is_active: true,
        weighted_average_cost: 0
      }

      await createIngredient(payload)

      toast({
        title: 'Berhasil',
        description: `Bahan baku "${data.name}" berhasil ditambahkan`,
      })

      router.push('/ingredients')
    } catch (error) {
      apiLogger.error({ error }, 'Failed to create ingredient:')
      toast({
        title: 'Gagal',
        description: 'Gagal menambahkan bahan baku. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredientNew} />

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
              Tambah Bahan Baku
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tambahkan bahan baku baru ke dalam sistem
            </p>
          </div>
        </div>

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

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/app-layout';
import { useSupabaseCRUD } from '@/hooks/supabase';
import { IngredientSchema, type IngredientFormData, IngredientFormSchema } from '@/lib/validations/form-validations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shared components
import { PageBreadcrumb, BreadcrumbPatterns } from '@/components/ui/page-breadcrumb';
import { PageHeader } from '@/components/ui/page-patterns';
import { IngredientFormFields } from '@/components/forms/shared/IngredientFormFields';
import { CrudForm, FormActions } from '@/components/ui/crud-form';

import { apiLogger } from '@/lib/logger'

export default function NewIngredientPage() {
  const router = useRouter();
  const { create: createIngredient } = useSupabaseCRUD('ingredients');

  const [loading, setLoading] = useState(false);

  const form = useForm<IngredientFormData>({
    resolver: zodResolver(IngredientFormSchema),
    defaultValues: {
      name: '',
      unit: 'kg',
      price_per_unit: 0,
      current_stock: 0,
      min_stock: 0,
      description: '',
    }
  });

  const handleSubmit = async (data: IngredientFormData) => {
    try {
      setLoading(true);
      await createIngredient(data);
      router.push('/ingredients');
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Failed to create ingredient:')
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageBreadcrumb items={BreadcrumbPatterns.ingredientNew} />

        <PageHeader
          title="Tambah Bahan Baku Baru"
          description="Tambahkan bahan baku baru ke dalam sistem"
          backHref="/ingredients"
        />

        {/* Form */}
        <div className="max-w-2xl">
          <CrudForm onSubmit={form.handleSubmit(handleSubmit)}>
            <IngredientFormFields
              register={form.register}
              errors={form.formState.errors}
            />

            <FormActions
              onCancel={() => router.back()}
              submitText="Simpan Bahan Baku"
              loading={loading}
            />
          </CrudForm>
        </div>
      </div>
    </AppLayout>
  );
}

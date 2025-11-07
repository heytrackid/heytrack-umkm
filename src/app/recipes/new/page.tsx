'use client'

import { Suspense } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { RecipeFormPage } from '@/components/recipes/RecipeFormPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'



const NewRecipePage = () => (
    <AppLayout pageTitle="Tambah Resep Baru">
        <div className="p-6">
            <Suspense fallback={<DataGridSkeleton rows={6} />}>
                <RecipeFormPage mode="create" />
            </Suspense>
        </div>
    </AppLayout>
)

export default NewRecipePage

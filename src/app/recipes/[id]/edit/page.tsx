'use client'

import { Suspense } from 'react'
import { RecipeFormPage } from '@/components/recipes/RecipeFormPage'
import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

interface EditRecipePageProps {
    params: {
        id: string
    }
}

export default function EditRecipePage({ params }: EditRecipePageProps) {
    return (
        <AppLayout pageTitle="Edit Resep">
            <div className="p-6">
                <Suspense fallback={<DataGridSkeleton rows={6} />}>
                    <RecipeFormPage mode="edit" recipeId={params.id} />
                </Suspense>
            </div>
        </AppLayout>
    )
}

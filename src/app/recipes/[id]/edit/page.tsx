'use client'

import { Suspense, lazy } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load the heavy RecipeFormPage component
const RecipeFormPage = lazy(() => import('@/components/recipes/RecipeFormPage').then(mod => ({ default: mod.RecipeFormPage })))



interface EditRecipePageProps {
    params: {
        id: string
    }
}

const EditRecipePage = ({ params }: EditRecipePageProps) => (
    <AppLayout pageTitle="Edit Resep">
        <div className="p-6">
            <Suspense fallback={<DataGridSkeleton rows={6} />}>
                <RecipeFormPage mode="edit" recipeId={params['id']} />
            </Suspense>
        </div>
    </AppLayout>
)

export default EditRecipePage

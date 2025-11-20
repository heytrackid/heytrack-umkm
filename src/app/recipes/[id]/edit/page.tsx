'use client'

import { Suspense, lazy } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { FormSkeleton } from '@/components/ui/skeleton-loader'

// Lazy load the heavy RecipeFormPage component
// ✅ Correct pattern for named exports with React.lazy
const RecipeFormPage = lazy(() => 
  import('@/components/recipes/RecipeFormPage').then(mod => ({ 
    default: mod.RecipeFormPage 
  }))
)



interface EditRecipePageProps {
    params: {
        id: string
    }
}

const EditRecipePage = ({ params }: EditRecipePageProps) => (
    <AppLayout pageTitle="Edit Resep">
        <div className="p-6">
            <Suspense fallback={<FormSkeleton fields={6} />}>
                <RecipeFormPage mode="edit" recipeId={params['id']} />
            </Suspense>
        </div>
    </AppLayout>
)

export default EditRecipePage
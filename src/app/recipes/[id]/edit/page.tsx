'use client'

import { AppLayout } from '@/components/layout/app-layout'

import { RecipeFormPage } from '@/components/recipes/RecipeFormPage'



interface EditRecipePageProps {
    params: {
        id: string
    }
}

const EditRecipePage = ({ params }: EditRecipePageProps) => (
    <AppLayout pageTitle="Edit Resep">
        <div className="p-6">
            <RecipeFormPage mode="edit" recipeId={params['id']} />
        </div>
    </AppLayout>
)

export default EditRecipePage
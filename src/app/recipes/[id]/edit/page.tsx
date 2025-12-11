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
        <RecipeFormPage mode="edit" recipeId={params['id']} />
    </AppLayout>
)

export default EditRecipePage
'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipeFormPage } from '@/components/recipes/RecipeFormPage'

const NewRecipePage = () => (
    <AppLayout pageTitle="Tambah Resep Baru">
        <RecipeFormPage mode="create" />
    </AppLayout>
)

export default NewRecipePage
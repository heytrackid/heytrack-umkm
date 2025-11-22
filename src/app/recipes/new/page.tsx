'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipeFormPage } from '@/components/recipes/RecipeFormPage'

const NewRecipePage = () => (
    <AppLayout pageTitle="Tambah Resep Baru">
        <div className="p-6">
            <RecipeFormPage mode="create" />
        </div>
    </AppLayout>
)

export default NewRecipePage
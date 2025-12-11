'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { RecipesList } from '@/components/recipes/RecipesList'

const RecipesPage = () => (
    <AppLayout pageTitle="Resep Produk">
        <RecipesList />
    </AppLayout>
)

export default RecipesPage
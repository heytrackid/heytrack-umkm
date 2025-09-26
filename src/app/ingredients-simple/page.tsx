'use client'

import { IngredientsCRUD } from '@/components/crud/ingredients-crud'
import { CrudLayout } from '@/components/layout/crud-layout'

export default function IngredientsSimplePage() {
  return (
    <CrudLayout
      title="Ingredients"
      description="Manage your bakery ingredients and stock levels"
      maxWidth="2xl"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Ingredients' },
      ]}
    >
      <IngredientsCRUD />
    </CrudLayout>
  )
}

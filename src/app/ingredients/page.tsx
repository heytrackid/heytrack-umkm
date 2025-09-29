'use client'

import AppLayout from '@/components/layout/app-layout'
import { IngredientsCRUD } from '@/components/crud/ingredients-crud'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import Link from 'next/link'

export default function IngredientsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Bahan Baku</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Kelola Bahan Baku
            </h1>
            <p className="text-muted-foreground">
              Tambah, edit, dan kelola stok bahan baku untuk produksi
            </p>
          </div>
        </div>

        {/* Main Content - Ingredients CRUD */}
        <IngredientsCRUD />
      </div>
    </AppLayout>
  )
}
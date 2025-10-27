'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, X, Save } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

interface CategoryFormProps {
  category: Category
  currentView: 'add' | 'edit'
  isMobile: boolean
  onCategoryChange: (category: Category) => void
  onSave: () => void
  onCancel: () => void
}

export const CategoryForm = ({
  category,
  currentView,
  isMobile,
  onCategoryChange,
  onSave,
  onCancel
}: CategoryFormProps) => {
  const handleAddIngredient = () => {
    onCategoryChange({
      ...category,
      commonIngredients: [...category.commonIngredients, '']
    })
  }

  const handleUpdateIngredient = (index: number, value: string) => {
    onCategoryChange({
      ...category,
      commonIngredients: category.commonIngredients.map((ing, i) => i === index ? value : ing)
    })
  }

  const handleRemoveIngredient = (index: number) => {
    onCategoryChange({
      ...category,
      commonIngredients: category.commonIngredients.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {currentView === 'add' ? 'Tambah' : 'Edit'} Kategori Produk
          </h2>
          <p className="text-muted-foreground">
            {currentView === 'add' ? 'Buat kategori baru' : 'Edit kategori yang dipilih'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                value={category.name}
                onChange={(e) => onCategoryChange({ ...category, name: e.target.value })}

              />
            </div>
            
            <div className="space-y-2">
              <Label>Ikon Kategori</Label>
              <Input
                value={category.icon}
                onChange={(e) => onCategoryChange({ ...category, icon: e.target.value })}

                className="text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi Kategori</Label>
            <Input
              value={category.description}
              onChange={(e) => onCategoryChange({ ...category, description: e.target.value })}

            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Bahan Baku Umum</Label>
              <Button size="sm" onClick={handleAddIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
            
            <div className="space-y-2">
              {category.commonIngredients.map((ingredient, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleUpdateIngredient(index, e.target.value)}

                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {category.commonIngredients.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded">
                  Belum ada bahan baku
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

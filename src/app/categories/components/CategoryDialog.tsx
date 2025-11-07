'use client'

import { Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

interface CategoryFormData {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

interface CategoryDialogProps {
  isOpen: boolean
  mode: 'add' | 'edit'
  category: CategoryFormData
  isMobile: boolean
  onCategoryChange: (category: CategoryFormData) => void
  onSave: () => void
  onClose: () => void
}

export const CategoryDialog = ({
  isOpen,
  mode,
  category,
  isMobile,
  onCategoryChange,
  onSave,
  onClose
}: CategoryDialogProps): JSX.Element => {
  const handleAddIngredient = (): void => {
    onCategoryChange({
      ...category,
      commonIngredients: [...category.commonIngredients, '']
    })
  }

  const handleUpdateIngredient = (index: number, value: string): void => {
    onCategoryChange({
      ...category,
      commonIngredients: category.commonIngredients.map((ing, i) => i === index ? value : ing)
    })
  }

  const handleRemoveIngredient = (index: number): void => {
    onCategoryChange({
      ...category,
      commonIngredients: category.commonIngredients.filter((_, i) => i !== index)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Tambah' : 'Edit'} Kategori Produk
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                value={category.name}
                onChange={(e) => onCategoryChange({ ...category, name: e.target.value })}
                placeholder="Masukkan nama kategori"
              />
            </div>

            <div className="space-y-2">
              <Label>Ikon Kategori</Label>
              <Input
                value={category.icon}
                onChange={(e) => onCategoryChange({ ...category, icon: e.target.value })}
                placeholder="Masukkan ikon (emoji)"
                className="text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi Kategori</Label>
            <Input
              value={category.description}
              onChange={(e) => onCategoryChange({ ...category, description: e.target.value })}
              placeholder="Masukkan deskripsi kategori"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Bahan Baku Umum</Label>
              <Button size="sm" onClick={handleAddIngredient} variant="outline">
                <span className="text-lg mr-1">+</span>
                Tambah
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {category.commonIngredients.map((ingredient, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleUpdateIngredient(index, e.target.value)}
                    placeholder="Nama bahan baku"
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-500 hover:text-red-700 px-2"
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

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={onSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

import { incomeCategories, expenseCategories } from '@/app/cash-flow/constants'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CategoryManagementDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

type CategoryType = 'income' | 'expense'

interface CategoryItem {
  id: string
  name: string
  type: CategoryType
}

const STORAGE_KEY = 'custom_categories'

const CategoryManagementDialog = ({ isOpen, onOpenChange }: CategoryManagementDialogProps): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [activeTab, setActiveTab] = useState<CategoryType>('income')

  const getInitialCategories = (): CategoryItem[] => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to parse stored categories:', error)
      }
    }

    // Default categories
    return [
      ...incomeCategories.map(name => ({ id: `income-${name}`, name, type: 'income' as CategoryType })),
      ...expenseCategories.map(name => ({ id: `expense-${name}`, name, type: 'expense' as CategoryType }))
    ]
  }

  const [categories, setCategories] = useState<CategoryItem[]>(getInitialCategories)

  // Save to localStorage whenever categories change
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
    }
  }, [categories])

  const addCategory = (type: CategoryType) => {
    if (!newCategoryName.trim()) return

    const newCategory: CategoryItem = {
      id: `${type}-${Date.now()}`,
      name: newCategoryName.trim(),
      type
    }

    setCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
  }

  const updateCategory = (id: string, newName: string) => {
    if (!newName.trim()) return

    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, name: newName.trim() } : cat
      )
    )
    setEditingId(null)
    setEditValue('')
  }

  const startEditing = (category: CategoryItem) => {
    setEditingId(category.id)
    setEditValue(category.name)
  }

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id))
  }

  const filteredCategories = categories.filter(cat => cat.type === activeTab)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Kategori Transaksi</DialogTitle>
          <DialogDescription>
            Tambah, edit, atau hapus kategori untuk transaksi pemasukan dan pengeluaran
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <div className="space-y-2">
              <Label>Tambah Kategori Pemasukan</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama kategori baru"
                  value={newCategoryName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') addCategory('income') }}
                />
                <Button onClick={() => addCategory('income')} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori Pemasukan</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 p-2 border rounded">
                    {editingId === category.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { updateCategory(category.id, editValue); setEditingId(null); setEditValue(''); } }}
                          onBlur={() => { updateCategory(category.id, editValue); setEditingId(null); setEditValue(''); }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{category.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => startEditing(category)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <div className="space-y-2">
              <Label>Tambah Kategori Pengeluaran</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama kategori baru"
                  value={newCategoryName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') addCategory('expense') }}
                />
                <Button onClick={() => addCategory('expense')} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori Pengeluaran</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 p-2 border rounded">
                    {editingId === category.id ? (
                      <>
                        <Input
                          value={editValue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { updateCategory(category.id, editValue); setEditingId(null); setEditValue(''); } }}
                          onBlur={() => { updateCategory(category.id, editValue); setEditingId(null); setEditValue(''); }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{category.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => startEditing(category)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export { CategoryManagementDialog }
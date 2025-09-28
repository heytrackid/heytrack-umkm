'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Tags,
  ArrowLeft,
  ChevronRight,
  Home
} from 'lucide-react'
import categoriesData from '@/data/categories.json'

interface Category {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

export default function CategoriesPage() {
  const { isMobile } = useResponsive()
  const [categories, setCategories] = useState<Category[]>(categoriesData.categories)
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Category>({
    id: '',
    name: '',
    icon: '🍽️',
    description: '',
    commonIngredients: []
  })

  const resetForm = () => {
    setNewCategory({
      id: '',
      name: '',
      icon: '🍽️',
      description: '',
      commonIngredients: []
    })
    setEditingCategory(null)
  }

  const handleSaveCategory = () => {
    if (currentView === 'add') {
      const id = newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const categoryToAdd = { ...newCategory, id }
      setCategories([...categories, categoryToAdd])
    } else if (currentView === 'edit' && editingCategory) {
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...newCategory, id: editingCategory.id } : cat
      ))
    }
    resetForm()
    setCurrentView('list')
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setNewCategory({ ...category })
    setCurrentView('edit')
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId))
    }
  }

  const handleAddIngredient = () => {
    setNewCategory(prev => ({
      ...prev,
      commonIngredients: [...prev.commonIngredients, '']
    }))
  }

  const handleUpdateIngredient = (index: number, value: string) => {
    setNewCategory(prev => ({
      ...prev,
      commonIngredients: prev.commonIngredients.map((ing, i) => i === index ? value : ing)
    }))
  }

  const handleRemoveIngredient = (index: number) => {
    setNewCategory(prev => ({
      ...prev,
      commonIngredients: prev.commonIngredients.filter((_, i) => i !== index)
    }))
  }

  // Breadcrumb component
  const Breadcrumb = () => (
    <nav className="flex items-center space-x-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = '/'}
        className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4 mr-1" />
        Dashboard
      </Button>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      {currentView === 'list' ? (
        <span className="font-medium">Kategori Produk</span>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('list')}
            className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
          >
            Kategori Produk
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {currentView === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}
          </span>
        </>
      )}
    </nav>
  )

  // Form Component
  const CategoryForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetForm()
            setCurrentView('list')
          }}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {currentView === 'add' ? 'Tambah' : 'Edit'} Kategori
          </h2>
          <p className="text-muted-foreground">
            {currentView === 'add' ? 'Buat kategori produk baru' : 'Edit kategori produk'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Makanan Utama"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icon</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="🍽️"
                className="text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Contoh: Nasi, mie, pasta, dll"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Bahan Baku Umum</Label>
              <Button size="sm" onClick={handleAddIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Bahan
              </Button>
            </div>
            
            <div className="space-y-2">
              {newCategory.commonIngredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleUpdateIngredient(index, e.target.value)}
                    placeholder="Nama bahan (contoh: tepung terigu)"
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
              
              {newCategory.commonIngredients.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded">
                  Belum ada bahan baku. Klik "Tambah Bahan" untuk menambahkan.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveCategory} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan Kategori
            </Button>
            <Button variant="outline" onClick={() => {
              resetForm()
              setCurrentView('list')
            }}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // List Component
  const CategoryList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Kategori Produk
          </h1>
          <p className="text-muted-foreground">
            Kelola kategori produk untuk auto-populate bahan baku
          </p>
        </div>
        <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
              <Tags className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Tentang Kategori Produk
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Kategori digunakan untuk auto-populate bahan baku saat membuat resep. 
                Setiap kategori memiliki daftar bahan baku umum yang akan otomatis ditambahkan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Bahan Baku Umum:</p>
                <div className="flex flex-wrap gap-1">
                  {category.commonIngredients.slice(0, 4).map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                  {category.commonIngredients.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{category.commonIngredients.length - 4} lainnya
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb />
        {currentView === 'list' ? <CategoryList /> : <CategoryForm />}
      </div>
    </AppLayout>
  )
}
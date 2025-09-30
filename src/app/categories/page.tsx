'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Tags,
  ArrowLeft,
  Home,
  MoreHorizontal,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSettings } from '@/contexts/settings-context'
import categoriesData from '@/data/categories.json'
import { CategoriesTableSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load heavy components
const Table = dynamic(() => import('@/components/ui/table').then(m => ({ default: m.Table })))
const TableBody = dynamic(() => import('@/components/ui/table').then(m => ({ default: m.TableBody })))
const TableCell = dynamic(() => import('@/components/ui/table').then(m => ({ default: m.TableCell })))
const TableHead = dynamic(() => import('@/components/ui/table').then(m => ({ default: m.TableHead })))
const TableHeader = dynamic(() => import('@/components/ui/table').then(m => ({ default: m.TableHeader })))
const TableRow = dynamic(() => import('@/components/ui/table').then(m => ({ default: m.TableRow })))

interface Category {
  id: string
  name: string
  icon: string
  description: string
  commonIngredients: string[]
}

export default function CategoriesPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()
  const [categoryList, setCategoryList] = useState<Category[]>(categoriesData.categories)
  const [currentView, setCurrentView] = useState('list') // 'list', 'add', 'edit'
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true) // Add loading state
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  
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
      setCategoryList
    } else if (currentView === 'edit' && editingCategory) {
      setCategoryList(categoryList.map(cat => 
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
      setCategoryList(categoryList.filter(cat => cat.id !== categoryId))
    }
  }

  // Filter categories based on search term
  const filteredCategories = categoryList.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Calculate pagination
  const totalItems = filteredCategories.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Get paginated data
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredCategories.slice(startIndex, endIndex)
  }, [filteredCategories, currentPage, pageSize])
  
  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800) // Show skeleton for 800ms

    return () => clearTimeout
  }, [])

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedItems.length === filteredCategories.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredCategories.map(category => category.id))
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return
    
    const selectedCategories = filteredCategories.filter(category => selectedItems.includes(category.id))
    const categoryNames = selectedCategories.map(category => category.name).join(', ')
    
    const confirmed = window.confirm(
      "Placeholder"
    )
    
    if (confirmed) {
      setCategoryList(categoryList.filter(cat => !selectedItems.includes(cat.id)))
      setSelectedItems([])
      alert(`${selectedItems.length} kategori berhasil dihapus`)
    }
  }

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) return
    
    const selectedCategories = filteredCategories.filter(category => selectedItems.includes(category.id))
    const categoryNames = selectedCategories.map(category => category.name).join(', ')
    
    // TODO: Open bulk edit modal
    console.log('Bulk editing categories:', selectedItems)
    
    alert
  }

  // Individual action handlers
  const handleViewCategory = (category: Category) => {
    console.log('View category details:', category)
    alert
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
  const getBreadcrumbItems = () => {
    const items = [
      { label: "Placeholder", href: '/' },
      { label: "Placeholder", href: '/resep' },
      { label: "Placeholder", href: currentView === 'list' ? undefined : '/categories' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? "Placeholder" : "Placeholder"
      })
    }
    
    return items
  }

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
            {currentView === 'add' ? 'Tambah' : 'Edit'} {'Kategori Produk'}
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
              <Label>{'Nama Kategori'}</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder={'Masukkan nama kategori'}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{'Ikon Kategori'}</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="🍽️"
                className="text-center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{'Deskripsi Kategori'}</Label>
            <Input
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              placeholder={'Masukkan deskripsi kategori'}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>{'Bahan Baku Umum'}</Label>
              <Button size="sm" onClick={handleAddIngredient}>
                <Plus className="h-4 w-4 mr-1" />
                {"Placeholder"}
              </Button>
            </div>
            
            <div className="space-y-2">
              {newCategory.commonIngredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => handleUpdateIngredient}
                    placeholder={"Placeholder"}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveIngredient}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {newCategory.commonIngredients.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded">
                  {'Belum ada bahan baku'}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveCategory} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {"Placeholder"}
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

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari kategori berdasarkan nama atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} kategori dipilih
              </span>
              <span className="text-xs text-gray-500">
                ({filteredCategories.filter(category => selectedItems.includes(category.id)).map(category => category.name).slice(0, 2).join(', ')}
                {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems([])}
                className="text-gray-500 hover:text-gray-700"
              >
                Batal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkEdit}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Semua
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Semua
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Daftar Kategori Produk
          </CardTitle>
          <p className="text-sm text-gray-600">
            Kelola kategori produk dengan mudah
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CategoriesTableSkeleton rows={8} />
          ) : filteredCategories.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === filteredCategories.length && filteredCategories.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Bahan Baku Umum</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(category.id)}
                          onCheckedChange={() => handleSelectItem(category.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{category.icon}</span>
                          <div>
                            <span className="font-semibold">{category.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {category.description}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {category.commonIngredients.slice(0, 3).map((ingredient, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {ingredient}
                            </Badge>
                          ))}
                          {category.commonIngredients.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                             {category.commonIngredients.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCategory(category)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} kategori
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Tampilkan:</span>
                      <Select value={pageSize.toString()} onValueChange={(value) => {
                        setPageSize(Number(value))
                        setCurrentPage(1)
                      }}>
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-sm font-medium">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada kategori produk'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Coba kata kunci lain untuk menemukan kategori'
                  : 'Mulai dengan menambahkan kategori produk pertama'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kategori Pertama
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {currentView === 'list' ? <CategoryList /> : <CategoryForm />}
      </div>
    </AppLayout>
  )
}
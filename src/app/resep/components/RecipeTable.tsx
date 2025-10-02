'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  ChefHat, 
  Edit2,
  Trash2,
  Eye,
  Calculator,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSettings } from '@/contexts/settings-context'

interface RecipeTableProps {
  recipes: any[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddNew: () => void
  onEdit: (recipe: any) => void
  onDelete: (recipe: any) => void
  onView: (recipe: any) => void
  selectedItems?: string[]
  onSelectItem?: (itemId: string) => void
  onSelectAll?: () => void
  isMobile?: boolean
}

/**
 * Recipe Table Component
 * Extracted from resep/page.tsx for code splitting
 */
export default function RecipeTable({
  recipes,
  searchTerm,
  onSearchChange,
  onAddNew,
  onEdit,
  onDelete,
  onView,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
  isMobile = false
}: RecipeTableProps) {
  const { formatCurrency } = useSettings()
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Calculate pagination
  const totalItems = filteredRecipes.length
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Get paginated data
  const paginatedRecipes = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredRecipes.slice(startIndex, endIndex)
  }, [filteredRecipes, currentPage, pageSize])
  
  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [filteredRecipes.length])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Informasi
            <Badge variant="secondary" className="ml-2">
              {filteredRecipes.length}
            </Badge>
          </CardTitle>
          <Button onClick={onAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Informasi
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder=""
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        {filteredRecipes.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {onSelectAll && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === filteredRecipes.length}
                        onCheckedChange={onSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Informasi</TableHead>
                  <TableHead>Informasi</TableHead>
                  <TableHead>Informasi</TableHead>
                  <TableHead>Informasi</TableHead>
                  <TableHead className="text-right">Informasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecipes.map((recipe) => {
                  const ingredientCount = recipe.recipe_ingredients?.length || 0
                  const hpp = recipe.recipe_ingredients?.reduce((sum: number, ri: any) => {
                    const ing = ri.ingredients
                    if (!ing) return sum
                    const costPerUnit = ing.cost_per_unit || 0
                    const quantity = ri.quantity || 0
                    return sum + (costPerUnit * quantity)
                  }, 0) || 0

                  return (
                    <TableRow key={recipe.id}>
                      {onSelectItem && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(recipe.id.toString())}
                            onCheckedChange={() => onSelectItem(recipe.id.toString())}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{recipe.name}</span>
                          {recipe.description && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {recipe.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          {formatCurrency(Math.round(hpp))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ingredientCount > 0 ? 'default' : 'destructive'}>
                          Informasi
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ingredientCount > 0 ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Informasi
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Informasi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(recipe)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(cost)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Informasi
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => window.location.href = '/hpp'}
                                disabled={ingredientCount === 0}
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                Informasi
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => onDelete(recipe)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Informasi
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t('recipes.pagination.showing', {
                      from: ((currentPage - 1) * pageSize) + 1,
                      to: Math.min(currentPage * pageSize, totalItems),
                      total: totalItems
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Informasi</span>
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
                        <SelectItem value="100">100</SelectItem>
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
                      Informasi
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
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {searchTerm ? Informasi : Informasi}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? Informasi
                : Informasi
              }
            </p>
            {!searchTerm && (
              <Button onClick={onAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Informasi
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { UMKMTooltip } from './UMKMTooltip'
import { useCurrency } from '@/hooks/useCurrency'
import { Calculator, Package, BookOpen, MoreHorizontal, Edit, Trash2 } from 'lucide-react'

interface InventoryTableProps {
  ingredients: any[]
  selectedItems: string[]
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onEditIngredient: (ingredient: any) => void
  onDeleteIngredient: (ingredient: any) => void
  onShowPricingAnalysis: (ingredient: any) => void
  getStockAlertLevel: (ingredient: any) => { level: string, color: string, text: string }
}

/**
 * Inventory table component with bulk selection and actions
 */
export function InventoryTable({
  ingredients,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEditIngredient,
  onDeleteIngredient,
  onShowPricingAnalysis,
  getStockAlertLevel
}: InventoryTableProps) {
  const { formatCurrency } = useCurrency()
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Daftar Bahan Baku
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Klik"Analisis Harga" untuk melihat harga rata-rata yang tepat
            </p>
          </div>
          <UMKMTooltip
            title="Kenapa Perlu Analisis Harga?"
            content={`Harga bahan baku berubah-ubah. Misalnya tepung beli minggu lalu ${formatCurrency(14500)}/kg, minggu ini ${formatCurrency(15800)}/kg. Pakai harga mana buat HPP? Sistem ini bantu Anda dapat harga rata-rata yang paling akurat!`}
          >
            <BookOpen className="h-5 w-5 text-gray-500" />
          </UMKMTooltip>
        </div>
      </CardHeader>
      <CardContent>
        {ingredients.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === ingredients.length && ingredients.length > 0}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Status Stock</TableHead>
                  <TableHead>Stock Saat Ini</TableHead>
                  <TableHead>Harga per Unit</TableHead>
                  <TableHead>Nilai Stock</TableHead>
                  <TableHead className="w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => {
                  const stockAlert = getStockAlertLevel(ingredient)

                  return (
                    <TableRow key={ingredient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(ingredient.id)}
                          onCheckedChange={() => onSelectItem(ingredient.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{ingredient.name || 'Nama tidak tersedia'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${stockAlert.color} text-white text-xs`}>
                          {stockAlert.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {ingredient.current_stock || 0} {ingredient.unit || 'unit'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(ingredient.price_per_unit || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency((ingredient.current_stock || 0) * (ingredient.price_per_unit || 0))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShowPricingAnalysis(ingredient)}
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => onEditIngredient(ingredient)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => onDeleteIngredient(ingredient)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
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
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada bahan baku yang ditemukan</p>
            <Button
              onClick={() => window.location.href = '/ingredients/new'}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Bahan Baku Pertama
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Import the Plus icon to avoid circular imports
import { Plus } from 'lucide-react'

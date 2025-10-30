// Purchase Form Component - Lazy Loaded
// Form dialog for adding new ingredient purchases

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IngredientPurchaseInsertSchema, type IngredientPurchaseInsert } from '@/lib/validations/database-validations'
import type { AvailableIngredient } from './types'
import { uiLogger } from '@/lib/logger'

interface PurchaseFormProps {
  ingredients: AvailableIngredient[]
  onSubmit: (formData: {
    ingredient_id: string
    quantity: number
    unit_price: number
    supplier?: string
    purchase_date?: string
    notes?: string
  }) => void
  onSuccess: () => void
}

export default function PurchaseForm({ ingredients, onSubmit, onSuccess }: PurchaseFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<IngredientPurchaseInsert>({
    resolver: zodResolver(IngredientPurchaseInsertSchema),
    defaultValues: {
      ingredient_id: '',
      supplier: '',
      quantity: 0,
      unit_price: 0,
      purchase_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  })

  const handleSubmit = async (data: IngredientPurchaseInsert) => {
    try {
      await onSubmit({
        ingredient_id: data.ingredient_id,
        quantity: data.quantity,
        unit_price: data.unit_price,
        supplier: data.supplier || undefined,
        purchase_date: data.purchase_date,
        notes: data.notes || undefined
      })

      // Reset form
      form.reset({
        ingredient_id: '',
        supplier: '',
        quantity: 0,
        unit_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
      })

      void setIsDialogOpen(false)
      onSuccess()
    } catch (err) {
      uiLogger.error({ err }, 'Error creating purchase')
      alert('Gagal menambahkan pembelian')
    }
  }

  const watchedQty = form.watch('quantity')
  const watchedPrice = form.watch('unit_price')
  const total = watchedQty && watchedPrice ? watchedQty * watchedPrice : 0

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembelian
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-wrap-mobile">Tambah Pembelian Bahan Baku</DialogTitle>
            <DialogDescription>
              Input detail pembelian bahan baku baru
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient_id">Bahan Baku *</Label>
              <Select
                value={form.watch('ingredient_id')}
                onValueChange={(value) => form.setValue('ingredient_id', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.ingredient_id && (
                <p className="text-sm text-red-600">{form.formState.errors.ingredient_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Jumlah *</Label>
                <Input
                  id="qty_beli"
                  type="number"
                  step="0.01"
                  {...form.register('quantity', { valueAsNumber: true })}
                />
                {form.formState.errors.quantity && (
                  <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_price">Harga Satuan *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  {...form.register('unit_price', { valueAsNumber: true })}
                />
                {form.formState.errors.unit_price && (
                  <p className="text-sm text-red-600">{form.formState.errors.unit_price.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...form.register('supplier', { value: '' })}
              />
              {form.formState.errors.supplier && (
                <p className="text-sm text-red-600">{form.formState.errors.supplier.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal_beli">Tanggal Pembelian *</Label>
              <Input
                id="tanggal_beli"
                type="date"
                {...form.register('purchase_date')}
              />
              {form.formState.errors.purchase_date && (
                <p className="text-sm text-red-600">{form.formState.errors.purchase_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Input
                id="catatan"
                {...form.register('notes')}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-600">{form.formState.errors.notes.message}</p>
              )}
            </div>

            {total > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold">
                    Rp {total.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Pembelian'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

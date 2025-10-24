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

interface PurchaseFormProps {
  ingredients: AvailableIngredient[]
  onSubmit: (formData: IngredientPurchaseInsert) => void
  onSuccess: () => void
}

export default function PurchaseForm({ ingredients, onSubmit, onSuccess }: PurchaseFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<IngredientPurchaseInsert>({
    resolver: zodResolver(IngredientPurchaseInsertSchema),
    defaultValues: {
      bahan_id: '',
      supplier: '',
      qty_beli: 0,
      harga_satuan: 0,
      tanggal_beli: new Date().toISOString().split('T')[0],
      catatan: ''
    }
  })

  const handleSubmit = async (data: IngredientPurchaseInsert) => {
    try {
      await onSubmit(data)

      // Reset form
      form.reset({
        bahan_id: '',
        supplier: '',
        qty_beli: 0,
        harga_satuan: 0,
        tanggal_beli: new Date().toISOString().split('T')[0],
        catatan: ''
      })

      setIsDialogOpen(false)
      onSuccess()
    } catch (error) {
      console.error('Error creating purchase:', error)
      alert('Gagal menambahkan pembelian')
    }
  }

  const watchedQty = form.watch('qty_beli')
  const watchedPrice = form.watch('harga_satuan')
  const total = watchedQty && watchedPrice ? watchedQty * watchedPrice : 0

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembelian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Tambah Pembelian Bahan Baku</DialogTitle>
            <DialogDescription>
              Input detail pembelian bahan baku baru
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bahan_id">Bahan Baku *</Label>
              <Select
                value={form.watch('bahan_id')}
                onValueChange={(value) => form.setValue('bahan_id', value)}
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
              {form.formState.errors.bahan_id && (
                <p className="text-sm text-red-600">{form.formState.errors.bahan_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qty_beli">Jumlah *</Label>
                <Input
                  id="qty_beli"
                  type="number"
                  step="0.01"
                  {...form.register('qty_beli', { valueAsNumber: true })}
                />
                {form.formState.errors.qty_beli && (
                  <p className="text-sm text-red-600">{form.formState.errors.qty_beli.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="harga_satuan">Harga Satuan *</Label>
                <Input
                  id="harga_satuan"
                  type="number"
                  step="0.01"
                  {...form.register('harga_satuan', { valueAsNumber: true })}
                />
                {form.formState.errors.harga_satuan && (
                  <p className="text-sm text-red-600">{form.formState.errors.harga_satuan.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                {...form.register('supplier')}
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
                {...form.register('tanggal_beli')}
              />
              {form.formState.errors.tanggal_beli && (
                <p className="text-sm text-red-600">{form.formState.errors.tanggal_beli.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Input
                id="catatan"
                {...form.register('catatan')}
              />
              {form.formState.errors.catatan && (
                <p className="text-sm text-red-600">{form.formState.errors.catatan.message}</p>
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

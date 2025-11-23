'use client'

import { Plus } from '@/components/icons'
import { Button } from '@/components/ui/button'
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Row } from '@/types/database'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const purchaseFormSchema = z.object({
  ingredient_id: z.string().min(1, 'Pilih bahan baku'),
  quantity: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  unit_price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
  supplier: z.string().optional().nullable(),
  purchase_date: z.string().optional(),
  notes: z.string().optional().nullable(),
})

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>

interface PurchaseFormProps {
  ingredients: Array<Row<'ingredients'>>
  onSubmit: (data: PurchaseFormValues) => Promise<void>
  onSuccess: () => void
}

export function PurchaseForm({ ingredients, onSubmit, onSuccess }: PurchaseFormProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PurchaseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(purchaseFormSchema) as any,
    defaultValues: {
      ingredient_id: '',
      quantity: 0,
      unit_price: 0,
      supplier: '',
      purchase_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const handleSubmit = async (data: PurchaseFormValues) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      form.reset()
      setOpen(false)
      onSuccess()
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedIngredient = ingredients.find(
    (ing) => ing.id === form.watch('ingredient_id')
  )

  const quantity = form.watch('quantity') || 0
  const unitPrice = form.watch('unit_price') || 0
  const totalPrice = quantity * unitPrice

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pembelian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Pembelian Bahan Baku</DialogTitle>
          <DialogDescription>
            Catat pembelian bahan baku untuk update stok dan harga otomatis
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ingredient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bahan Baku *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bahan baku" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ingredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    {selectedIngredient && (
                      <p className="text-xs text-muted-foreground">
                        Satuan: {selectedIngredient.unit}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Satuan *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {totalPrice > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm font-medium">Total Pembelian</p>
                <p className="text-2xl font-bold">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama supplier (opsional)"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchase_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Pembelian</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan (opsional)"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Pembelian'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

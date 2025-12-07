'use client'

import { Plus } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { uiLogger } from '@/lib/logger'
import { successToast, errorToast } from '@/hooks/use-toast'

const SupplierFormSchema = z.object({
  name: z.string().min(1, 'Nama supplier wajib diisi'),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
  is_active: z.boolean(),
  notes: z.string().optional(),
})

type SupplierFormData = z.infer<typeof SupplierFormSchema>

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => Promise<void>
}

const SupplierForm = ({ onSubmit }: SupplierFormProps): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      is_active: true,
      notes: '',
    }
  })

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      await onSubmit(data)
      
      form.reset()
      setIsDialogOpen(false)
      successToast('Berhasil', 'Supplier berhasil ditambahkan')
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error))
      uiLogger.error({ error: normalizedError }, 'Error creating supplier')
      errorToast('Error', normalizedError.message || 'Gagal menambahkan supplier')
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Tambah Supplier</DialogTitle>
            <DialogDescription>
              Input detail supplier baru
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Supplier *</Label>
              <Input
                id="name"
                placeholder="PT. Supplier Jaya"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Nama Kontak</Label>
              <Input
                id="contact_person"
                placeholder="John Doe"
                {...form.register('contact_person')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  {...form.register('phone')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Opsional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email jika ada"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                placeholder="Jl. Supplier No. 123"
                {...form.register('address')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan tambahan..."
                {...form.register('notes')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Status Aktif</Label>
              <Switch
                id="is_active"
                // eslint-disable-next-line react-hooks/incompatible-library
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { SupplierForm }

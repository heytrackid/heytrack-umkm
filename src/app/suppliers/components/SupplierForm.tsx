'use client'

import { Building2, FileText, Mail, Phone, Plus, User } from '@/components/icons'
import { useState } from 'react'
import { z } from 'zod'

import { EntityForm, type FormSection } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { errorToast, successToast } from '@/hooks/use-toast'
import { uiLogger } from '@/lib/logger'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sections: FormSection[] = [
    {
      title: 'Informasi Supplier',
      fields: [
        { name: 'name', label: 'Nama Supplier', type: 'text', icon: Building2, required: true, placeholder: 'PT. Supplier Jaya' },
        { name: 'contact_person', label: 'Nama Kontak', type: 'text', icon: User, placeholder: 'John Doe' },
        { name: 'phone', label: 'Telepon', type: 'tel', icon: Phone, placeholder: '08123456789' },
        { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'Masukkan email jika ada' },
        { name: 'address', label: 'Alamat', type: 'textarea', icon: Building2, placeholder: 'Jl. Supplier No. 123', rows: 3 },
        { name: 'notes', label: 'Catatan', type: 'textarea', icon: FileText, placeholder: 'Catatan tambahan...', rows: 3 }
      ]
    },
    {
      title: 'Status',
      fields: [
        { name: 'is_active', label: 'Status Aktif', type: 'switch', description: 'Supplier aktif dapat menerima pesanan' }
      ]
    }
  ]

  const handleFormSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      setIsDialogOpen(false)
      successToast('Berhasil', 'Supplier berhasil ditambahkan')
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error))
      uiLogger.error({ error: normalizedError }, 'Error creating supplier')
      errorToast('Error', normalizedError.message || 'Gagal menambahkan supplier')
    } finally {
      setIsSubmitting(false)
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
      <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Supplier</DialogTitle>
        </DialogHeader>
        <EntityForm<SupplierFormData>
          title=""
          sections={sections}
          defaultValues={{
            name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            is_active: true,
            notes: '',
          }}
          schema={SupplierFormSchema}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsDialogOpen(false)}
          isLoading={isSubmitting}
          submitLabel="Simpan Supplier"
        />
      </DialogContent>
    </Dialog>
  )
}

export { SupplierForm }

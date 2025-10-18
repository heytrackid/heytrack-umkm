'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiCache, CACHE_PATTERNS } from '@/lib/api-cache'
import { Loader2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  address: z.string().optional(),
  customer_type: z.enum(['retail', 'wholesale', 'distributor']).default('retail'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerEditModalProps {
  customer: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CustomerEditModal({
  customer,
  isOpen,
  onClose,
  onSuccess
}: CustomerEditModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema)
  })

  const customerType = watch('customer_type')
  const status = watch('status')

  // Populate form when customer changes
  useEffect(() => {
    if (customer && isOpen) {
      reset({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        customer_type: customer.customer_type || 'retail',
        status: customer.status || 'active',
        notes: customer.notes || '',
      })
    }
  }, [customer, isOpen, reset])

  const handleUpdateCustomer = async (data: CustomerFormData) => {
    if (!customer?.id) return

    setIsLoading(true)

    try {
      // Clean up empty strings
      const cleanData = {
        ...data,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
      }

      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update customer')
      }

      const updatedCustomer = await response.json()

      // Invalidate cache
      apiCache.invalidate(CACHE_PATTERNS.CUSTOMERS || 'customers')

      toast({
        title: 'Berhasil Diupdate',
        description: `Pelanggan "${updatedCustomer.name}" berhasil diupdate`
      })

      onSuccess()
      onClose()

    } catch (error: any) {
      console.error('Update customer error:', error)
      toast({
        title: 'Gagal Update',
        description: error.message || 'Terjadi kesalahan saat mengupdate pelanggan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pelanggan</DialogTitle>
          <DialogDescription>
            Update informasi pelanggan. Field dengan tanda * wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleUpdateCustomer)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit_name">
              Nama Pelanggan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_name"
              {...register('name')}
              placeholder="Masukkan nama lengkap"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              {...register('email')}
              placeholder="contoh@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="edit_phone">
              Nomor Telepon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit_phone"
              {...register('phone')}
              placeholder="081234567890"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Customer Type */}
          <div className="space-y-2">
            <Label htmlFor="edit_customer_type">Tipe Pelanggan</Label>
            <Select
              value={customerType}
              onValueChange={(value) => setValue('customer_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe pelanggan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="edit_status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="edit_address">Alamat</Label>
            <Textarea
              id="edit_address"
              {...register('address')}
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit_notes">Catatan</Label>
            <Textarea
              id="edit_notes"
              {...register('notes')}
              placeholder="Catatan tambahan tentang pelanggan"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Pelanggan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

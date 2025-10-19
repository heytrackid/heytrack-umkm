'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiCache, CACHE_PATTERNS } from '@/lib/api-cache'
import { Loader2, UserPlus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const customerSchema = z.object({
  name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  phone: z.string().min(1, 'Nomor telepon wajib diisi'),
  address: z.string().optional(),
  customer_type: z.enum(['retail', 'wholesale', 'distributor']).default('retail'),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerCreateModalProps {
  onSuccess: () => void
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function CustomerCreateModal({
  onSuccess,
  trigger,
  open,
  onOpenChange
}: CustomerCreateModalProps) {
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customer_type: 'retail'
    }
  })

  const customerType = watch('customer_type')

  const handleCreateCustomer = async (data: CustomerFormData) => {
    setIsLoading(true)

    try {
      // Clean up empty strings
      const cleanData = {
        ...data,
        email: data.email || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create customer')
      }

      const newCustomer = await response.json()

      // Invalidate cache
      apiCache.invalidate(CACHE_PATTERNS.CUSTOMERS || 'customers')

      toast({
        title: 'Berhasil Ditambahkan',
        description: `Pelanggan "${newCustomer.name}" berhasil ditambahkan`
      })

      reset()
      handleOpenChange(false)
      onSuccess()

    } catch (error: unknown) {
      console.error('Create customer error:', error)
      toast({
        title: 'Gagal Menambahkan',
        description:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan saat menambahkan pelanggan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isControlled = typeof open === 'boolean'
  const dialogOpen = isControlled ? open : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  React.useEffect(() => {
    if (!dialogOpen) {
      reset()
    }
  }, [dialogOpen, reset])

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Tambah Pelanggan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          <DialogDescription>
            Masukkan informasi pelanggan baru. Field dengan tanda * wajib diisi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleCreateCustomer)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Pelanggan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="phone">
              Nomor Telepon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
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
            <Label htmlFor="customer_type">Tipe Pelanggan</Label>
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

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Catatan tambahan tentang pelanggan"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tambah Pelanggan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

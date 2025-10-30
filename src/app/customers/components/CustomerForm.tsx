// Customer Form Component
// Form untuk create dan edit customer dengan validasi lengkap

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { Loader2, Save, X, User, Phone, Mail, MapPin, Tag, Percent, FileText } from 'lucide-react'
import type { Database } from '@/types/supabase-generated'

type Customer = Database['public']['Tables']['customers']['Row']

// Form validation schema (without user_id - will be added on submit)
const CustomerFormSchema = z.object({
    name: z.string()
        .min(1, 'Nama pelanggan wajib diisi')
        .max(255, 'Nama terlalu panjang (maksimal 255 karakter)'),

    phone: z.string()
        .regex(/^[0-9+\-\s()]*$/, 'Format nomor telepon tidak valid')
        .max(20, 'Nomor telepon terlalu panjang')
        .optional()
        .or(z.literal('')),

    email: z.string()
        .email('Format email tidak valid')
        .max(255, 'Email terlalu panjang')
        .optional()
        .or(z.literal('')),

    address: z.string()
        .max(500, 'Alamat terlalu panjang (maksimal 500 karakter)')
        .optional()
        .or(z.literal('')),

    customer_type: z.enum(['retail', 'wholesale', 'vip', 'regular']).optional(),

    discount_percentage: z.string()
        .optional()
        .or(z.literal('')),

    notes: z.string()
        .max(1000, 'Catatan terlalu panjang (maksimal 1000 karakter)')
        .optional()
        .or(z.literal('')),

    is_active: z.boolean(),
})

type CustomerFormData = z.infer<typeof CustomerFormSchema>

interface CustomerFormProps {
    customer?: Customer | null
    onSuccess: () => void
    onCancel: () => void
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const isEditMode = !!customer

    const form = useForm<CustomerFormData>({
        resolver: zodResolver(CustomerFormSchema),
        defaultValues: {
            name: customer?.name || '',
            phone: customer?.phone || '',
            email: customer?.email || '',
            address: customer?.address || '',
            customer_type: (customer?.customer_type as 'retail' | 'wholesale' | 'vip' | 'regular') || 'regular',
            discount_percentage: customer?.discount_percentage?.toString() || '',
            notes: customer?.notes || '',
            is_active: customer?.is_active ?? true,
        },
    })

    const { register, handleSubmit, formState: { errors }, setValue, watch } = form
    const customerType = watch('customer_type')
    const isActive = watch('is_active')

    const onSubmit = handleSubmit(async (data: CustomerFormData) => {
        setIsSubmitting(true)

        try {
            // Prepare payload
            const payload = {
                name: data.name,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                customer_type: data.customer_type || 'regular',
                discount_percentage: data.discount_percentage ? parseFloat(data.discount_percentage) : null,
                notes: data.notes || null,
                is_active: data.is_active,
            }

            const url = isEditMode ? `/api/customers/${customer.id}` : '/api/customers'
            const method = isEditMode ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Gagal menyimpan data pelanggan')
            }

            toast({
                title: 'Berhasil',
                description: isEditMode
                    ? 'Data pelanggan berhasil diperbarui'
                    : 'Pelanggan baru berhasil ditambahkan',
                variant: 'default',
            })

            onSuccess()
        } catch (error: unknown) {
            apiLogger.error({ error }, 'Error saving customer')
            toast({
                title: 'Gagal',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
                </CardTitle>
                <CardDescription>
                    {isEditMode
                        ? 'Perbarui informasi pelanggan'
                        : 'Isi formulir di bawah untuk menambahkan pelanggan baru'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Informasi Dasar</h3>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Nama Pelanggan <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="Contoh: PT Maju Jaya"
                                className={errors.name ? 'border-destructive' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Nomor Telepon
                            </Label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="Contoh: 08123456789"
                                type="tel"
                                className={errors.phone ? 'border-destructive' : ''}
                            />
                            {errors.phone && (
                                <p className="text-sm text-destructive">{errors.phone.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                {...register('email')}
                                placeholder="Contoh: customer@example.com"
                                type="email"
                                className={errors.email ? 'border-destructive' : ''}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Alamat
                            </Label>
                            <Textarea
                                id="address"
                                {...register('address')}
                                placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
                                rows={3}
                                className={errors.address ? 'border-destructive' : ''}
                            />
                            {errors.address && (
                                <p className="text-sm text-destructive">{errors.address.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Customer Type & Discount */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Tipe & Diskon</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Customer Type */}
                            <div className="space-y-2">
                                <Label htmlFor="customer_type" className="flex items-center gap-2">
                                    <Tag className="h-4 w-4" />
                                    Tipe Pelanggan
                                </Label>
                                <Select
                                    value={customerType}
                                    onValueChange={(value) => setValue('customer_type', value as 'retail' | 'wholesale' | 'vip' | 'regular')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih tipe pelanggan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">Regular</SelectItem>
                                        <SelectItem value="retail">Retail</SelectItem>
                                        <SelectItem value="wholesale">Grosir</SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Discount Percentage */}
                            <div className="space-y-2">
                                <Label htmlFor="discount_percentage" className="flex items-center gap-2">
                                    <Percent className="h-4 w-4" />
                                    Diskon (%)
                                </Label>
                                <Input
                                    id="discount_percentage"
                                    {...register('discount_percentage')}
                                    placeholder="0"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className={errors.discount_percentage ? 'border-destructive' : ''}
                                />
                                {errors.discount_percentage && (
                                    <p className="text-sm text-destructive">{errors.discount_percentage.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Catatan Tambahan</h3>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Catatan
                            </Label>
                            <Textarea
                                id="notes"
                                {...register('notes')}
                                placeholder="Catatan khusus tentang pelanggan ini..."
                                rows={4}
                                className={errors.notes ? 'border-destructive' : ''}
                            />
                            {errors.notes && (
                                <p className="text-sm text-destructive">{errors.notes.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <Label htmlFor="is_active" className="text-base">
                                    Status Aktif
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Pelanggan aktif dapat melakukan pemesanan
                                </p>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={(checked) => setValue('is_active', checked)}
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {isEditMode ? 'Perbarui' : 'Simpan'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

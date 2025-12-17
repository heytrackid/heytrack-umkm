'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import type { Supplier } from './types'

const SupplierEditSchema = z.object({
    name: z.string().min(1, 'Nama supplier wajib diisi'),
    contact_person: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email tidak valid').optional().or(z.literal('')),
    address: z.string().optional(),
    supplier_type: z.enum(['preferred', 'standard', 'trial', 'blacklisted']),
    is_active: z.boolean(),
    notes: z.string().optional(),
    payment_terms: z.string().optional(),
    lead_time_days: z.coerce.number().min(0).optional(),
})

type SupplierEditData = z.infer<typeof SupplierEditSchema>

interface SupplierEditDialogProps {
    open: boolean
    supplier: Supplier | null
    onOpenChange: (open: boolean) => void
    onSubmit: (data: Partial<Supplier>) => Promise<void>
    isLoading?: boolean
}

export function SupplierEditDialog({
    open,
    supplier,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: SupplierEditDialogProps): JSX.Element {
    const form = useForm({
        resolver: zodResolver(SupplierEditSchema) as never,
        defaultValues: {
            name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            supplier_type: 'standard',
            is_active: true,
            notes: '',
            payment_terms: '',
            lead_time_days: 0,
        },
    })

    // Reset form when supplier changes
    useEffect(() => {
        if (supplier) {
            form.reset({
                name: supplier.name || '',
                contact_person: supplier.contact_person || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                supplier_type: (supplier.supplier_type as SupplierEditData['supplier_type']) || 'standard',
                is_active: supplier.is_active ?? true,
                notes: supplier.notes || '',
                payment_terms: supplier.payment_terms || '',
                lead_time_days: supplier.lead_time_days || 0,
            })
        }
    }, [supplier, form])

    const handleSubmit = async (data: Record<string, unknown>): Promise<void> => {
        const formData = data as SupplierEditData
        await onSubmit({
            name: formData.name,
            contact_person: formData.contact_person || null,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            supplier_type: formData.supplier_type,
            is_active: formData.is_active,
            notes: formData.notes || null,
            payment_terms: formData.payment_terms || null,
            lead_time_days: formData.lead_time_days || null,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Ubah detail supplier
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Supplier *</Label>
                            <Input
                                id="edit-name"
                                placeholder="PT. Supplier Jaya"
                                {...form.register('name')}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-contact_person">Nama Kontak</Label>
                            <Input
                                id="edit-contact_person"
                                placeholder="John Doe"
                                {...form.register('contact_person')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Telepon</Label>
                                <Input
                                    id="edit-phone"
                                    placeholder="08123456789"
                                    {...form.register('phone')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email (Opsional)</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    placeholder="Masukkan email jika ada"
                                    {...form.register('email')}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {form.formState.errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Alamat</Label>
                            <Textarea
                                id="edit-address"
                                placeholder="Jl. Supplier No. 123"
                                {...form.register('address')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-supplier_type">Tipe Supplier</Label>
                                <Select
                                    // eslint-disable-next-line react-hooks/incompatible-library
                                    value={form.watch('supplier_type')}
                                    onValueChange={(value) => 
                                        form.setValue('supplier_type', value as SupplierEditData['supplier_type'])
                                    }
                                >
                                    <SelectTrigger id="edit-supplier_type">
                                        <SelectValue placeholder="Pilih tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="preferred">Preferred</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="trial">Trial</SelectItem>
                                        <SelectItem value="blacklisted">Blacklisted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-lead_time_days">Lead Time (hari)</Label>
                                <Input
                                    id="edit-lead_time_days"
                                    type="number"
                                    min={0}
                                    placeholder="7"
                                    {...form.register('lead_time_days')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-payment_terms">Syarat Pembayaran</Label>
                            <Input
                                id="edit-payment_terms"
                                placeholder="Net 30"
                                {...form.register('payment_terms')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-notes">Catatan</Label>
                            <Textarea
                                id="edit-notes"
                                placeholder="Catatan tambahan..."
                                {...form.register('notes')}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <Label htmlFor="edit-is_active">Status Aktif</Label>
                            <Switch
                                id="edit-is_active"
                                checked={form.watch('is_active')}
                                onCheckedChange={(checked) => form.setValue('is_active', checked)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

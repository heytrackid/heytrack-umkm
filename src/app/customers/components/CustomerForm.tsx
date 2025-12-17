// Customer Form Component
// Form untuk create dan edit customer dengan validasi lengkap

'use client'

import { FileText, Mail, MapPin, Percent, Phone, Tag, User } from '@/components/icons'
import { z } from 'zod'

import { EntityForm, type FormSection } from '@/components/shared'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomers'
import { apiLogger } from '@/lib/logger'

import type { Row } from '@/types/database'

type Customer = Row<'customers'>

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

const CustomerForm = ({ customer, onSuccess, onCancel }: CustomerFormProps): JSX.Element => {
    const isEditMode = Boolean(customer)
    const createCustomerMutation = useCreateCustomer()
    const updateCustomerMutation = useUpdateCustomer()

    const sections: FormSection[] = [
        {
            title: 'Informasi Dasar',
            fields: [
                { name: 'name', label: 'Nama Pelanggan', type: 'text', icon: User, required: true, placeholder: 'Contoh: PT Maju Jaya' },
                { name: 'phone', label: 'Nomor Telepon', type: 'tel', icon: Phone, placeholder: 'Contoh: 08123456789' },
                { name: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'Contoh: customer@example.com' },
                { name: 'address', label: 'Alamat', type: 'textarea', icon: MapPin, placeholder: 'Contoh: Jl. Sudirman No. 123, Jakarta', rows: 3 }
            ]
        },
        {
            title: 'Tipe & Diskon',
            fields: [
                {
                    name: 'customer_type',
                    label: 'Tipe Pelanggan',
                    type: 'select',
                    icon: Tag,
                    options: [
                        { value: 'regular', label: 'Regular' },
                        { value: 'retail', label: 'Retail' },
                        { value: 'wholesale', label: 'Grosir' },
                        { value: 'vip', label: 'VIP' }
                    ]
                },
                { name: 'discount_percentage', label: 'Diskon (%)', type: 'number', icon: Percent, placeholder: '0', min: 0, max: 100, step: '0.1' }
            ]
        },
        {
            title: 'Catatan Tambahan',
            fields: [
                { name: 'notes', label: 'Catatan', type: 'textarea', icon: FileText, placeholder: 'Catatan khusus tentang pelanggan ini...', rows: 4 }
            ]
        },
        {
            title: 'Status',
            fields: [
                { name: 'is_active', label: 'Status Aktif', type: 'switch', description: 'Pelanggan aktif dapat melakukan pemesanan' }
            ]
        }
    ]

    const handleSubmit = async (data: CustomerFormData) => {
        try {
            const payload = {
                name: data.name,
                phone: data.phone ?? null,
                email: data.email ?? null,
                address: data.address ?? null,
                customer_type: data.customer_type ?? 'regular',
                discount_percentage: data.discount_percentage ? parseFloat(data.discount_percentage) : null,
                notes: data.notes ?? null,
                is_active: data.is_active,
            }

            if (isEditMode && customer?.id) {
                await updateCustomerMutation.mutateAsync({ id: customer.id, data: payload })
            } else {
                await createCustomerMutation.mutateAsync(payload)
            }

            onSuccess()
        } catch (error) {
            apiLogger.error({ error }, 'Error saving customer')
        }
    }

    return (
        <EntityForm<CustomerFormData>
            title={isEditMode ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
            description={isEditMode ? 'Perbarui informasi pelanggan' : 'Isi formulir di bawah untuk menambahkan pelanggan baru'}
            icon={User}
            sections={sections}
            defaultValues={{
                name: customer?.name ?? '',
                phone: customer?.phone ?? '',
                email: customer?.email ?? '',
                address: customer?.address ?? '',
                customer_type: (customer?.customer_type as 'regular' | 'retail' | 'vip' | 'wholesale') || 'regular',
                discount_percentage: customer?.discount_percentage?.toString() ?? '',
                notes: customer?.notes ?? '',
                is_active: customer?.is_active ?? true,
            }}
            schema={CustomerFormSchema}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isLoading={createCustomerMutation.isPending || updateCustomerMutation.isPending}
            isEditMode={isEditMode}
        />
    )
}

export { CustomerForm }

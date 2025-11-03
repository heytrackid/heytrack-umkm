'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'
import type { CustomersTable } from '@/types/database'
import { useState } from 'react'


/**
 * Customer Section Component
 * Handles customer selection and input
 */

type Customer = CustomersTable

interface CustomerFormData {
    customer_name: string
    customer_phone: string
    customer_address: string
    order_date: string
    priority: string
}

type CustomerField = keyof CustomerFormData

interface CustomerSectionProps {
    formData: CustomerFormData
    fieldErrors: Record<string, string>
    availableCustomers: Customer[]
    onInputChange: <K extends CustomerField>(field: K, value: CustomerFormData[K]) => void
    onClearError: (field: CustomerField) => void
}

export const CustomerSection = ({
    formData,
    fieldErrors,
    availableCustomers,
    onInputChange,
    onClearError
}: CustomerSectionProps) => {
    const [customerSearch, setCustomerSearch] = useState('')
    const [showNewCustomer, setShowNewCustomer] = useState(false)

    const selectCustomer = (customer: Customer | undefined) => {
        if (!customer) { return }
        onInputChange('customer_name', customer.name)
        onInputChange('customer_phone', customer.phone ?? '')
        onInputChange('customer_address', customer.address ?? '')
        setCustomerSearch('')
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h3 className="text-lg font-medium">Data Pelanggan</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCustomer(prev => !prev)}
                    className="self-end sm:self-auto"
                >
                    {showNewCustomer ? "Batalkan" : "Pelanggan Baru"}
                </Button>
            </div>

            {!showNewCustomer && (
                <div>
                    <Label className="text-sm font-medium">Cari Pelanggan</Label>
                    <div className="relative">
                        <Input
                            placeholder="Ketik nama atau nomor telepon..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="mt-1"
                        />
                        {customerSearch && (
                            <div className="absolute z-10 w-full bg-background border rounded-md mt-1 max-h-40 overflow-y-auto">
                                {availableCustomers
                                    .filter(customer =>
                                        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                                        (customer.phone?.includes(customerSearch))
                                    )
                                    .map(customer => (
                                        <div
                                            key={customer.id}
                                            className="p-2 hover:bg-muted cursor-pointer"
                                            onClick={() => selectCustomer(customer)}
                                        >
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <Label htmlFor="customerName" className="text-sm font-medium">Nama Pelanggan *</Label>
                    <Input
                        id="customerName"
                        placeholder="Contoh: Ibu Siti"
                        value={formData.customer_name}
                        onChange={(e) => {
                            onInputChange('customer_name', e.target.value)
                            if (fieldErrors['customer_name']) { onClearError('customer_name') }
                        }}
                        required
                        className={`mt-1 ${fieldErrors['customer_name'] ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        aria-invalid={!!fieldErrors['customer_name']}
                    />
                    {fieldErrors['customer_name'] && (
                        <div className="flex items-center gap-2 text-sm text-destructive mt-1">
                            <AlertCircle className="h-4 w-4" />
                            {fieldErrors['customer_name']}
                        </div>
                    )}
                </div>
                <div>
                    <Label htmlFor="customerPhone" className="text-sm font-medium">No. Telepon</Label>
                    <Input
                        id="customerPhone"
                        placeholder="Contoh: 08123456789"
                        value={formData.customer_phone}
                        onChange={(e) => onInputChange('customer_phone', e.target.value)}
                        className="mt-1"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="customerAddress" className="text-sm font-medium">Alamat Lengkap</Label>
                <Textarea
                    id="customerAddress"
                    placeholder="Contoh: Jl. Merdeka No. 123, Jakarta Pusat"
                    value={formData.customer_address}
                    onChange={(e) => onInputChange('customer_address', e.target.value)}
                    className="mt-1"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <Label htmlFor="orderDate" className="text-sm font-medium">Tanggal Pesanan *</Label>
                    <Input
                        id="orderDate"
                        type="date"
                        value={formData.order_date}
                        onChange={(e) => onInputChange('order_date', e.target.value)}
                        required
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="priority" className="text-sm font-medium">Prioritas</Label>
                    <select
                        className="w-full p-2 border border-input rounded-md bg-background mt-1"
                        value={formData.priority}
                        onChange={(e) => onInputChange('priority', e.target.value)}
                    >
                        <option value="low">Rendah</option>
                        <option value="normal">Normal</option>
                        <option value="high">Tinggi</option>
                        <option value="urgent">Mendesak</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Customer } from '@/types'
import type { OrderFormData } from '@/app/orders/new/hooks/useOrderLogic'

interface OrderCustomerStepProps {
  formData: OrderFormData
  customers: Customer[]
  onInputChange: (field: keyof OrderFormData, value: string | number | boolean) => void
  onSelectCustomer: (customer: Customer) => void
}

export default function OrderCustomerStep({
  formData,
  customers,
  onInputChange,
  onSelectCustomer
}: OrderCustomerStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Informasi Pelanggan Pelanggan</h3>
        {customers.length > 0 && (
          <Select onValueChange={(value) => {
            const customer = customers.find(c => c.id === value)
            if (customer) {onSelectCustomer(customer)}
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_name">Nama Pelanggan *</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => onInputChange('customer_name', e.target.value)}

            required
          />
        </div>
        <div>
          <Label htmlFor="customer_phone">No. Telepon</Label>
          <Input
            id="customer_phone"
            type="tel"
            value={formData.customer_phone}
            onChange={(e) => onInputChange('customer_phone', e.target.value)}

          />
        </div>
        <div>
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={(e) => onInputChange('customer_email', e.target.value)}

          />
        </div>
        <div>
          <Label htmlFor="order_date">Tanggal Pesan *</Label>
          <Input
            id="order_date"
            type="date"
            value={formData.order_date}
            onChange={(e) => onInputChange('order_date', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customer_address">Alamat Pelanggan</Label>
        <Textarea
          id="customer_address"
          value={formData.customer_address}
          onChange={(e) => onInputChange('customer_address', e.target.value)}

          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Prioritas</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => onInputChange('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Rendah</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => onInputChange('notes', e.target.value)}

          />
        </div>
      </div>
    </div>
  )
}

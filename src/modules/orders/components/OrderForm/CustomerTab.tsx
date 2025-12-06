'use client'

import { AlertCircle } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ORDER_PRIORITIES } from '@/lib/constants/index'
import { cn } from '@/lib/utils'

import type { Order } from '@/app/orders/types/orders-db.types'
import type { Row } from '@/types/database'
import type { OrderFormTabProps } from './types'

type Customer = Row<'customers'>

interface CustomerTabProps extends OrderFormTabProps {
  customerSearch: string
  setCustomerSearch: (value: string) => void
  showNewCustomer: boolean
  setShowNewCustomer: (value: boolean) => void
  availableCustomers: Customer[]
  onSelectCustomer: (customer: Customer | undefined) => void
}

export function CustomerTab({
  formData,
  onInputChange,
  fieldErrors,
  setFieldErrors,
  customerSearch,
  setCustomerSearch,
  showNewCustomer,
  setShowNewCustomer,
  availableCustomers,
  onSelectCustomer
}: CustomerTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h3 className="text-lg font-medium">Data Pelanggan</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowNewCustomer(!showNewCustomer)}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerSearch(e.target.value)}
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
                      key={customer['id']}
                      className="p-2 hover:bg-muted cursor-pointer"
                      onClick={() => onSelectCustomer(customer)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onSelectCustomer(customer)
                        }
                      }}
                      role="button"
                      tabIndex={0}
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
            value={formData['customer_name']}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onInputChange('customer_name', e.target.value)
              if (fieldErrors['customer_name']) {
                setFieldErrors(prev => {
                  const newErrors = { ...prev }
                  delete newErrors['customer_name']
                  return newErrors
                })
              }
            }}
            required
            className={cn(
              "mt-1",
              fieldErrors['customer_name'] && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={Boolean(fieldErrors['customer_name'])}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('customer_phone', e.target.value)}
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
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange('customer_address', e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('order_date', e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="priority" className="text-sm font-medium">Prioritas</Label>
          <select
            className="w-full p-2 border border-input rounded-md bg-background mt-1"
            value={formData.priority ?? 'normal'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onInputChange('priority', e.target.value as Order['priority'])}
          >
            {Object.entries(ORDER_PRIORITIES).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrderFormData } from '../hooks/useOrderLogic'

interface OrderDeliveryStepProps {
  formData: OrderFormData
  onInputChange: (field: keyof OrderFormData, value: any) => void
}

export default function OrderDeliveryStep({
  formData,
  onInputChange
}: OrderDeliveryStepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pengiriman & Jadwal</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delivery_method">Metode Pengiriman</Label>
          <Select 
            value={formData.delivery_method} 
            onValueChange={(value) => onInputChange('delivery_method', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Ambil di Toko</SelectItem>
              <SelectItem value="delivery">Diantar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.delivery_method === 'delivery' && (
          <div>
            <Label htmlFor="delivery_fee">Biaya Pengiriman</Label>
            <Input
              id="delivery_fee"
              type="number"
              min="0"
              value={formData.delivery_fee}
              onChange={(e) => onInputChange('delivery_fee', parseFloat(e.target.value) || 0)}

            />
          </div>
        )}

        <div>
          <Label htmlFor="delivery_date">Tanggal Pengiriman</Label>
          <Input
            id="delivery_date"
            type="date"
            value={formData.delivery_date}
            onChange={(e) => onInputChange('delivery_date', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="delivery_time">Waktu Pengiriman</Label>
          <Input
            id="delivery_time"
            type="time"
            value={formData.delivery_time}
            onChange={(e) => onInputChange('delivery_time', e.target.value)}
          />
        </div>
      </div>

      {formData.delivery_method === 'delivery' && (
        <div>
          <Label htmlFor="delivery_address">Alamat Pengiriman</Label>
          <Textarea
            id="delivery_address"
            value={formData.delivery_address}
            onChange={(e) => onInputChange('delivery_address', e.target.value)}

            rows={3}
          />
        </div>
      )}

      <div>
        <Label htmlFor="special_instructions">Instruksi Khusus</Label>
        <Textarea
          id="special_instructions"
          value={formData.special_instructions}
          onChange={(e) => onInputChange('special_instructions', e.target.value)}

          rows={3}
        />
      </div>
    </div>
  )
}

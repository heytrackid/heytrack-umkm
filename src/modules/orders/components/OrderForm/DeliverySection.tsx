/**
 * Delivery Section Component
 * Handles delivery information
 */

'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { safeNumber } from '@/lib/type-guards'

interface DeliverySectionProps {
    formData: {
        delivery_date: string
        delivery_time: string
        delivery_fee: number
        notes: string
        special_instructions: string
    }
    onInputChange: <K extends keyof any>(field: K, value: any) => void
}

export const DeliverySection = ({ formData, onInputChange }: DeliverySectionProps) => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                    <Label htmlFor="deliveryDate" className="text-sm font-medium">Tanggal Pengiriman</Label>
                    <Input
                        id="deliveryDate"
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => onInputChange('delivery_date', e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="deliveryTime" className="text-sm font-medium">Jam Pengiriman</Label>
                    <Input
                        id="deliveryTime"
                        type="time"
                        value={formData.delivery_time}
                        onChange={(e) => onInputChange('delivery_time', e.target.value)}
                        className="mt-1"
                    />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                    <Label htmlFor="deliveryFee" className="text-sm font-medium">Biaya Ongkir (Rp)</Label>
                    <Input
                        id="deliveryFee"
                        type="number"
                        placeholder="0"
                        value={formData.delivery_fee}
                        onChange={(e) => onInputChange('delivery_fee', safeNumber(e.target.value, 0))}
                        min="0"
                        step="1000"
                        className="mt-1"
                    />
                </div>
            </div>
            <div>
                <Label htmlFor="notes" className="text-sm font-medium">Catatan Pesanan</Label>
                <Textarea
                    id="notes"
                    placeholder="Contoh: Pesanan untuk acara ulang tahun"
                    value={formData.notes}
                    onChange={(e) => onInputChange('notes', e.target.value)}
                    className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="specialInstructions" className="text-sm font-medium">Permintaan Khusus</Label>
                <Textarea
                    id="specialInstructions"
                    placeholder="Contoh: Tolong dikemas dengan box premium"
                    value={formData.special_instructions}
                    onChange={(e) => onInputChange('special_instructions', e.target.value)}
                    className="mt-1"
                />
            </div>
        </div>
    )

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import WhatsAppFollowUp from './whatsapp-followup'

// Example usage of WhatsApp Follow-up Component
export default function WhatsAppFollowUpExample() {
  const sampleOrder = {
    id: 'sample-order-1',
    order_number: 'ORD-20241201-001',
    customer_name: 'Ibu Sari Widya',
    customer_phone: '08123456789',
    status: 'confirmed',
    order_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 125000,
    items: [
      {
        product_name: 'Kue Ulang Tahun Coklat',
        quantity: 1
      },
      {
        product_name: 'Brownies Premium',
        quantity: 2
      }
    ],
    payment_status: 'partial',
    remaining_amount: 50000
  }

  const handleMessageSent = (method: 'whatsapp' | 'business', message: string, phone: string) => {
    console.log(`✅ WhatsApp message sent successfully!`)
    console.log(`Method: ${method}`)
    console.log(`Phone: ${phone}`)
    console.log(`Message Length: ${message.length} characters`)
    
    // Here you can add logic to:
    // 1. Log the activity to database
    // 2. Update order status if needed
    // 3. Send analytics events
    // 4. Show success notification to user
    alert(`Pesan berhasil dikirim via ${method} ke ${phone}`)
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 WhatsApp Follow-up Component Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Komponen ini memungkinkan Anda mengirim pesan follow-up kepada pelanggan dengan berbagai template otomatis.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Sample Order Details:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Order:</strong> {sampleOrder.order_number}</p>
                <p><strong>Customer:</strong> {sampleOrder.customer_name}</p>
                <p><strong>Phone:</strong> {sampleOrder.customer_phone}</p>
                <p><strong>Status:</strong> {sampleOrder.status}</p>
                <p><strong>Total:</strong> Rp {sampleOrder.total_amount.toLocaleString('id-ID')}</p>
                <p><strong>Items:</strong> {sampleOrder.items.length} produk</p>
              </div>
            </div>
            
            <WhatsAppFollowUp 
              order={sampleOrder}
              onSent={handleMessageSent}
            />
          </div>
          
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">✨ Features:</h4>
            <ul className="space-y-1 pl-4">
              <li>• 📱 Support WhatsApp Regular & WhatsApp Business</li>
              <li>• 📝 5 template pesan siap pakai (konfirmasi, siap, payment reminder, dll)</li>
              <li>• ✏️ Custom message dengan preview real-time</li>
              <li>• 📋 Copy to clipboard functionality</li>
              <li>• 🔢 Auto-format nomor telepon Indonesia</li>
              <li>• 📊 Callback untuk tracking dan analytics</li>
              <li>• 📱 Mobile-responsive design</li>
              <li>• 🚀 Lazy loading untuk performa optimal</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
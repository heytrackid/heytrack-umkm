'use client'

import { MessageSquare, Phone, Mail } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Supplier } from './types'

interface SupplierFollowupProps {
  supplier: Supplier | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSent?: (type: 'phone' | 'email' | 'whatsapp', message: string) => void
}

const SUPPLIER_TEMPLATES = {
  inquiry: {
    title: 'Inquiry Harga & Stok',
    message: `Halo ${'{supplier_name}'},

Saya ingin menanyakan informasi terkini:
1. Harga bahan ${'{ingredient_name}'} saat ini
2. Stok yang tersedia
3. Lead time pengiriman

Mohon informasi detailnya ya.

Terima kasih,
${'{your_name}'}
${'{your_business}'}`,
  },
  reminder: {
    title: 'Reminder Pembayaran',
    message: `Halo ${'{supplier_name}'},

Saya ingin mengingatkan mengenai pembayaran untuk pesanan:
- Invoice: ${'{invoice_number}'}
- Total: Rp ${'{amount}'}
- Tanggal jatuh tempo: ${'{due_date}'}

Mohon konfirmasi penerimaan pembayaran.

Terima kasih,
${'{your_name}'}
${'{your_business}'}`,
  },
  followup: {
    title: 'Follow Up Order',
    message: `Halo ${'{supplier_name}'},

Saya ingin menanyakan status order:
- Order ID: ${'{order_id}'}
- Tanggal order: ${'{order_date}'}
- Status terakhir: ${'{current_status}'}

Apakah ada update terbaru?

Terima kasih,
${'{your_name}'}
${'{your_business}'}`,
  },
}

export const SupplierFollowup = ({
  supplier,
  open,
  onOpenChange,
  onSent
}: SupplierFollowupProps) => {
  if (!supplier) return null

  const handleSend = (type: 'phone' | 'email' | 'whatsapp', template: keyof typeof SUPPLIER_TEMPLATES) => {
    const templateData = SUPPLIER_TEMPLATES[template]
    const message = templateData.message
      .replace('{supplier_name}', supplier.name)
      .replace('{your_name}', 'Admin') // TODO: Get from user context
      .replace('{your_business}', 'HeyTrack') // TODO: Get from business settings

    onSent?.(type, message)

    // Handle different communication types
    switch (type) {
      case 'phone':
        window.open(`tel:${supplier.phone}`, '_blank')
        break
      case 'email':
        window.open(`mailto:${supplier.email}?subject=${encodeURIComponent(templateData.title)}&body=${encodeURIComponent(message)}`, '_blank')
        break
      case 'whatsapp':
        if (supplier.phone) {
          const whatsappUrl = `https://wa.me/${supplier.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
          window.open(whatsappUrl, '_blank')
        }
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Follow Up Supplier
          </DialogTitle>
          <DialogDescription>
            Komunikasi dengan supplier {supplier.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Supplier Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                {supplier.name}
                <Badge variant={
                  supplier.supplier_type === 'preferred' ? 'default' :
                  supplier.supplier_type === 'standard' ? 'secondary' :
                  supplier.supplier_type === 'trial' ? 'outline' : 'destructive'
                }>
                  {supplier.supplier_type || 'standard'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {supplier.contact_person && (
                <p className="text-sm text-muted-foreground">
                  <strong>Kontak:</strong> {supplier.contact_person}
                </p>
              )}
              {supplier.phone && (
                <p className="text-sm text-muted-foreground">
                  <strong>Phone:</strong> {supplier.phone}
                </p>
              )}
              {supplier.email && (
                <p className="text-sm text-muted-foreground">
                  <strong>Email:</strong> {supplier.email}
                </p>
              )}
              {supplier.rating && (
                <p className="text-sm text-muted-foreground">
                  <strong>Rating:</strong> {supplier.rating}/5 ⭐
                </p>
              )}
            </CardContent>
          </Card>

          {/* Communication Templates */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Pilih Template Pesan</h3>

            {Object.entries(SUPPLIER_TEMPLATES).map(([key, template]) => (
              <Card key={key} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
                    {template.message
                      .replace('{supplier_name}', supplier.name)
                      .replace('{your_name}', 'Admin')
                      .replace('{your_business}', 'HeyTrack')
                    }
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    {supplier.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend('phone', key as keyof typeof SUPPLIER_TEMPLATES)}
                        className="flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Telepon
                      </Button>
                    )}

                    {supplier.email && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend('email', key as keyof typeof SUPPLIER_TEMPLATES)}
                        className="flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    )}

                    {supplier.phone && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSend('whatsapp', key as keyof typeof SUPPLIER_TEMPLATES)}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        📱 WhatsApp
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
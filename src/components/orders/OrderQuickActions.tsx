'use client'

import {
    Phone,
    MessageSquare,
    MapPin,
    Copy,
    Check
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import type { Order } from '@/components/orders/types'


interface OrderQuickActionsProps {
    order: Order
}

const OrderQuickActions = ({ order }: OrderQuickActionsProps) => {
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        } catch (_error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = text
            document['body'].appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document['body'].removeChild(textArea)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        }
    }

    const handleCall = () => {
        if (order.customer_phone) {
            window.location.href = `tel:${order.customer_phone}`
        }
    }

    // Email functionality removed - field doesn't exist in database
    // const handleEmail = () => {
    //     if (order.customer_email) {
    //         window.location.href = `mailto:${order.customer_email}`
    //     }
    // }

    const handleWhatsApp = () => {
        if (order.customer_phone) {
            const phone = order.customer_phone.replace(/\D/g, '')
            const message = encodeURIComponent(
                `Halo ${order['customer_name']}, terima kasih atas pesanan Anda (${order['order_no']}). `
            )
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
        }
    }

    const handleMaps = () => {
        if (order.customer_address) {
            const address = encodeURIComponent(order.customer_address)
            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                    {order.customer_phone && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCall}
                                className="flex items-center gap-2"
                            >
                                <Phone className="h-4 w-4" />
                                Telepon
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleWhatsApp}
                                className="flex items-center gap-2 text-foreground hover:text-primary"
                            >
                                <MessageSquare className="h-4 w-4" />
                                WhatsApp
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(order.customer_phone ?? '', 'phone')}
                                className="flex items-center gap-2"
                            >
                                {copiedField === 'phone' ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Tersalin
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        Salin No.
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {/* Email buttons removed - field doesn't exist in database */}

                    {order.customer_address && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMaps}
                            className="flex items-center gap-2 col-span-2"
                        >
                            <MapPin className="h-4 w-4" />
                            Buka di Maps
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export { OrderQuickActions }
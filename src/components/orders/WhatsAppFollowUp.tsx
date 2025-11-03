/* eslint-disable no-nested-ternary */
'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSettings } from '@/contexts/settings-context';
import type { OrderData } from '@/lib/communications/types';
import { WhatsAppService } from '@/lib/communications/whatsapp';
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('WhatsAppFollowUp');
import { Check, Copy, MessageCircle, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';



interface OrderItemData {
  recipe_name: string;
  quantity: number;
  price_per_unit: number;
  name?: string;
}

interface WhatsAppFollowUpProps {
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    delivery_date?: string;
    status: string;
    order_items?: OrderItemData[];
    notes?: string;
  };
  businessName?: string;
  onSent?: (type: 'whatsapp' | 'business', message: string) => void;
}

const WhatsAppFollowUp = ({
  order,
  businessName = 'UMKM UMKM',
  onSent
}: WhatsAppFollowUpProps) => {
  const { formatCurrency } = useSettings();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('order_confirmation');
  const [customMessage, setCustomMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState('BCA 1234567890 a/n UMKM UMKM');
  const [copied, setCopied] = useState<string | null>(null);
  const [businessSettings, setBusinessSettings] = useState({
    businessNumber: '',
    useBusinessAPI: false
  });

  const templates = WhatsAppService.getDefaultTemplates();

  // Convert order data to WhatsApp service format
  const convertOrderData = (order: WhatsAppFollowUpProps['order']): OrderData => ({
    id: order.id,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    total_amount: order.total_amount,
    delivery_date: order.delivery_date,
    status: order.status,
    items: order.order_items?.map((item: OrderItemData) => ({
      name: (item.recipe_name ?? item.name) ?? 'Product',
      quantity: item.quantity || 1,
      price: item.price_per_unit || 0
    })) ?? [],
    notes: order.notes
  });

  // Generate message based on selected template
  const generateMessage = () => {
    if (isCustomTemplate) {
      setGeneratedMessage(customMessage);
      return;
    }

    try {
      const orderData = convertOrderData(order);
      const template = templates.find(t => t.id === selectedTemplate);

      if (!template) {
        throw new Error('Template not found');
      }

      let message = template.template;

      // Format order items
      const orderItems = orderData.items.map(item =>
        `• ${item.name} (${item.quantity}x) - ${formatCurrency(item.price * item.quantity)}`
      ).join('\n');

      // Replace variables in template
      const replacements: Record<string, string> = {
        customer_name: orderData.customer_name,
        order_id: orderData.id,
        total_amount: formatCurrency(orderData.total_amount),
        delivery_date: orderData.delivery_date ?? 'Sesuai kesepakatan',
        business_name: businessName,
        order_items: orderItems,
        notes: orderData.notes ?? '',
        payment_deadline: new Date().toLocaleDateString('id-ID'),
        payment_account: paymentDetails,
        delivery_status: 'Dalam perjalanan',
        estimated_time: '30 menit',
        driver_name: 'Driver',
        driver_phone: '-'
      };

      // Replace all variables
      Object.entries(replacements).forEach(([key, value]) => {
        message = message.replace(new RegExp(`{${key}}`, 'g'), value);
      });

      setGeneratedMessage(message);
    } catch (err: unknown) {
      logger.error({ err }, 'Error generating message:');
      toast.error('Gagal generate pesan. Coba template lain.');
    }
  };

  // Generate WhatsApp URLs
  const getWhatsAppURLs = () => {
    const orderData = convertOrderData(order);
    const message = generatedMessage || customMessage;
    const encodedMessage = encodeURIComponent(message);
    const phone = orderData.customer_phone.replace(/\D/g, ''); // Remove non-digits

    return {
      whatsapp: `https://wa.me/${phone}?text=${encodedMessage}`,
      business: `https://api.whatsapp.com/send?phone=${phone}&text=${encodedMessage}`
    };
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success('Berhasil disalin!');
      setTimeout(() => setCopied(null), 2000);
    } catch (_err: unknown) {
      toast.error('Gagal menyalin text');
    }
  };

  // Handle send action
  const handleSend = (type: 'whatsapp' | 'business') => {
    const urls = getWhatsAppURLs();
    const url = type === 'whatsapp' ? urls.whatsapp : urls.business;
    const message = generatedMessage || customMessage;

    // Open WhatsApp with the message
    window.open(url, '_blank');

    // Call callback if provided
    if (onSent) {
      onSent(type, message);
    }

    toast.success(`WhatsApp ${type === 'business' ? 'Business' : ''} terbuka!`);
  };

  useEffect(() => {
    if (!isCustomTemplate) {
      generateMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, paymentDetails, businessName, isCustomTemplate]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp Follow-up
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gray-600" />
            WhatsApp Follow-up untuk {order.customer_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Template & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Pilih Template</Label>
                  <Select
                    value={isCustomTemplate ? 'custom' : selectedTemplate}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setIsCustomTemplate(true);
                      } else {
                        setIsCustomTemplate(false);
                        setSelectedTemplate(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.category.replace('_', ' ')}
                            </Badge>
                            {template.name}
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">custom</Badge>
                          Pesan Custom
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Info */}
                {!isCustomTemplate && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </div>
                )}

                {/* Payment Details (for payment reminder) */}
                {selectedTemplate === 'payment_reminder' && (
                  <div className="space-y-2">
                    <Label>Detail Pembayaran</Label>
                    <Input
                      value={paymentDetails}
                      onChange={(e) => setPaymentDetails(e.target.value)}

                    />
                  </div>
                )}

                {/* Business Settings */}
                <div className="space-y-2">
                  <Label>Pengaturan Bisnis</Label>
                  <Input

                    value={businessSettings.businessNumber}
                    onChange={(e) => setBusinessSettings({
                      ...businessSettings,
                      businessNumber: e.target.value
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Info Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {order.id}</div>
                  <div><strong>Customer:</strong> {order.customer_name}</div>
                  <div><strong>Phone:</strong> {order.customer_phone}</div>
                  <div><strong>Total:</strong> {formatCurrency(order.total_amount)}</div>
                  <div><strong>Status:</strong>
                    <Badge className="ml-2" variant={
                      order.status === 'COMPLETED' ? 'default' :
                        order.status === 'PENDING' ? 'secondary' : 'outline'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  {order.delivery_date && (
                    <div><strong>Pengiriman:</strong> {new Date(order.delivery_date).toLocaleDateString('id-ID')}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Message Preview & Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Preview Pesan</CardTitle>
              </CardHeader>
              <CardContent>
                {isCustomTemplate ? (
                  <div className="space-y-4">
                    <Label>Tulis Pesan Custom</Label>
                    <Textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}

                      className="min-h-[200px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <div className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                        {generatedMessage || 'Generating message...'}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedMessage, 'message')}
                      className="gap-2"
                    >
                      {copied === 'message' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied === 'message' ? 'Tersalin!' : 'Salin Pesan'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Kirim via WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <SwipeableTabs defaultValue="regular" className="w-full">
                  <SwipeableTabsList className="grid w-full grid-cols-2">
                    <SwipeableTabsTrigger value="regular">WhatsApp Biasa</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="business">WhatsApp Business</SwipeableTabsTrigger>
                  </SwipeableTabsList>

                  <SwipeableTabsContent value="regular" className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Buka WhatsApp regular dengan pesan yang sudah disiapkan
                    </div>
                    <Button
                      onClick={() => handleSend('whatsapp')}
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                      disabled={!generatedMessage && !customMessage}
                    >
                      <Send className="h-4 w-4" />
                      Buka WhatsApp
                    </Button>
                  </SwipeableTabsContent>

                  <SwipeableTabsContent value="business" className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Buka WhatsApp Business dengan pesan yang sudah disiapkan
                    </div>
                    <Button
                      onClick={() => handleSend('business')}
                      className="w-full gap-2 bg-green-800 hover:bg-gray-900"
                      disabled={!generatedMessage && !customMessage}
                    >
                      <Send className="h-4 w-4" />
                      Buka WhatsApp Business
                    </Button>
                  </SwipeableTabsContent>
                </SwipeableTabs>

                {/* URL Preview */}
                <div className="mt-4 space-y-2">
                  <Label className="text-xs text-gray-500">Generated URLs (for debugging):</Label>
                  <div className="space-y-1">
                    {getWhatsAppURLs().whatsapp && (
                      <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                        <strong>Regular:</strong> {getWhatsAppURLs().whatsapp.substring(0, 100)}...
                      </div>
                    )}
                    {getWhatsAppURLs().business && (
                      <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                        <strong>Business:</strong> {getWhatsAppURLs().business.substring(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppFollowUp;

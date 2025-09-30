'use client';

import React, { useState } from 'react';
import { MessageCircle, Send, Edit, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhatsAppService, WhatsAppTemplate, OrderData, whatsappService } from '@/lib/whatsapp-service';
import { toast } from 'react-hot-toast';
import { useSettings } from '@/contexts/settings-context';

interface WhatsAppFollowUpProps {
  order: {
    id: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    delivery_date?: string;
    status: string;
    order_items?: Array<{
      recipe_name: string;
      quantity: number;
      price_per_unit: number;
    }>;
    notes?: string;
  };
  businessName?: string;
  onSent?: (type: 'whatsapp' | 'business', message: string) => void;
}

const WhatsAppFollowUp: React.FC<WhatsAppFollowUpProps> = ({ 
  order, 
  businessName = 'Bakery UMKM',
  onSent 
}) => {
  const { formatCurrency } = useSettings();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('order_confirmation');
  const [customMessage, setCustomMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState('BCA 1234567890 a/n Bakery UMKM');
  const [copied, setCopied] = useState<string | null>(null);
  const [businessSettings, setBusinessSettings] = useState({
    businessNumber: '',
    useBusinessAPI: false
  });

  const templates = whatsappService.getTemplates();

  // Convert order data to WhatsApp service format
  const convertOrderData = (order: any): OrderData => ({
    id: order.id,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    total_amount: order.total_amount,
    delivery_date: order.delivery_date,
    status: order.status,
    items: order.order_items?.map((item: any) => ({
      name: item.recipe_name || item.name || 'Product',
      quantity: item.quantity || 1,
      price: item.price_per_unit || 0
    })) || [],
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
      let result;

      switch (selectedTemplate) {
        case 'order_confirmation':
          result = whatsappService.generateOrderConfirmation(orderData, businessName);
          break;
        case 'payment_reminder':
          result = whatsappService.generatePaymentReminder(orderData, businessName, paymentDetails);
          break;
        case 'follow_up':
          result = whatsappService.generateFollowUp(orderData, businessName, 10);
          break;
        default:
          // For other templates, use the generic method
          const template = templates.find(t => t.id === selectedTemplate);
          if (template) {
            const templateData = {
              customer_name: orderData.customer_name,
              order_id: orderData.id,
              total_amount: whatsappService.formatCurrency(orderData.total_amount),
              delivery_date: orderData.delivery_date ? whatsappService.formatDate(orderData.delivery_date) : 'Sesuai kesepakatan',
              business_name: businessName,
              order_items: whatsappService.formatOrderItems(orderData.items),
              ready_time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              delivery_status: 'Dalam perjalanan',
              estimated_arrival: '30 menit',
              additional_notes: 'Driver akan menghubungi Anda',
              due_date: whatsappService.formatDate(new Date()),
              payment_details: paymentDetails,
              product_name: orderData.items[0]?.name || 'pesanan',
              discount: '10'
            };
            result = whatsappService.generateCustomMessage(selectedTemplate, templateData, orderData.customer_phone);
          } else {
            throw new Error('Template not found');
          }
      }

      setGeneratedMessage(result.message);
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Gagal generate pesan. Coba template lain.');
    }
  };

  // Generate WhatsApp URLs
  const getWhatsAppURLs = () => {
    const orderData = convertOrderData(order);
    const message = generatedMessage || customMessage;
    
    return {
      whatsapp: whatsappService.generateWhatsAppURL(orderData.customer_phone, message, false),
      business: whatsappService.generateWhatsAppURL(orderData.customer_phone, message, true)
    };
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeTex"";
      setCopied(type);
      toast.success('Berhasil disalin!');
      setTimeou"" => setCopied(null), 2000);
    } catch (error) {
      toast.error('Gagal menyalin text');
    }
  };

  // Handle send action
  const handleSend = (type: 'whatsapp' | 'business') => {
    const urls = getWhatsAppURLs();
    const url = type === 'whatsapp' ? urls.whatsapp : urls.business;
    
    // Open WhatsApp with the message
    window.open(url, '_blank');
    
    // Call callback if provided
    if (onSent) {
      onSen"";
    }
    
    toast.success(`WhatsApp ${type === 'business' ? 'Business' : ''} terbuka!`);
  };

  React.useEffec"" => {
    if (!isCustomTemplate) {
      generateMessage();
    }
  }, [selectedTemplate, paymentDetails, businessName, isCustomTemplate]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          WhatsApp Follow-up
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
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
                      placeholder="BCA 1234567890 a/n Nama"
                    />
                  </div>
                )}

                {/* Business Settings */}
                <div className="space-y-2">
                  <Label>Pengaturan Bisnis</Label>
                  <Input
                    placeholder="Nomor WhatsApp Business (opsional)"
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
                      placeholder="Tulis pesan WhatsApp custom di sini..."
                      className="min-h-[200px]"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm text-green-800 whitespace-pre-wrap font-mono">
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
                <Tabs defaultValue="regular" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="regular">WhatsApp Biasa</TabsTrigger>
                    <TabsTrigger value="business">WhatsApp Business</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="regular" className="space-y-4">
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
                  </TabsContent>
                  
                  <TabsContent value="business" className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Buka WhatsApp Business dengan pesan yang sudah disiapkan
                    </div>
                    <Button
                      onClick={() => handleSend('business')}
                      className="w-full gap-2 bg-green-800 hover:bg-green-900"
                      disabled={!generatedMessage && !customMessage}
                    >
                      <Send className="h-4 w-4" />
                      Buka WhatsApp Business
                    </Button>
                  </TabsContent>
                </Tabs>

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
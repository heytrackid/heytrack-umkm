// Template Preview Component - Lazy Loaded
// Preview dialog for WhatsApp templates

// import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { MessageCircle } from 'lucide-react'
import type { WhatsAppTemplate } from './types'

interface TemplatePreviewProps {
  showPreview: boolean
  onOpenChange: (open: boolean) => void
  template: WhatsAppTemplate | null
}

export default function TemplatePreview({
  showPreview,
  onOpenChange,
  template
}: TemplatePreviewProps) {
  const getCategoryLabel = (category: string) => {
    const categories = [
      { value: 'order_management', label: 'Manajemen Pesanan' },
      { value: 'payment', label: 'Pembayaran' },
      { value: 'delivery', label: 'Pengiriman' },
      { value: 'customer_service', label: 'Layanan Pelanggan' },
      { value: 'promotion', label: 'Promosi' },
      { value: 'general', label: 'Umum' }
    ]
    return categories.find(cat => cat.value === category)?.label || category
  }

  return (
    <Dialog open={showPreview} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Preview Template</DialogTitle>
          <DialogDescription>
            {template?.name} - {getCategoryLabel(template?.category || '')}
          </DialogDescription>
        </DialogHeader>

        {template && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">WhatsApp Preview</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-green-800 font-mono">
                {template.template_content}
              </pre>
            </div>

            <div>
              <Label>Variables yang digunakan:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.variables.map((variable) => (
                  <Badge key={variable} variant="secondary">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

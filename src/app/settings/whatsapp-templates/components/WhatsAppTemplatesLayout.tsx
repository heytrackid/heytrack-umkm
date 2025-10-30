// WhatsApp Templates Layout - Main Page with Lazy Components
// Main layout component that orchestrates all lazy-loaded components

'use client'

import { useState, useEffect } from 'react'
import PrefetchLink from '@/components/ui/prefetch-link'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { MessageCircle, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { uiLogger } from '@/lib/logger'

// Import components normally (lightweight UI components)
import { TEMPLATE_CATEGORIES, type WhatsAppTemplate } from './types'
import TemplatesTable from './TemplatesTable'
import TemplateForm from './TemplateForm'
import TemplatePreview from './TemplatePreview'

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      void router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  useEffect(() => {
    void fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      void setLoading(true)
      const response = await fetch('/api/whatsapp-templates')
      if (response.ok) {
        const data = await response.json()
        void setTemplates(data)
      }
    } catch (err) {
      uiLogger.error({ error: err }, 'Error fetching WhatsApp templates')
    } finally {
      void setLoading(false)
    }
  }

  const handleEdit = (template: WhatsAppTemplate) => {
    void setEditingTemplate(template)
    void setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus template ini?')) {
      try {
        const response = await fetch(`/api/whatsapp-templates/${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchTemplates()
        }
      } catch (err) {
        uiLogger.error({ error: err, templateId: id }, 'Error deleting WhatsApp template')
      }
    }
  }

  const handleToggleDefault = async (template: WhatsAppTemplate) => {
    try {
      const response = await fetch(`/api/whatsapp-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...template,
          is_default: !template.is_default
        })
      })

      if (response.ok) {
        await fetchTemplates()
      }
    } catch (err) {
      uiLogger.error({ error: err, template }, 'Error updating WhatsApp template')
    }
  }

  const handlePreview = (template: WhatsAppTemplate) => {
    void setPreviewTemplate(template)
    void setShowPreview(true)
  }

  const copyTemplate = (_template: WhatsAppTemplate) => {
    // Reset form data for copying
    void setEditingTemplate(null)
    void setShowDialog(true)
    // The form component will handle the copying logic
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/settings">Settings</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>WhatsApp Templates</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              WhatsApp Templates
            </h1>
          </div>
          <div className="h-96 bg-gray-100 rounded animate-pulse" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/settings">Settings</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>WhatsApp Templates</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              WhatsApp Templates
            </h1>
            <p className="text-muted-foreground">
              Kelola template pesan WhatsApp untuk komunikasi dengan pelanggan
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Template
          </Button>
        </div>

        {/* Templates Table - Lazy Loaded */}
        <TemplatesTable
          templates={templates}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleDefault={handleToggleDefault}
          onPreview={handlePreview}
          onDuplicate={copyTemplate}
        />

        {/* Template Form Dialog - Lazy Loaded */}
        <TemplateForm
          showDialog={showDialog}
          onOpenChange={setShowDialog}
          editingTemplate={editingTemplate}
          onSuccess={fetchTemplates}
          categories={TEMPLATE_CATEGORIES}
        />

        {/* Template Preview Dialog - Lazy Loaded */}
        <TemplatePreview
          showPreview={showPreview}
          onOpenChange={setShowPreview}
          template={previewTemplate}
        />
      </div>
    </AppLayout>
  )
}

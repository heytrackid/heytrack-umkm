// WhatsApp Templates Layout - Main Page
// Main layout component for WhatsApp template management

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
import { uiLogger } from '@/lib/client-logger'

import { type WhatsAppTemplate } from './types'
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
    const [generatingDefaults, setGeneratingDefaults] = useState(false)

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
            } else {
                toast({
                    title: 'Error',
                    description: 'Gagal memuat template',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            uiLogger.error('Error fetching WhatsApp templates', error)
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat memuat template',
                variant: 'destructive',
            })
        } finally {
            void setLoading(false)
        }
    }

    const handleEdit = (template: WhatsAppTemplate) => {
        void setEditingTemplate(template)
        void setShowDialog(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) {
            return
        }

        try {
            const response = await fetch(`/api/whatsapp-templates/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                toast({
                    title: 'Berhasil',
                    description: 'Template berhasil dihapus',
                })
                await fetchTemplates()
            } else {
                toast({
                    title: 'Error',
                    description: 'Gagal menghapus template',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            uiLogger.error('Error deleting WhatsApp template', error, { templateId: id })
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat menghapus template',
                variant: 'destructive',
            })
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
                toast({
                    title: 'Berhasil',
                    description: template.is_default ? 'Template bukan lagi default' : 'Template diset sebagai default',
                })
                await fetchTemplates()
            } else {
                toast({
                    title: 'Error',
                    description: 'Gagal mengupdate template',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            uiLogger.error('Error updating WhatsApp template', error, { template })
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat mengupdate template',
                variant: 'destructive',
            })
        }
    }

    const handlePreview = (template: WhatsAppTemplate) => {
        void setPreviewTemplate(template)
        void setShowPreview(true)
    }

    const handleDuplicate = (template: WhatsAppTemplate) => {
        void setEditingTemplate({
            ...template,
            id: '', // Clear ID for new template
            name: `${template.name} (Copy)`,
            is_default: false
        } as WhatsAppTemplate)
        void setShowDialog(true)
    }

    const handleSuccess = async () => {
        toast({
            title: 'Berhasil',
            description: editingTemplate?.id ? 'Template berhasil diupdate' : 'Template berhasil dibuat',
        })
        await fetchTemplates()
        void setEditingTemplate(null)
    }

    const handleGenerateDefaults = async () => {
        try {
            void setGeneratingDefaults(true)
            const response = await fetch('/api/whatsapp-templates/generate-defaults', {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: '🎉 Template Siap Digunakan!',
                    description: `${data.templates?.length || 8} template WhatsApp sudah dibuat dan siap kamu edit!`,
                })
                await fetchTemplates()
            } else {
                const error = await response.json()
                toast({
                    title: 'Gagal membuat template',
                    description: error.message || 'Terjadi kesalahan',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            uiLogger.error('Error generating default templates', error)
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat membuat template default',
                variant: 'destructive',
            })
        } finally {
            void setGeneratingDefaults(false)
        }
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
                                    <PrefetchLink href="/orders">Pesanan</PrefetchLink>
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
                                <PrefetchLink href="/orders">Pesanan</PrefetchLink>
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
                        <p className="text-muted-foreground mt-1">
                            Kelola template pesan WhatsApp untuk komunikasi dengan pelanggan
                        </p>
                    </div>
                    <Button onClick={() => {
                        setEditingTemplate(null)
                        setShowDialog(true)
                    }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Template
                    </Button>
                </div>

                {/* Info Card - Show only if no templates */}
                {templates.length === 0 && !loading && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-green-900 text-lg mb-2">
                                    🎉 Mulai dengan Template Siap Pakai!
                                </h3>
                                <p className="text-green-800 mb-4">
                                    Kami sudah siapkan 8 template WhatsApp yang friendly dan profesional untuk kamu.
                                    Tinggal klik tombol di bawah, edit sesuai kebutuhan, dan langsung bisa dipakai!
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        onClick={handleGenerateDefaults}
                                        disabled={generatingDefaults}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {generatingDefaults ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Membuat Template...
                                            </>
                                        ) : (
                                            <>
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Buat Template Default
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingTemplate(null)
                                            setShowDialog(true)
                                        }}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Atau Buat dari Nol
                                    </Button>
                                </div>
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <p className="text-sm font-semibold text-green-900 mb-2">Template yang akan dibuat:</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                                        <div>✅ Konfirmasi Pesanan</div>
                                        <div>✅ Pesanan Siap</div>
                                        <div>✅ Reminder Pembayaran</div>
                                        <div>✅ Terima Kasih</div>
                                        <div>✅ Tanya Custom Order</div>
                                        <div>✅ Update Pengiriman</div>
                                        <div>✅ Pengumuman Promo</div>
                                        <div>✅ Pesanan Dibatalkan</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Card - Show if has templates */}
                {templates.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 Cara Menggunakan Template</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Buat template dengan variabel dinamis seperti <code className="bg-blue-100 px-1 rounded">{'{customer_name}'}</code></li>
                            <li>• Variabel akan otomatis diganti dengan data pesanan saat mengirim pesan</li>
                            <li>• Set template sebagai default untuk digunakan secara otomatis</li>
                            <li>• Gunakan preview untuk melihat hasil akhir dengan data contoh</li>
                        </ul>
                    </div>
                )}

                {/* Templates Table */}
                <TemplatesTable
                    templates={templates}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleDefault={handleToggleDefault}
                    onPreview={handlePreview}
                    onDuplicate={handleDuplicate}
                />

                {/* Template Form Dialog */}
                <TemplateForm
                    showDialog={showDialog}
                    onOpenChange={setShowDialog}
                    editingTemplate={editingTemplate}
                    onSuccess={handleSuccess}
                />

                {/* Template Preview Dialog */}
                <TemplatePreview
                    showPreview={showPreview}
                    onOpenChange={setShowPreview}
                    template={previewTemplate}
                />
            </div>
        </AppLayout>
    )
}

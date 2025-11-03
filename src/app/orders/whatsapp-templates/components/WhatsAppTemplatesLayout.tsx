'use client'

import { useState, useEffect, useCallback } from 'react'
import PrefetchLink from '@/components/ui/prefetch-link'
import AppLayout from '@/components/layout/app-layout'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { MessageCircle, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { uiLogger } from '@/lib/client-logger'
import { type WhatsAppTemplate } from './types'
import TemplatesTable from './TemplatesTable'
import TemplateForm from './TemplateForm'
import TemplatePreview from './TemplatePreview'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'


const WhatsAppTemplatesPage = () => {
    const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
    const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [generatingDefaults, setGeneratingDefaults] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<WhatsAppTemplate | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

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

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/whatsapp-templates')
            if (response.ok) {
                const data: WhatsAppTemplate[] = await response.json()
                setTemplates(data)
            } else {
                toast({
                    title: 'Error',
                    description: 'Gagal memuat template',
                    variant: 'destructive',
                })
            }
        } catch (error: unknown) {
            uiLogger.error({ error: String(error) }, 'Error fetching WhatsApp templates')
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat memuat template',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        void fetchTemplates()
    }, [fetchTemplates])

    const handleEdit = (template: WhatsAppTemplate) => {
        setEditingTemplate(template)
        setShowDialog(true)
    }

    const handleDeleteRequest = (template: WhatsAppTemplate) => {
        setTemplateToDelete(template)
        setIsConfirmOpen(true)
    }

    const handleDelete = useCallback(async () => {
        if (!templateToDelete) {
            return
        }

        try {
            const response = await fetch(`/api/whatsapp-templates/${templateToDelete.id}`, {
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
        } catch (error: unknown) {
            uiLogger.error({ error: String(error), template: templateToDelete }, 'Error deleting WhatsApp template')
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat menghapus template',
                variant: 'destructive',
            })
        } finally {
            setTemplateToDelete(null)
            setIsConfirmOpen(false)
        }
    }, [fetchTemplates, templateToDelete, toast])

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
        } catch (error: unknown) {
            uiLogger.error({ error: String(error), template }, 'Error updating WhatsApp template')
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat mengupdate template',
                variant: 'destructive',
            })
        }
    }

    const handlePreview = (template: WhatsAppTemplate) => {
        setPreviewTemplate(template)
        setShowPreview(true)
    }

    const handleDuplicate = (template: WhatsAppTemplate) => {
        setEditingTemplate({
            ...template,
            id: '', // Clear ID for new template
            name: `${template.name} (Copy)`,
            is_default: false
        } as WhatsAppTemplate)
        setShowDialog(true)
    }

    const handleSuccess = async () => {
        toast({
            title: 'Berhasil',
            description: editingTemplate?.id ? 'Template berhasil diupdate' : 'Template berhasil dibuat',
        })
        await fetchTemplates()
        setEditingTemplate(null)
    }

    const handleGenerateDefaults = async () => {
        try {
            setGeneratingDefaults(true)
            const response = await fetch('/api/whatsapp-templates/generate-defaults', {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                toast({
                    title: '🎉 Template Siap Digunakan!',
                    description: `${data.templates?.length ?? 8} template WhatsApp sudah dibuat dan siap kamu edit!`,
                })
                await fetchTemplates()
            } else {
                const errorBody: { message?: string } = await response.json()
                toast({
                    title: 'Gagal membuat template',
                    description: errorBody.message ?? 'Terjadi kesalahan',
                    variant: 'destructive',
                })
            }
        } catch (error: unknown) {
            uiLogger.error({ error: String(error) }, 'Error generating default templates')
            toast({
                title: 'Error',
                description: 'Terjadi kesalahan saat membuat template default',
                variant: 'destructive',
            })
        } finally {
            setGeneratingDefaults(false)
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
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-gray-600" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg mb-2">
                                    🎉 Mulai dengan Template Siap Pakai!
                                </h3>
                                <p className="text-gray-800 mb-4">
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
                                <div className="mt-4 pt-4 border-t border-gray-300">
                                    <p className="text-sm font-semibold text-gray-900 mb-2">Template yang akan dibuat:</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
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
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">💡 Cara Menggunakan Template</h3>
                        <ul className="text-sm text-gray-800 space-y-1">
                            <li>• Buat template dengan variabel dinamis seperti <code className="bg-gray-100 px-1 rounded">{'{customer_name}'}</code></li>
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
                    onDelete={handleDeleteRequest}
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

                <ConfirmDialog
                    open={isConfirmOpen}
                    onOpenChange={(open) => {
                        setIsConfirmOpen(open)
                        if (!open) {
                            setTemplateToDelete(null)
                        }
                    }}
                    title="Hapus template WhatsApp?"
                    description={`Template "${templateToDelete?.name ?? 'ini'}" akan dihapus secara permanen.`}
                    confirmText="Hapus"
                    cancelText="Batal"
                    variant="destructive"
                    onConfirm={handleDelete}
                />
            </div>
        </AppLayout>
    )
}

export default WhatsAppTemplatesPage

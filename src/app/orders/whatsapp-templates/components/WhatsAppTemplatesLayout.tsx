'use client'

import { MessageCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense, lazy } from 'react'

import { type WhatsAppTemplate } from '@/app/orders/whatsapp-templates/components/types'
import { AppLayout } from '@/components/layout/app-layout'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { useAuth } from '@/hooks/index'
import { useToast } from '@/hooks/use-toast'
import { uiLogger } from '@/lib/client-logger'

// Lazy load heavy components
const TemplatesTable = lazy(() => import('./TemplatesTable').then(module => ({ default: module.TemplatesTable })))
const TemplateForm = lazy(() => import('./TemplateForm').then(module => ({ default: module.TemplateForm })))
const TemplatePreview = lazy(() => import('./TemplatePreview').then(module => ({ default: module.TemplatePreview })))


const WhatsAppTemplatesLayout = () => {
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
            router.push('/auth/login')
        }
    }, [isAuthLoading, isAuthenticated, router, toast])

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/whatsapp-templates', {
                credentials: 'include', // Include cookies for authentication
            })
            if (response.ok) {
                const _data = await response.json() as WhatsAppTemplate[]
                setTemplates(_data)
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

    const handleEdit = useCallback((template: WhatsAppTemplate) => {
        setEditingTemplate(template)
        setShowDialog(true)
    }, [])

    const handleDeleteRequest = useCallback((template: WhatsAppTemplate) => {
        setTemplateToDelete(template)
        setIsConfirmOpen(true)
    }, [])

    const handleDelete = useCallback(async () => {
        if (!templateToDelete) {
            return
        }

        try {
            const response = await fetch(`/api/whatsapp-templates/${templateToDelete['id']}`, {
                method: 'DELETE',
                credentials: 'include', // Include cookies for authentication
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

    const handleToggleDefault = useCallback(async (template: WhatsAppTemplate) => {
        try {
            const response = await fetch(`/api/whatsapp-templates/${template['id']}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...template,
                    is_default: !template.is_default
                }),
                credentials: 'include', // Include cookies for authentication
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
    }, [fetchTemplates, toast])

    const handlePreview = useCallback((template: WhatsAppTemplate) => {
        setPreviewTemplate(template)
        setShowPreview(true)
    }, [])

    const handleDuplicate = useCallback((template: WhatsAppTemplate) => {
        setEditingTemplate({
            ...template,
            id: '', // Clear ID for new template
            name: `${template.name} (Copy)`,
            is_default: false
        } as WhatsAppTemplate)
        setShowDialog(true)
    }, [])

    const handleSuccess = useCallback(async () => {
        toast({
            title: 'Berhasil',
            description: editingTemplate?.id ? 'Template berhasil diupdate' : 'Template berhasil dibuat',
        })
        await fetchTemplates()
        setEditingTemplate(null)
    }, [fetchTemplates, toast, editingTemplate])

    const handleGenerateDefaults = useCallback(async () => {
        try {
            setGeneratingDefaults(true)
            const response = await fetch('/api/whatsapp-templates/generate-defaults', {
                method: 'POST',
                credentials: 'include', // Include cookies for authentication
            })

            if (response.ok) {
                const _data = await response.json() as { templates?: unknown[] }
                toast({
                    title: '🎉 Template Siap Digunakan!',
                    description: `${_data.templates?.length ?? 8} template WhatsApp sudah dibuat dan siap kamu edit!`,
                })
                await fetchTemplates()
            } else {
                const errorBody = await response.json() as { message?: string }
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
    }, [fetchTemplates, toast])

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
                    <div className="h-96 bg-muted rounded animate-pulse" />
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
                     <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-border/20 rounded-xl p-6 ">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <MessageCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-foreground text-lg mb-2">
                                    🎉 Mulai dengan Template Siap Pakai!
                                </h3>
                                <p className="text-muted-foreground mb-4">
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
                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2" />
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
                                 <div className="mt-4 pt-4 border-t border-border/20">
                                    <p className="text-sm font-semibold text-foreground mb-2">Template yang akan dibuat:</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                     <div className="bg-muted border border-border/20 rounded-lg p-4">
                        <h3 className="font-semibold text-foreground mb-2">💡 Cara Menggunakan Template</h3>
                        <ul className="text-sm text-foreground space-y-1">
                            <li>• Buat template dengan variabel dinamis seperti <code className="bg-muted px-1 rounded">{'{customer_name}'}</code></li>
                            <li>• Variabel akan otomatis diganti dengan data pesanan saat mengirim pesan</li>
                            <li>• Set template sebagai default untuk digunakan secara otomatis</li>
                            <li>• Gunakan preview untuk melihat hasil akhir dengan data contoh</li>
                        </ul>
                    </div>
                )}

                {/* Templates Table */}
                <Suspense fallback={<div className="h-96 bg-muted rounded animate-pulse" />}>
                    <TemplatesTable
                        templates={templates}
                        isLoading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDeleteRequest}
                        onToggleDefault={handleToggleDefault}
                        onPreview={handlePreview}
                        onDuplicate={handleDuplicate}
                    />
                </Suspense>

                {/* Template Form Dialog */}
                <Suspense fallback={<div />}>
                    <TemplateForm
                        showDialog={showDialog}
                        onOpenChange={setShowDialog}
                        editingTemplate={editingTemplate}
                        onSuccess={handleSuccess}
                    />
                </Suspense>

                {/* Template Preview Dialog */}
                <Suspense fallback={<div />}>
                    <TemplatePreview
                        showPreview={showPreview}
                        onOpenChange={setShowPreview}
                        template={previewTemplate}
                    />
                </Suspense>

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

export { WhatsAppTemplatesLayout }
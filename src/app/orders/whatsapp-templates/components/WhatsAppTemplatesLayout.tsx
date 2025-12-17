'use client'

import { Loader2, MessageCircle, Plus } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { type WhatsAppTemplate } from '@/app/orders/whatsapp-templates/components/types'
import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/index'
import { successToast, } from '@/hooks/use-toast'
import { useDeleteWhatsAppTemplate, useGenerateDefaultTemplates, useUpdateWhatsAppTemplate, useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates'
import { handleError } from '@/lib/error-handling'

import TemplateForm from './TemplateForm'
import TemplatePreview from './TemplatePreview'
import TemplatesTable from './TemplatesTable'


const WhatsAppTemplatesLayout = () => {
    const { data: templates = [], isLoading: loading } = useWhatsAppTemplates()
  
    const updateMutation = useUpdateWhatsAppTemplate()
    const deleteMutation = useDeleteWhatsAppTemplate()
    const generateDefaultsMutation = useGenerateDefaultTemplates()

    const [showDialog, setShowDialog] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
    const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [templateToDelete, setTemplateToDelete] = useState<WhatsAppTemplate | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
    const router = useRouter()

    // Handle auth errors
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            handleError(new Error('Authentication required'), 'Auth check', false)
            router.push('/auth/login')
        }
    }, [isAuthLoading, isAuthenticated, router])



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
            await deleteMutation.mutateAsync(templateToDelete.id)
            setTemplateToDelete(null)
            setIsConfirmOpen(false)
        } catch (error) {
            // Error handling is done in the mutation
        }
    }, [deleteMutation, templateToDelete])

    const handleBulkDelete = useCallback(async (templatesToDelete: WhatsAppTemplate[]) => {
        try {
            for (const template of templatesToDelete) {
                await deleteMutation.mutateAsync(template.id)
            }
            successToast("Berhasil", `${templatesToDelete.length} template berhasil dihapus`)
        } catch (error) {
            // Error handling is done in the mutation
        }
    }, [deleteMutation])

    const handleToggleDefault = useCallback(async (template: WhatsAppTemplate) => {
        await updateMutation.mutateAsync({
            id: template.id,
            data: {
                is_default: !template.is_default
            }
        })
    }, [updateMutation])

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
        successToast('Berhasil', editingTemplate?.id ? 'Template berhasil diupdate' : 'Template berhasil dibuat')
        setEditingTemplate(null)
    }, [editingTemplate])

    const handleGenerateDefaults = useCallback(async () => {
        await generateDefaultsMutation.mutateAsync()
    }, [generateDefaultsMutation])

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
                    <Skeleton className="h-96 w-full" />
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

                <PageHeader
                    title="WhatsApp Templates"
                    description="Kelola template pesan WhatsApp untuk komunikasi dengan pelanggan"
                    action={
                        <Button onClick={() => {
                            setEditingTemplate(null)
                            setShowDialog(true)
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Template
                        </Button>
                    }
                />

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
                                        disabled={generateDefaultsMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {generateDefaultsMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                <TemplatesTable
                    templates={templates as unknown as WhatsAppTemplate[]}
                    isLoading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    onBulkDelete={handleBulkDelete}
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

export { WhatsAppTemplatesLayout }

'use client'

import { Info, Copy, Check } from '@/components/icons'
import { useState, useLayoutEffect, useRef, type FormEvent } from 'react'

import { TEMPLATE_CATEGORIES, AVAILABLE_VARIABLES, DEFAULT_TEMPLATES, type WhatsAppTemplate, type TemplateFormData, type TemplateVariable } from '@/app/orders/whatsapp-templates/components/types'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { uiLogger } from '@/lib/client-logger'
import { useCreateWhatsAppTemplate, useUpdateWhatsAppTemplate } from '@/hooks/api/useWhatsAppTemplates'

interface TemplateFormProps {
  showDialog: boolean
  editingTemplate?: WhatsAppTemplate | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface VariableGroupProps {
  title: string
  icon: string
  variables: TemplateVariable[]
  copiedVariable: string | null
  onCopy: (name: string) => void
}

const VariableGroup = ({ title, icon, variables, copiedVariable, onCopy }: VariableGroupProps) => (
  <AccordionItem value={title.toLowerCase().replace(' ', '')}>
    <AccordionTrigger className="text-sm font-medium">
      {icon} {title}
    </AccordionTrigger>
    <AccordionContent>
      <div className="space-y-2">
        {variables.map((variable) => (
          <div key={variable.name} className="text-xs space-y-1 pb-2 border-b last:border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <code className="bg-white px-2 py-1 rounded border font-mono">
                {`{${variable.name}}`}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onCopy(variable.name)}
              >
                {copiedVariable === variable.name ? (
                  <Check className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <p className="text-muted-foreground">{variable.description}</p>
            <p className="text-muted-foreground">Contoh: {variable.example}</p>
          </div>
        ))}
      </div>
    </AccordionContent>
  </AccordionItem>
)

const TemplateForm = ({
    showDialog,
    onOpenChange,
    editingTemplate,
    onSuccess
}: TemplateFormProps) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [formData, setFormData] = useState<TemplateFormData>(() => {
        if (editingTemplate) {
            const vars = Array.isArray(editingTemplate.variables)
                ? editingTemplate.variables
                : Object.keys(editingTemplate.variables ?? {})
            return {
                name: editingTemplate.name,
                description: editingTemplate.description ?? '',
                category: editingTemplate.category,
                template_content: editingTemplate.template_content,
                variables: vars,
                is_active: editingTemplate.is_active ?? true,
                is_default: editingTemplate.is_default ?? false
            }
        }
        return {
            name: '',
            description: '',
            category: 'order_confirmation',
            template_content: '',
            variables: [],
            is_active: true,
            is_default: false
        }
    })
    const [copiedVariable, setCopiedVariable] = useState<string | null>(null)

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: 'order_confirmation',
            template_content: '',
            variables: [],
            is_active: true,
            is_default: false
        })
    }

    // Update form data when editingTemplate changes
    useLayoutEffect(() => {
        const newFormData = editingTemplate ? {
            name: editingTemplate.name,
            description: editingTemplate.description ?? '',
            category: editingTemplate.category,
            template_content: editingTemplate.template_content,
            variables: Array.isArray(editingTemplate.variables)
                ? editingTemplate.variables
                : Object.keys(editingTemplate.variables ?? {}),
            is_active: editingTemplate.is_active ?? true,
            is_default: editingTemplate.is_default ?? false
        } : {
            name: '',
            description: '',
            category: 'order_confirmation',
            template_content: '',
            variables: [],
            is_active: true,
            is_default: false
        }

        timeoutRef.current = setTimeout(() => setFormData(newFormData), 0)
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [editingTemplate])

    // Form data is initialized in useState above

    const handleInputChange = <K extends keyof TemplateFormData>(field: K, value: TemplateFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const extractVariables = (content: string): string[] => {
        const variableRegex = /\{([^}]+)\}/g
        const variables = new Set<string>()
        let match

        while ((match = variableRegex.exec(content)) !== null) {
            const variable = match[1]?.trim()
            if (variable) {variables.add(variable)}
        }

        return Array.from(variables)
    }

    const copyVariable = (variableName: string) => {
        void navigator.clipboard.writeText(`{${variableName}}`)
        setCopiedVariable(variableName)
        timeoutRef.current = setTimeout(() => setCopiedVariable(null), 2000)
    }

    const loadDefaultTemplate = (template: (typeof DEFAULT_TEMPLATES)[number]) => {
        if (!template) {
            return
        }

        setFormData({
            name: template.name,
            description: template.description || '',
            category: template.category,
            template_content: template.template_content,
            variables: template.variables || [],
            is_active: true,
            is_default: false
        })
    }

    const createTemplateMutation = useCreateWhatsAppTemplate()
    const updateTemplateMutation = useUpdateWhatsAppTemplate()

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        try {
            const variables = extractVariables(formData.template_content)
            const templateData = {
                ...formData,
                variables
            }

            if (editingTemplate) {
                await updateTemplateMutation.mutateAsync({
                    id: editingTemplate.id,
                    template: templateData
                })
            } else {
                await createTemplateMutation.mutateAsync(templateData)
            }

            onSuccess()
            onOpenChange(false)
            if (!editingTemplate) {
                resetForm()
            }
        } catch (error: unknown) {
            uiLogger.error({ error: String(error) }, 'Error saving template')
        }
    }

    return (
        <Dialog open={showDialog} onOpenChange={(open) => {
            onOpenChange(open)
            if (!open) { resetForm() }
        }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
                    </DialogTitle>
                    <DialogDescription>
                        Buat atau edit template pesan WhatsApp untuk komunikasi dengan pelanggan
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Template Defaults */}
                    {!editingTemplate && (
                        <div className="bg-muted border border-border/20 rounded-lg p-4">
                            <Label className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <Info className="h-4 w-4" />
                                Mulai dengan Template Default
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {DEFAULT_TEMPLATES.map((template) => (
                                    <Button
                                        key={template.name}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadDefaultTemplate(template)}
                                        className="justify-start text-left"
                                    >
                                        {template.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Nama Template *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                                placeholder="Contoh: Konfirmasi Pesanan Baru"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="category">Kategori *</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value: string) => handleInputChange('category', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TEMPLATE_CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Deskripsi</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
                            placeholder="Jelaskan kapan template ini digunakan"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Template Content */}
                        <div className="space-y-2">
                            <Label htmlFor="template_content">Isi Template *</Label>
                            <Textarea
                                id="template_content"
                                value={formData.template_content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('template_content', e.target.value)}
                                rows={12}
                                placeholder="Halo {customer_name}!&#10;&#10;Pesanan Anda telah dikonfirmasi:&#10;{order_items}&#10;&#10;Total: {total_amount}"
                                required
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                                Gunakan format <code className="bg-secondary px-1 rounded">{'{variable_name}'}</code> untuk data dinamis
                            </p>

                            {formData.template_content && (
                                <div>
                                    <Label className="text-xs">Variables Terdeteksi:</Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {extractVariables(formData.template_content).map((variable) => (
                                            <Badge key={variable} variant="secondary" className="text-xs">
                                                {variable}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Available Variables */}
                        <div className="space-y-2">
                            <Label>Variabel yang Tersedia</Label>
                             <div className="border rounded-lg p-3 max-h-[400px] overflow-y-auto bg-muted">
                                 <Accordion type="single" collapsible className="w-full">
                                     <VariableGroup
                                       title="Data Pesanan"
                                       icon="📦"
                                       variables={AVAILABLE_VARIABLES.filter(v =>
                                         ['order_no', 'order_date', 'order_items', 'total_amount', 'notes'].includes(v.name)
                                       )}
                                       copiedVariable={copiedVariable}
                                       onCopy={copyVariable}
                                     />
                                     <VariableGroup
                                       title="Data Pelanggan"
                                       icon="👤"
                                       variables={AVAILABLE_VARIABLES.filter(v =>
                                         ['customer_name', 'customer_phone'].includes(v.name)
                                       )}
                                       copiedVariable={copiedVariable}
                                       onCopy={copyVariable}
                                     />
                                     <VariableGroup
                                       title="Data Pengiriman"
                                       icon="🚚"
                                       variables={AVAILABLE_VARIABLES.filter(v =>
                                         ['delivery_date', 'delivery_address', 'delivery_status', 'estimated_time', 'driver_name', 'driver_phone'].includes(v.name)
                                       )}
                                       copiedVariable={copiedVariable}
                                       onCopy={copyVariable}
                                     />
                                     <VariableGroup
                                       title="Data Pembayaran"
                                       icon="💳"
                                       variables={AVAILABLE_VARIABLES.filter(v =>
                                         ['payment_method', 'payment_deadline', 'payment_account'].includes(v.name)
                                       )}
                                       copiedVariable={copiedVariable}
                                       onCopy={copyVariable}
                                     />
                                     <VariableGroup
                                       title="Data Bisnis"
                                       icon="🏪"
                                       variables={AVAILABLE_VARIABLES.filter(v =>
                                         ['business_name', 'business_phone'].includes(v.name)
                                       )}
                                       copiedVariable={copiedVariable}
                                       onCopy={copyVariable}
                                     />
                                </Accordion>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <label className="flex flex-col sm:flex-row sm:items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('is_active', e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Template Aktif</span>
                        </label>

                        <label className="flex flex-col sm:flex-row sm:items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_default}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('is_default', e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Set sebagai Default</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingTemplate ? 'Update' : 'Simpan'} Template
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default TemplateForm
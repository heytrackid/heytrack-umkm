'use client'

import { MessageCircle, RefreshCw } from '@/components/icons'
import { useState } from 'react'

import { TEMPLATE_CATEGORIES, AVAILABLE_VARIABLES, type WhatsAppTemplate } from '@/app/orders/whatsapp-templates/components/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface TemplatePreviewProps {
    showPreview: boolean
    onOpenChange: (open: boolean) => void
    template: WhatsAppTemplate | null
}

const TemplatePreview = ({
    showPreview,
    onOpenChange,
    template
}: TemplatePreviewProps) => {
    const [showExampleData, setShowExampleData] = useState(true)

    const getCategoryLabel = (category: string) => TEMPLATE_CATEGORIES.find((cat) => cat.value === category)?.label ?? category

    const getExampleValue = (variableName: string): string => {
        const variable = AVAILABLE_VARIABLES.find((v) => v.name === variableName)
        return variable?.example ?? `{${variableName}}`
    }

    const renderPreview = (content: string): string => {
        if (!showExampleData) { return content }

        let preview = content
        const variableRegex = /\{([^}]+)\}/g
        let match

        while ((match = variableRegex.exec(content)) !== null) {
            const variableName = match[1]?.trim()
            if (variableName) {
              const exampleValue = getExampleValue(variableName)
              preview = preview.replace(`{${variableName}}`, exampleValue)
            }
        }

        return preview
    }

    return (
        <Dialog open={showPreview} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Preview Template
                    </DialogTitle>
                    <DialogDescription>
                        {template?.name} - {getCategoryLabel(template?.category ?? '')}
                    </DialogDescription>
                </DialogHeader>

                {template && (
                    <div className="space-y-4 overflow-y-auto pr-2 -mr-2">
                        {/* Toggle Example Data */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm">Mode Preview:</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowExampleData((prev) => !prev)}
                                className="gap-2"
                            >
                                <RefreshCw className="h-3 w-3" />
                                {showExampleData ? 'Tampilkan Variabel' : 'Tampilkan Contoh Data'}
                            </Button>
                        </div>

                        {/* WhatsApp Preview */}
                        <div className="bg-gradient-to-b from-gray-50 to-green-100 border-2 border-border/20 rounded-xl p-3 ">
                            <div className="bg-white rounded-lg ">
                                {/* WhatsApp Header */}
                                <div className="flex items-center gap-2 p-2 border-b bg-green-600 text-white rounded-t-lg">
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-xs truncate">
                                            {showExampleData ? 'Warung Makan Sederhana' : '{business_name}'}
                                        </p>
                                        <p className="text-xs opacity-90">Online</p>
                                    </div>
                                </div>

                                {/* Message Bubble */}
                                <div className="p-3">
                                    <div className="bg-white border border-border/20 rounded-lg rounded-tl-none p-2.5  max-h-64 overflow-y-auto">
                                        <pre className="whitespace-pre-wrap text-xs text-foreground font-sans leading-relaxed">
                                            {renderPreview(template.template_content)}
                                        </pre>
                                        <div className="flex items-center justify-end gap-1 mt-1.5 text-xs text-muted-foreground">
                                            <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <svg className="h-3 w-3 text-muted-foreground" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                                <path d="M10.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Template Info - Compact */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                            <div>
                                <Label className="text-xs text-muted-foreground">Kategori</Label>
                                <Badge variant="outline" className="mt-1 text-xs">
                                    {getCategoryLabel(template.category)}
                                </Badge>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Status</Label>
                                <div className="mt-1 flex gap-1">
                                    <Badge className={`text-xs ${template.is_active ? 'bg-secondary text-secondary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                        {template.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                    {template.is_default && (
                                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                            Default
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Variables Used - Compact */}
                        <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">Variabel yang Digunakan:</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                    // Handle both array and object formats
                                    const vars = Array.isArray(template.variables)
                                        ? template.variables
                                        : Object.keys(template.variables ?? {})

                                    return vars.map((variable) => {
                                        const varInfo = AVAILABLE_VARIABLES.find(v => v.name === variable)
                                        return (
                                            <div key={variable} className="group relative">
                                                <Badge variant="secondary" className="cursor-help text-xs py-0.5 px-2">
                                                    {variable}
                                                </Badge>
                                                {varInfo && (
                                                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-56">
                                                        <div className="bg-gray-900 text-white text-xs rounded-lg p-2 ">
                                                            <p className="font-semibold">{varInfo.label}</p>
                                                            <p className="text-gray-300 mt-0.5 text-xs">{varInfo.description}</p>
                                                            <p className="text-muted-foreground mt-0.5 text-xs">Contoh: {varInfo.example}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                })()}
                            </div>
                        </div>

                        {showExampleData && (
                            <div className="bg-muted border border-border/20 rounded-lg p-2.5">
                                <p className="text-xs text-foreground">
                                    💡 <strong>Tips:</strong> Preview ini menggunakan data contoh. Saat digunakan, variabel akan diganti dengan data pesanan yang sebenarnya.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default TemplatePreview
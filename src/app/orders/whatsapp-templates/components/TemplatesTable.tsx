'use client'

import { Star } from '@/components/icons'

import { TEMPLATE_CATEGORIES, type WhatsAppTemplate } from '@/app/orders/whatsapp-templates/components/types'
import { SharedDataTable } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'


interface TemplatesTableProps {
    templates: WhatsAppTemplate[]
    isLoading?: boolean
    onEdit: (template: WhatsAppTemplate) => void
    onDelete: (template: WhatsAppTemplate) => void
    onBulkDelete?: (templates: WhatsAppTemplate[]) => void
    onToggleDefault: (template: WhatsAppTemplate) => void
    onPreview: (template: WhatsAppTemplate) => void
    onDuplicate: (template: WhatsAppTemplate) => void
    onRefresh?: () => void
}

const TemplatesTable = ({
    templates,
    isLoading = false,
    onEdit,
    onDelete,
    onBulkDelete,
    onToggleDefault: _onToggleDefault,
    onPreview,
    onDuplicate: _onDuplicate,
    onRefresh
}: TemplatesTableProps) => {
    const getCategoryLabel = (category: string) =>
        TEMPLATE_CATEGORIES.find((cat) => cat.value === category)?.label ?? category

    return (
        <SharedDataTable<WhatsAppTemplate>
            data={templates}
            columns={[
                {
                    key: 'name',
                    header: 'Nama Template',
                    render: (_, item) => (
                        <div className="space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                {item.is_default && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                )}
                            </div>
                            {item.description && (
                                <p className="text-sm text-muted-foreground">
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ),
                    sortable: true,
                },
                {
                    key: 'category',
                    header: 'Kategori',
                    render: (value) => (
                        <Badge variant="outline">
                            {getCategoryLabel(value as string)}
                        </Badge>
                    ),
                    filterable: true,
                    filterType: 'select',
                    filterOptions: TEMPLATE_CATEGORIES.map(cat => ({
                        label: cat.label,
                        value: cat.value
                    })),
                },
                {
                    key: 'variables',
                    header: 'Variables',
                    render: (value) => {
                        const vars = Array.isArray(value)
                            ? value
                            : Object.keys((value as Record<string, unknown>) ?? {})

                        if (vars.length === 0) {
                            return (
                                <Badge variant="secondary" className="text-xs">
                                    Tidak ada variabel
                                </Badge>
                            )
                        }

                        return (
                            <div className="flex flex-wrap gap-1">
                                {vars.slice(0, 3).map((variable) => (
                                    <Badge key={variable} variant="secondary" className="text-xs">
                                        {variable}
                                    </Badge>
                                ))}
                                {vars.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{vars.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )
                    },
                },
                {
                    key: 'is_active',
                    header: 'Status',
                    render: (value) => (
                        <Badge
                            variant={value ? 'default' : 'secondary'}
                        >
                            {value ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                    ),
                    filterable: true,
                    filterType: 'select',
                    filterOptions: [
                        { label: 'Aktif', value: 'true' },
                        { label: 'Nonaktif', value: 'false' },
                    ],
                },
            ]}
            loading={isLoading}
            onView={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
            searchPlaceholder="Cari template..."
            emptyMessage="Belum ada template WhatsApp"
            emptyDescription="Klik 'Tambah Template' untuk membuat yang pertama"
            exportable={true}
            refreshable={true}
            {...(onRefresh && { onRefresh })}
            {...(onBulkDelete && { onBulkDelete })}
            enableBulkActions={!!onBulkDelete}
            enablePagination={true}
            pageSizeOptions={[10, 25, 50]}
            initialPageSize={10}
        />
    )
}

export default TemplatesTable
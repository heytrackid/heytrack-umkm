'use client'

import { MoreHorizontal, Eye, Edit, Trash2, Star, StarOff, Copy, MessageCircle } from 'lucide-react'

import { TEMPLATE_CATEGORIES, type WhatsAppTemplate } from '@/app/orders/whatsapp-templates/components/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'


interface TemplatesTableProps {
    templates: WhatsAppTemplate[]
    loading: boolean
    onEdit: (template: WhatsAppTemplate) => void
    onDelete: (template: WhatsAppTemplate) => void
    onToggleDefault: (template: WhatsAppTemplate) => void
    onPreview: (template: WhatsAppTemplate) => void
    onDuplicate: (template: WhatsAppTemplate) => void
}

const TemplatesTable = ({
    templates,
    loading,
    onEdit,
    onDelete,
    onToggleDefault,
    onPreview,
    onDuplicate
}: TemplatesTableProps) => {
    const getCategoryLabel = (category: string) => TEMPLATE_CATEGORIES.find((cat) => cat.value === category)?.label ?? category

    const renderTableRows = () => {
        if (loading) {
            return Array.from({ length: 5 }, (_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                    {Array.from({ length: 5 }, (_, cellIndex) => (
                        <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                    ))}
                </TableRow>
            ))
        }

        if (templates.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada template WhatsApp</p>
                        <p className="text-sm">Klik &quot;Tambah Template&quot; untuk membuat yang pertama</p>
                    </TableCell>
                </TableRow>
            )
        }

        return templates.map((template) => (
            <TableRow key={template['id']}>
                <TableCell>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-wrap-mobile">{template.name}</span>
                            {template.is_default && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                        </div>
                        {template.description && (
                            <p className="text-sm text-muted-foreground text-wrap-mobile">
                                {template.description}
                            </p>
                        )}
                    </div>
                </TableCell>

                <TableCell>
                    <Badge variant="outline">
                        {getCategoryLabel(template.category)}
                    </Badge>
                </TableCell>

                <TableCell>
                    <div className="flex flex-wrap gap-1">
                        {(() => {
                            // Handle both array and object formats
                            const vars = Array.isArray(template.variables)
                                ? template.variables
                                : Object.keys(template.variables ?? {})

                            if (vars.length === 0) {
                                return (
                                    <Badge variant="secondary" className="text-xs">
                                        Tidak ada variabel
                                    </Badge>
                                )
                            }

                            return (
                                <>
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
                                </>
                            )
                        })()}
                    </div>
                </TableCell>

                <TableCell>
                    <Badge
                        className={template.is_active
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                    >
                        {template.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </TableCell>

                <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="More options">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onPreview(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onEdit(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onDuplicate(template)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplikat
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => onToggleDefault(template)}>
                                {template.is_default ? (
                                    <>
                                        <StarOff className="h-4 w-4 mr-2" />
                                        Hapus Default
                                    </>
                                ) : (
                                    <>
                                        <Star className="h-4 w-4 mr-2" />
                                        Set Default
                                    </>
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onDelete(template)}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
            </TableRow>
        ))
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Template</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Variables</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-12">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderTableRows()}</TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export { TemplatesTable }
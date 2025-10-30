// Templates Table Component
// Displays WhatsApp templates in a table format

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Star,
    StarOff,
    Copy,
    MessageCircle
} from 'lucide-react'
import { TEMPLATE_CATEGORIES, type WhatsAppTemplate } from './types'

interface TemplatesTableProps {
    templates: WhatsAppTemplate[]
    loading: boolean
    onEdit: (template: WhatsAppTemplate) => void
    onDelete: (id: string) => void
    onToggleDefault: (template: WhatsAppTemplate) => void
    onPreview: (template: WhatsAppTemplate) => void
    onDuplicate: (template: WhatsAppTemplate) => void
}

export default function TemplatesTable({
    templates,
    loading,
    onEdit,
    onDelete,
    onToggleDefault,
    onPreview,
    onDuplicate
}: TemplatesTableProps) {
    const getCategoryLabel = (category: string) => {
        return TEMPLATE_CATEGORIES.find(cat => cat.value === category)?.label || category
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
                    <TableBody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    {[1, 2, 3, 4, 5].map((j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : templates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada template WhatsApp</p>
                                    <p className="text-sm">Klik "Tambah Template" untuk membuat yang pertama</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            templates.map((template) => (
                                <TableRow key={template.id}>
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
                                                    : Object.keys(template.variables || {})

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
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }
                                        >
                                            {template.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>

                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
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

                                                <DropdownMenuItem
                                                    onClick={() => onToggleDefault(template)}
                                                >
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
                                                    onClick={() => onDelete(template.id)}
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
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

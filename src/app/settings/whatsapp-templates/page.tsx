'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import {
  Plus,
  MessageCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  Star,
  StarOff,
  Copy,
  Settings
} from 'lucide-react'

interface WhatsAppTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  variables: string[]
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'order_management',
    template_content: '',
    variables: [] as string[],
    is_active: true,
    is_default: false
  })

  const categories = [
    { value: 'order_management', label: 'Manajemen Pesanan' },
    { value: 'payment', label: 'Pembayaran' },
    { value: 'delivery', label: 'Pengiriman' },
    { value: 'customer_service', label: 'Layanan Pelanggan' },
    { value: 'promotion', label: 'Promosi' },
    { value: 'general', label: 'Umum' }
  ]

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/whatsapp-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g
    const variables = new Set<string>()
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1].trim()
      if (!variable.startsWith('#') && !variable.startsWith('/')) {
        variables.add(variable)
      }
    }

    return Array.from(variables)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const variables = extractVariables(formData.template_content)
      const templateData = {
        ...formData,
        variables
      }

      const url = editingTemplate 
        ? `/api/whatsapp-templates/${editingTemplate.id}`
        : '/api/whatsapp-templates'
      
      const method = editingTemplate ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })
      
      if (response.ok) {
        await fetchTemplates()
        resetForm()
        setShowDialog(false)
      }
    } catch (err) {
      console.error('Error saving template:', err)
    }
  }

  const handleEdit = (template: WhatsAppTemplate) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      template_content: template.template_content,
      variables: template.variables,
      is_active: template.is_active,
      is_default: template.is_default
    })
    setShowDialog(true)
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
        console.error('Error deleting template:', err)
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
      console.error('Error updating template:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'order_management',
      template_content: '',
      variables: [],
      is_active: true,
      is_default: false
    })
    setEditingTemplate(null)
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category
  }

  const handlePreview = (template: WhatsAppTemplate) => {
    setPreviewTemplate(template)
    setShowPreview(true)
  }

  const copyTemplate = (template: WhatsAppTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category,
      template_content: template.template_content,
      variables: template.variables,
      is_active: true,
      is_default: false
    })
    setEditingTemplate(null)
    setShowDialog(true)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/settings">Settings</Link>
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

        {/* Templates Table */}
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
                            <span className="font-medium">{template.name}</span>
                            {template.is_default && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground">
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
                          {template.variables.slice(0, 3).map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.variables.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          className={template.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {template.is_active ? 'Active' : 'Inactive'}
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
                            <DropdownMenuItem onClick={() => handlePreview(template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => copyTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleToggleDefault(template)}
                            >
                              {template.is_default ? (
                                <>
                                  <StarOff className="h-4 w-4 mr-2" />
                                  Remove Default
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4 mr-2" />
                                  Set as Default
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleDelete(template.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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

        {/* Template Form Dialog */}
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) resetForm()
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
              </DialogTitle>
              <DialogDescription>
                Buat atau edit template pesan WhatsApp untuk komunikasi dengan pelanggan
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nama Template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Contoh: Order Confirmation"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
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
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Deskripsi singkat tentang template ini"
                />
              </div>
              
              <div>
                <Label htmlFor="template_content">Isi Template</Label>
                <Textarea
                  id="template_content"
                  value={formData.template_content}
                  onChange={(e) => handleInputChange('template_content', e.target.value)}
                  placeholder="Tulis template pesan di sini. Gunakan {{variable_name}} untuk placeholder..."
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Gunakan format <code>{'{{variable_name}}'}</code> untuk placeholder yang akan diganti dengan data dinamis
                </p>
              </div>
              
              {formData.template_content && (
                <div>
                  <Label>Variables Detected</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {extractVariables(formData.template_content).map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  <span className="text-sm">Template Aktif</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => handleInputChange('is_default', e.target.checked)}
                  />
                  <span className="text-sm">Set sebagai Default</span>
                </label>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Batal
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Update' : 'Simpan'} Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Template Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Preview Template</DialogTitle>
              <DialogDescription>
                {previewTemplate?.name} - {getCategoryLabel(previewTemplate?.category || '')}
              </DialogDescription>
            </DialogHeader>
            
            {previewTemplate && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-200">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">WhatsApp Preview</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-green-800 font-mono">
                    {previewTemplate.template_content}
                  </pre>
                </div>
                
                <div>
                  <Label>Variables yang digunakan:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {previewTemplate.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
// Template Form Component - Lazy Loaded
// Form dialog for creating and editing WhatsApp templates

import { useState, useEffect, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { apiLogger } from '@/lib/logger'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { WhatsAppTemplate, TemplateFormData, TemplateCategory } from './types'

interface TemplateFormProps {
  showDialog: boolean
  onOpenChange: (open: boolean) => void
  editingTemplate: WhatsAppTemplate | null
  onSuccess: () => void
  categories: TemplateCategory[]
}

export default function TemplateForm({
  showDialog,
  onOpenChange,
  editingTemplate,
  onSuccess,
  categories
}: TemplateFormProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'order_management',
    template_content: '',
    variables: [],
    is_active: true,
    is_default: false
  })

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        description: editingTemplate.description,
        category: editingTemplate.category,
        template_content: editingTemplate.template_content,
        variables: editingTemplate.variables,
        is_active: editingTemplate.is_active,
        is_default: editingTemplate.is_default
      })
    } else {
      resetForm()
    }
  }, [editingTemplate])

  const handleInputChange = <K extends keyof TemplateFormData>(field: K, value: TemplateFormData[K]) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault

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
        onSuccess()
        onOpenChange(false)
        if (!editingTemplate) {
          resetForm()
        }
      }
    } catch (err) {
      apiLogger.error({ error: err }, 'Error saving template:')
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
  }

  return (
    <Dialog open={showDialog} onOpenChange={(open) => {
      onOpenChange(open)
      if (!open) { resetForm() }
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
            />
          </div>

          <div>
            <Label htmlFor="template_content">Isi Template</Label>
            <Textarea
              id="template_content"
              value={formData.template_content}
              onChange={(e) => handleInputChange('template_content', e.target.value)}
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

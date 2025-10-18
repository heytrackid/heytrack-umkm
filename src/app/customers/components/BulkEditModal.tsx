'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { apiCache, CACHE_PATTERNS } from '@/lib/api-cache'
import { Loader2, Edit2 } from 'lucide-react'

interface BulkEditModalProps {
  selectedItems: string[]
  customers: any[]
  onSuccess: () => void
  onClose: () => void
}

export default function BulkEditModal({ selectedItems, customers, onSuccess, onClose }: BulkEditModalProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Fields to edit
  const [editFields, setEditFields] = useState({
    customer_type: false,
    status: false,
    notes: false
  })
  
  // Values to update
  const [updateValues, setUpdateValues] = useState({
    customer_type: '',
    status: '',
    notes: ''
  })

  const handleFieldToggle = (field: string, checked: boolean) => {
    setEditFields(prev => ({ ...prev, [field]: checked }))
  }

  const handleValueChange = (field: string, value: string) => {
    setUpdateValues(prev => ({ ...prev, [field]: value }))
  }

  const handleBulkUpdate = async () => {
    const fieldsToUpdate = Object.entries(editFields)
      .filter(([_, checked]) => checked)
      .map(([field]) => field)
    
    if (fieldsToUpdate.length === 0) {
      toast({
        title: 'Pilih Field',
        description: 'Pilih minimal satu field yang ingin diedit',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    
    try {
      const updatePromises = selectedItems.map(async (customerId) => {
        const updateData: any = {}
        
        if (editFields.customer_type && updateValues.customer_type) {
          updateData.customer_type = updateValues.customer_type
        }
        if (editFields.status && updateValues.status) {
          updateData.status = updateValues.status
        }
        if (editFields.notes && updateValues.notes) {
          updateData.notes = updateValues.notes
        }

        if (Object.keys(updateData).length === 0) {
          throw new Error('No valid fields to update')
        }

        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        if (!response.ok) {
          throw new Error(`Failed to update customer ${customerId}`)
        }
        
        return response.json()
      })

      await Promise.all(updatePromises)
      
      // Invalidate cache
      apiCache.invalidate(CACHE_PATTERNS.CUSTOMERS || 'customers')
      
      toast({
        title: 'Berhasil Diupdate',
        description: `${selectedItems.length} pelanggan berhasil diupdate`
      })
      
      setIsOpen(false)
      onSuccess()
      onClose()
      
    } catch (error: any) {
      console.error('Bulk update error:', error)
      toast({
        title: 'Gagal Update',
        description: 'Terjadi kesalahan saat mengupdate pelanggan',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCount = selectedItems.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Semua ({selectedCount})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Massal Pelanggan</DialogTitle>
          <DialogDescription>
            Update {selectedCount} pelanggan sekaligus. Pilih field yang ingin diubah.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Pilih Field yang Ingin Diedit:</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customer_type"
                  checked={editFields.customer_type}
                  onCheckedChange={(checked) => handleFieldToggle('customer_type', checked as boolean)}
                />
                <Label htmlFor="customer_type" className="text-sm">Tipe Pelanggan</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status"
                  checked={editFields.status}
                  onCheckedChange={(checked) => handleFieldToggle('status', checked as boolean)}
                />
                <Label htmlFor="status" className="text-sm">Status</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notes"
                  checked={editFields.notes}
                  onCheckedChange={(checked) => handleFieldToggle('notes', checked as boolean)}
                />
                <Label htmlFor="notes" className="text-sm">Catatan</Label>
              </div>
            </div>
          </div>

          {/* Value Inputs */}
          <div className="space-y-4">
            {editFields.customer_type && (
              <div className="space-y-2">
                <Label htmlFor="bulk_customer_type">Tipe Pelanggan</Label>
                <Select value={updateValues.customer_type} onValueChange={(value) => handleValueChange('customer_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe pelanggan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="wholesale">Wholesale</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editFields.status && (
              <div className="space-y-2">
                <Label htmlFor="bulk_status">Status</Label>
                <Select value={updateValues.status} onValueChange={(value) => handleValueChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editFields.notes && (
              <div className="space-y-2">
                <Label htmlFor="bulk_notes">Catatan</Label>
                <Input
                  id="bulk_notes"
                  value={updateValues.notes}
                  onChange={(e) => handleValueChange('notes', e.target.value)}
                  placeholder="Tambahkan catatan..."
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleBulkUpdate} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update {selectedCount} Pelanggan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

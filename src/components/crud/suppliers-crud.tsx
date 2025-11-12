'use client'

import { useState, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSupabaseCRUD } from '@/hooks/supabase/index'
import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('SuppliersCRUD')
import type { Row, Insert, Update } from '@/types/database'

type Supplier = Row<'suppliers'>

export const SuppliersCRUD = (): JSX.Element => {
  const { data: suppliers, loading, error, create: createSupplier, update: updateSupplier, remove: deleteSupplier } = useSupabaseCRUD('suppliers')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  const handleCreate = useCallback((): void => {
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    })
    setIsCreateModalOpen(true)
  }, [])

  const handleEdit = useCallback((supplier: Supplier): void => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person ?? '',
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      address: supplier.address ?? '',
      notes: supplier.notes ?? ''
    })
    setIsEditModalOpen(true)
  }, [])

  const handleDelete = useCallback((supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleSubmitCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSupplier(formData as Insert<'suppliers'>)
      setIsCreateModalOpen(false)
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to create supplier:')
    }
  }, [createSupplier, formData])

  const handleSubmitEdit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplier) return

    try {
      await updateSupplier(selectedSupplier.id, formData as Update<'suppliers'>)
      setIsEditModalOpen(false)
      setSelectedSupplier(null)
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to update supplier:')
    }
  }, [selectedSupplier, updateSupplier, formData])

  const handleConfirmDelete = useCallback(async (): Promise<void> => {
    if (!selectedSupplier) return

    try {
      await deleteSupplier(selectedSupplier.id)
      setIsDeleteDialogOpen(false)
      setSelectedSupplier(null)
    } catch (error: unknown) {
      logger.error({ error }, 'Failed to delete supplier:')
    }
  }, [selectedSupplier, deleteSupplier])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading suppliers: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Suppliers List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Suppliers</CardTitle>
            <Button onClick={handleCreate} disabled={loading}>
              Add Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : suppliers && suppliers.length > 0 ? (
            <div className="space-y-2">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex justify-between items-center p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{supplier.name}</h3>
                    <p className="text-sm text-gray-600">{supplier.contact_person || 'No contact'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(supplier)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(supplier)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No suppliers found. Add your first supplier to get started.</p>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Supplier</h2>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Supplier</h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-contact_person">Contact Person</Label>
                <Input
                  id="edit-contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange('contact_person', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Supplier</h2>
            <p className="mb-4">Are you sure you want to delete &quot;{selectedSupplier?.name}&quot;?</p>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

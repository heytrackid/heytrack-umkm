'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { useResponsive } from '@/hooks/use-mobile'
import { FormFieldSkeleton } from '@/components/ui/skeletons/form-skeletons'

interface CostFormViewProps {
  currentView: 'add' | 'edit'
  newCost: OperationalCost
  setNewCost: React.Dispatch<React.SetStateAction<OperationalCost>>
  onSave: () => void
  onCancel: () => void
  isLoading: boolean
  costCategories: Array<{ id: string; name: string; icon: string; description: string }>
  frequencies: Array<{ value: string; label: string }>
}

export interface OperationalCost {
  id: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  description?: string
  isFixed: boolean
  icon: string
}

/**
 * Cost Form View Component
 * Handles add/edit form for operational costs
 */
export default function CostFormView({
  currentView,
  newCost,
  setNewCost,
  onSave,
  onCancel,
  isLoading,
  costCategories,
  frequencies
}: CostFormViewProps) {
  const { isMobile } = useResponsive()

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Form Skeleton */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <FormFieldSkeleton key={i} />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {currentView === 'add' ? 'Tambah' : 'Edit'} Biaya Operasional
          </h2>
          <p className="text-muted-foreground">
            {currentView === 'add' ? 'Tambahkan biaya operasional baru' : 'Edit biaya operasional'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{"Placeholder"}</Label>
              <Input
                value={newCost.name}
                onChange={(e) => setNewCost({...newCost, name: e.target.value})}
                placeholder={"Placeholder"}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{"Placeholder"}</Label>
              <Select 
                value={newCost.category} 
                onValueChange={(value) => setNewCost({...newCost, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {costCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name} - {category.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{"Placeholder"}</Label>
              <Input
                type="number"
                value={newCost.amount}
                onChange={(e) => setNewCost }))}
                placeholder={"Placeholder"}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{"Placeholder"}</Label>
              <Select 
                value={newCost.frequency} 
                onValueChange={(value: any) => setNewCost)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deskripsi (Opsional)</Label>
            <Textarea
              value={newCost.description}
              onChange={(e) => setNewCost({...newCost, name: e.target.value})}
              placeholder="Deskripsi tambahan..."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isFixed"
              checked={newCost.isFixed}
              onChange={(e) => setNewCost({...newCost, name: e.target.value})}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isFixed" className="text-sm">
              Biaya tetap (tidak berubah setiap periode)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {"Placeholder"}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              {"Placeholder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Lightbulb } from 'lucide-react'

/**
 * Categories tab component for inventory management
 */
export function CategoriesTab() {
  return (
    <>
      {/* Categories Management - Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Kategori Bahan Baku
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Kelola kategori untuk mengelompokkan bahan baku
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => window.location.href = '/categories'}
            >
              <Package className="h-4 w-4 mr-2" />
              Kelola Kategori
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Kelola kategori melalui menu Kategori</p>
            <Button
              onClick={() => window.location.href = '/categories'}
              className="mt-4"
              variant="outline"
            >
              <Package className="h-4 w-4 mr-2" />
              Buka Menu Kategori
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Category Tips */}
      <Alert className="border-gray-200 bg-gray-50">
        <Lightbulb className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-gray-700">
          💡 <strong>Tips Kategori:</strong> Kelompokkan bahan dengan sifat serupa. Misalnya: semua tepung dalam "Tepung & Biji-bijian", semua dairy dalam "Dairy & Lemak". Ini memudahkan pencarian dan analisis cost per kategori!
        </AlertDescription>
      </Alert>
    </>
  )
}

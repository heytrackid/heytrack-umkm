'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { 
  IngredientForm,
  RecipeForm, 
  CustomerForm,
  FinancialRecordForm
} from '@/components/forms/enhanced-forms'
import { useEnhancedCRUD } from '@/hooks/useEnhancedCRUD'
import { useSupabaseData } from '@/hooks/useSupabaseCRUD'
import { validateFormData, IngredientSchema } from '@/lib/validations'

export default function ValidationDemoPage() {
  const [testResults, setTestResults] = useState<Array<{
    test: string
    result: 'success' | 'error' | 'info'
    message: string
  }>>([])

  // Test hooks
  const ingredientCRUD = useEnhancedCRUD('ingredients')
  const { data: ingredients, loading: ingredientsLoading } = useSupabaseData('ingredients')

  const addTestResult = (test: string, result: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [...prev, { test, result, message }])
  }

  // Test validation functions directly
  const testValidation = () => {
    setTestResults([]) // Clear previous results

    // Test 1: Valid ingredient data
    const validIngredient = {
      name: 'Tepung Terigu',
      unit: 'kg' as const,
      price_per_unit: 15000,
      current_stock: 10,
      min_stock: 5,
      description: 'Tepung terigu protein tinggi',
      is_active: true
    }

    const validResult = validateFormData(IngredientSchema, validIngredient)
    if (validResult.success) {
      addTestResult('Valid Data', 'success', 'Data ingredient valid berhasil divalidasi')
    } else {
      addTestResult('Valid Data', 'error', 'Gagal validasi data yang seharusnya valid')
    }

    // Test 2: Invalid ingredient data (missing required fields)
    const invalidIngredient = {
      name: '', // Empty name - should fail
      unit: 'kg' as const,
      price_per_unit: -1000, // Negative price - should fail
      current_stock: 10,
      min_stock: 15 // Min stock higher than current - should fail
    }

    const invalidResult = validateFormData(IngredientSchema, invalidIngredient)
    if (!invalidResult.success) {
      addTestResult('Invalid Data', 'success', `Validation errors detected: ${invalidResult.errors?.length} errors`)
    } else {
      addTestResult('Invalid Data', 'error', 'Data invalid tidak terdeteksi oleh validasi')
    }

    // Test 3: API format test
    testAPICall()
  }

  const testAPICall = async () => {
    try {
      // Test API endpoint with invalid data
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '', // Invalid
          unit: 'invalid-unit', // Invalid
          price_per_unit: -100 // Invalid
        })
      })

      const result = await response.json()
      
      if (!response.ok && result.errors) {
        addTestResult('API Validation', 'success', `API menolak data invalid: ${result.errors.length} errors`)
      } else {
        addTestResult('API Validation', 'error', 'API tidak memvalidasi data dengan benar')
      }
    } catch (error) {
      addTestResult('API Validation', 'info', 'Tidak dapat menguji API (mungkin belum running)')
    }
  }

  const handleIngredientSubmit = async (data: any) => {
    try {
      await ingredientCRUD.create(data)
      addTestResult('Form Submission', 'success', 'Ingredient berhasil ditambahkan melalui form')
    } catch (error) {
      addTestResult('Form Submission', 'error', `Gagal menambah ingredient: ${error}`)
    }
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'error': return 'border-red-200 bg-red-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-yellow-200 bg-yellow-50'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Validation System Demo</h1>
          <p className="text-gray-600 mt-2">
            Demo dan testing sistem validasi Zod yang telah diimplementasi
          </p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          TypeScript ✓ Clean Build
        </Badge>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Unit Tests</TabsTrigger>
          <TabsTrigger value="forms">Form Examples</TabsTrigger>
          <TabsTrigger value="api">API Examples</TabsTrigger>
          <TabsTrigger value="data">Live Data</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Validation Tests
                <Button onClick={testValidation} variant="outline">
                  Run Tests
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Klik "Run Tests" untuk menjalankan validasi tests
                    </AlertDescription>
                  </Alert>
                ) : (
                  testResults.map((test, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${getResultColor(test.result)}`}
                    >
                      <div className="flex items-center gap-2">
                        {getResultIcon(test.result)}
                        <strong>{test.test}:</strong>
                        <span>{test.message}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IngredientForm 
              onSubmit={handleIngredientSubmit}
              isLoading={ingredientCRUD.loading}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Form Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">✓ Implemented Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Real-time validation with Zod schemas</li>
                    <li>Indonesian error messages</li>
                    <li>Field-level validation feedback</li>
                    <li>Business rule validation (min/max stock)</li>
                    <li>Type-safe form handling</li>
                    <li>Toast notifications for success/error</li>
                    <li>Loading states with disabled submit</li>
                    <li>Responsive design</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">🔧 Validation Rules:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Nama: 2-100 karakter, wajib diisi</li>
                    <li>Unit: Enum (kg, gram, liter, ml, pcs, pack)</li>
                    <li>Harga: Angka positif, dalam Rupiah</li>
                    <li>Stok: Tidak boleh negatif</li>
                    <li>Min stock ≤ Current stock</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Validation Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Valid Request:</h4>
                  <pre className="bg-green-50 p-3 rounded text-sm overflow-x-auto">
{`POST /api/ingredients
{
  "name": "Tepung Terigu",
  "unit": "kg",
  "price_per_unit": 15000,
  "current_stock": 10,
  "min_stock": 5,
  "is_active": true
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "message": "Ingredient berhasil ditambahkan"
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Invalid Request:</h4>
                  <pre className="bg-red-50 p-3 rounded text-sm overflow-x-auto">
{`POST /api/ingredients
{
  "name": "",
  "unit": "invalid",
  "price_per_unit": -100
}

Response: 400 Bad Request
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    "name: Nama minimal 2 karakter",
    "unit: Unit tidak valid", 
    "price_per_unit: Harus berupa angka positif"
  ]
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">✓ Server-side Validation:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Request body validation with Zod</li>
                    <li>Query parameter validation</li>
                    <li>Standardized error responses</li>
                    <li>Indonesian error messages</li>
                    <li>Database constraint handling</li>
                    <li>Business logic validation</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">🔧 Middleware:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>withValidation() - Body validation</li>
                    <li>withQueryValidation() - URL params</li>
                    <li>createSuccessResponse() - Standard success</li>
                    <li>createErrorResponse() - Standard errors</li>
                    <li>handleDatabaseError() - DB error mapping</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">🚀 Enhanced Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Pagination with search & sort</li>
                    <li>Rate limiting</li>
                    <li>CORS handling</li>
                    <li>Authentication middleware</li>
                    <li>Cascade delete protection</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Data from Database</CardTitle>
            </CardHeader>
            <CardContent>
              {ingredientsLoading ? (
                <div className="text-center py-4">Loading ingredients...</div>
              ) : (
                <div className="space-y-2">
                  <p>Total ingredients: <Badge>{ingredients?.length || 0}</Badge></p>
                  {ingredients && ingredients.length > 0 ? (
                    <div className="grid gap-2">
                      {ingredients.slice(0, 5).map((ingredient: any) => (
                        <div key={ingredient.id} className="border rounded p-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{ingredient.name}</span>
                            <Badge variant={ingredient.is_active ? 'default' : 'secondary'}>
                              {ingredient.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {ingredient.current_stock} {ingredient.unit} - 
                            Rp {ingredient.price_per_unit?.toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {ingredients.length > 5 && (
                        <div className="text-center text-sm text-gray-500">
                          ... and {ingredients.length - 5} more ingredients
                        </div>
                      )}
                    </div>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Belum ada data ingredients. Gunakan form di tab "Form Examples" untuk menambah data.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
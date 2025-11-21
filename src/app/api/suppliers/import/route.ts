// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { isErrorResponse, requireAuth } from '@/lib/api-auth'
import { createErrorResponse, createSuccessResponse } from '@/lib/api-core/responses'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { createSecureHandler, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'

const SupplierImportSchema = z.object({
  name: z.string().min(1),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  company_type: z.string().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
})

const SuppliersImportSchema = z.object({
  suppliers: z.array(SupplierImportSchema),
})

// POST /api/suppliers/import - Import suppliers from CSV
async function postHandler(request: NextRequest): Promise<NextResponse> {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/suppliers/import - Request received')

    // Authenticate with Stack Auth
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    const supabase = await createClient()
    const body = await request.json()
    const validation = SuppliersImportSchema.safeParse(body)

    if (!validation.success) {
      return createErrorResponse('Invalid request data', 400, validation.error.issues.map(i => i.message))
    }

    const { suppliers } = validation.data

    const errors: Array<{ row: number; error: string }> = []
    const validSuppliers: Array<{
      name: string
      contact_person?: string
      phone?: string
      email?: string
      address?: string
      company_type?: string
      payment_terms?: string
      notes?: string
      user_id: string
    }> = []

    // Validate and prepare data
    suppliers.forEach((supplier: unknown, index: number) => {
      const rowNumber = index + 2 // +2 because row 1 is header, and array is 0-indexed

      try {
        const supplierObj = supplier as Record<string, unknown>

        // Basic validation
        if (!supplierObj['name'] || typeof supplierObj['name'] !== 'string' || supplierObj['name'].trim().length === 0) {
          errors.push({ row: rowNumber, error: 'Nama supplier wajib diisi' })
          return
        }

        // Prepare supplier data
        const supplierData = {
          name: supplierObj['name'].trim(),
          contact_person: typeof supplierObj['contact_person'] === 'string' ? supplierObj['contact_person'].trim() : '',
          phone: typeof supplierObj['phone'] === 'string' ? supplierObj['phone'].trim() : '',
          email: typeof supplierObj['email'] === 'string' ? supplierObj['email'].trim() : '',
          address: typeof supplierObj['address'] === 'string' ? supplierObj['address'].trim() : '',
          company_type: typeof supplierObj['company_type'] === 'string' ? supplierObj['company_type'].trim() : '',
          payment_terms: typeof supplierObj['payment_terms'] === 'string' ? supplierObj['payment_terms'].trim() : '',
          notes: typeof supplierObj['notes'] === 'string' ? supplierObj['notes'].trim() : '',
          user_id: user['id']
        }

        validSuppliers.push(supplierData)
      } catch (error) {
        errors.push({ row: rowNumber, error: `Error processing row: ${String(error)}` })
      }
    })

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Found ${errors.length} validation errors`,
        details: errors
      }, { status: 400 })
    }

    // Insert suppliers
    const { data, error: insertError } = await supabase
      .from('suppliers')
      .insert(validSuppliers as never)
      .select('id, name')

    if (insertError) {
      apiLogger.error({ error: insertError }, 'POST /api/suppliers/import - Database error')
      return createErrorResponse('Failed to import suppliers', 500)
    }

    apiLogger.info({
      userId: user['id'],
      count: validSuppliers.length
    }, 'POST /api/suppliers/import - Success')

    return createSuccessResponse({
      count: validSuppliers.length,
      data
    }, SUCCESS_MESSAGES.SUPPLIER_IMPORTED, undefined, 201)
  } catch (error) {
    apiLogger.error({ error }, 'POST /api/suppliers/import - Unexpected error')
    return handleAPIError(error, 'POST /api/suppliers/import')
  }
}

// Apply security middleware
export const POST = createSecureHandler(postHandler, 'POST /api/suppliers/import', SecurityPresets.enhanced())

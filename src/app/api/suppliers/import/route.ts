// ✅ Force Node.js runtime (required for DOMPurify/jsdom)
import { handleAPIError } from '@/lib/errors/api-error-handler'
export const runtime = 'nodejs'

import { z } from 'zod'

import { createSuccessResponse } from '@/lib/api-core/responses'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { apiLogger } from '@/lib/logger'
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { SecurityPresets } from '@/utils/security/api-middleware'
import type { NextResponse } from 'next/server'

const SupplierImportSchema = z.object({
  name: z.string().min(1),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  supplier_type: z.enum(['preferred', 'standard', 'trial', 'blacklisted']).optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
})

const SuppliersImportSchema = z.object({
  suppliers: z.array(SupplierImportSchema),
})

// POST /api/suppliers/import - Import suppliers from CSV
async function postHandler(context: RouteContext, _query?: never, body?: z.infer<typeof SuppliersImportSchema>): Promise<NextResponse> {
  const { user, supabase, request } = context

  try {
    apiLogger.info({ url: request.url }, 'POST /api/suppliers/import - Request received')

    if (!body) {
      return handleAPIError(new Error('Request body is required'), 'API Route')
    }

    const { suppliers } = body

    const errors: Array<{ row: number; error: string }> = []
    const validSuppliers: Array<{
      name: string
      contact_person?: string
      phone?: string
      email?: string
      address?: string
      supplier_type?: string
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
        const supplierTypeValue = typeof supplierObj['supplier_type'] === 'string' ? supplierObj['supplier_type'].trim() : ''
        const validSupplierTypes = ['preferred', 'standard', 'trial', 'blacklisted']
        const supplierType = validSupplierTypes.includes(supplierTypeValue) ? supplierTypeValue : 'standard'

        const supplierData = {
          name: supplierObj['name'].trim(),
          contact_person: typeof supplierObj['contact_person'] === 'string' ? supplierObj['contact_person'].trim() : '',
          phone: typeof supplierObj['phone'] === 'string' ? supplierObj['phone'].trim() : '',
          email: typeof supplierObj['email'] === 'string' ? supplierObj['email'].trim() : '',
          address: typeof supplierObj['address'] === 'string' ? supplierObj['address'].trim() : '',
          supplier_type: supplierType,
          payment_terms: typeof supplierObj['payment_terms'] === 'string' ? supplierObj['payment_terms'].trim() : '',
          notes: typeof supplierObj['notes'] === 'string' ? supplierObj['notes'].trim() : '',
          user_id: user.id
        }

        validSuppliers.push(supplierData)
      } catch (error) {
        errors.push({ row: rowNumber, error: `Error processing row: ${String(error)}` })
      }
    })

    // If there are validation errors, return them
    if (errors.length > 0) {
      return handleAPIError(new Error(`Found ${errors.length} validation errors`), 'POST /api/suppliers/import')
    }

    // Insert suppliers
    const { data, error: insertError } = await supabase
      .from('suppliers')
      .insert(validSuppliers as never)
      .select('id, name')

    if (insertError) {
      apiLogger.error({ error: insertError }, 'POST /api/suppliers/import - Database error')
      return handleAPIError(new Error('Failed to import suppliers'), 'API Route')
    }

    apiLogger.info({
      userId: user.id,
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

// Apply API route factory
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/suppliers/import',
    securityPreset: SecurityPresets.basic(),
  },
  postHandler
)

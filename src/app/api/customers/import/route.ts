// Import customers from CSV
// Similar to supplier import functionality

import { createSuccessResponse } from '@/lib/api-core'
import { createApiRoute } from '@/lib/api/route-factory'
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { CustomerTypeEnum, EmailSchema, PercentageSchema, PhoneSchema } from '@/lib/validations/common'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { z } from 'zod'

// Use centralized validation schemas
const CustomerImportSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: EmailSchema.optional().or(z.literal('')),
  phone: PhoneSchema.optional(),
  address: z.string().optional(),
  customer_type: CustomerTypeEnum.optional(),
  discount_percentage: PercentageSchema.optional(),
  notes: z.string().optional(),
})

type CustomerImportData = z.infer<typeof CustomerImportSchema>

const ImportCustomersSchema = z.object({
  customers: z.array(CustomerImportSchema),
})

export const runtime = 'nodejs'

export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/customers/import',
    bodySchema: ImportCustomersSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context, _query, body) => {
    const { user, supabase } = context
    const { customers } = body || {}

    apiLogger.info({ userId: user.id }, 'POST /api/customers/import - Request received')

    if (!customers || customers.length === 0) {
      return handleAPIError(new Error('No customers to import'), 'POST /api/customers/import')
    }

    // Validate all customers
    const errors: string[] = []
    customers.forEach((customer: unknown, index: number) => {
      const result = CustomerImportSchema.safeParse(customer)
      if (!result.success) {
        errors.push(`Row ${index + 1}: ${result.error.issues.map((issue) => issue.message).join(', ')}`)
      }
    })

    // Type assertion after validation
    const validCustomers = customers as CustomerImportData[]

    if (errors.length > 0) {
      apiLogger.error({ errors }, 'POST /api/customers/import - Validation errors')
      return handleAPIError(new Error(`Found ${errors.length} validation errors`), 'POST /api/customers/import')
    }

    // Insert customers
    const { data, error: insertError } = await supabase
      .from('customers')
      .insert(
        validCustomers.map((customer) => ({
          ...customer,
          user_id: user.id,
          email: customer.email || null,
          phone: customer.phone || null,
          address: customer.address || null,
          customer_type: customer.customer_type || 'regular',
          discount_percentage: customer.discount_percentage || null,
          notes: customer.notes || null,
          is_active: true,
        }))
      )
      .select('id, name')

    if (insertError) {
      apiLogger.error({ error: insertError }, 'POST /api/customers/import - Database error')
      return handleAPIError(new Error('Failed to import customers'), 'POST /api/customers/import')
    }

    apiLogger.info({ count: data?.length }, 'POST /api/customers/import - Success')

    return createSuccessResponse({
      count: data?.length || 0,
      customers: data,
    }, SUCCESS_MESSAGES.CUSTOMER_CREATED)
  }
)
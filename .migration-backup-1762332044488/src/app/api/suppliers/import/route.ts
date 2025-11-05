import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { checkBotId } from 'botid/server'
import { apiLogger } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { handleAPIError } from '@/lib/errors/api-error-handler'

// POST /api/suppliers/import - Import suppliers from CSV
async function POST(request: NextRequest) {
  try {
    apiLogger.info({ url: request.url }, 'POST /api/suppliers/import - Request received')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      apiLogger.error({ error: authError }, 'POST /api/suppliers/import - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the request is from a bot
    const verification = await checkBotId()
    if (verification.isBot) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { suppliers } = await request.json()

    if (!Array.isArray(suppliers) || suppliers.length === 0) {
      return NextResponse.json({ error: 'Invalid suppliers data' }, { status: 400 })
    }

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
    suppliers.forEach((supplier: any, index: number) => {
      const rowNumber = index + 2 // +2 because row 1 is header, and array is 0-indexed

      try {
        // Basic validation
        if (!supplier.name || typeof supplier.name !== 'string' || supplier.name.trim().length === 0) {
          errors.push({ row: rowNumber, error: 'Nama supplier wajib diisi' })
          return
        }

        // Prepare supplier data
        const supplierData = {
          name: supplier.name.trim(),
          contact_person: supplier.contact_person?.trim() || null,
          phone: supplier.phone?.trim() || null,
          email: supplier.email?.trim() || null,
          address: supplier.address?.trim() || null,
          company_type: supplier.company_type?.trim() || null,
          payment_terms: supplier.payment_terms?.trim() || null,
          notes: supplier.notes?.trim() || null,
          user_id: user.id
        }

        validSuppliers.push(supplierData)
      } catch (error: unknown) {
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
      .insert(validSuppliers)
      .select('id, name')

    if (insertError) {
      apiLogger.error({ error: insertError }, 'POST /api/suppliers/import - Database error')
      return NextResponse.json({ error: 'Failed to import suppliers' }, { status: 500 })
    }

    apiLogger.info({
      userId: user.id,
      count: validSuppliers.length
    }, 'POST /api/suppliers/import - Success')

    return NextResponse.json({
      success: true,
      count: validSuppliers.length,
      data
    })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'POST /api/suppliers/import - Unexpected error')
    return handleAPIError(error, 'POST /api/suppliers/import')
  }
}

export { POST }
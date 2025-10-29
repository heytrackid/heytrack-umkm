import { type NextRequest, NextResponse } from 'next/server'
import { withSecurity, SecurityPresets } from '@/utils/security'

// Test route to demonstrate security enhancements
async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    
    // Return the processed data to show that sanitization occurred
    return NextResponse.json({
      message: 'Data received and sanitized successfully',
      originalData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    )
  }
}

// Apply security middleware to the route
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())

export { securedPOST as POST }
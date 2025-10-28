import { type NextRequest, NextResponse } from 'next/server'
import { ErrorLogSchema } from '@/lib/validations/api-schemas'
import { validateRequestOrRespond } from '@/lib/validations/validate-request'
import type { Database } from '@/types/supabase-generated'
import { apiLogger } from '@/lib/logger'
interface ErrorRecord {
  id: string
  timestamp: string
  message: string
  url: string
  stack?: string
  level: string
  context?: Record<string, unknown>
}

// Simple in-memory error store (in production, use a real database/service)
const errorStore: ErrorRecord[] = []

const MAX_ERRORS = 1000 // Keep only last 1000 errors

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validatedData = await validateRequestOrRespond(request, ErrorLogSchema)
    if (validatedData instanceof NextResponse) {return validatedData}
    
    // Create error record
    const errorRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: validatedData.timestamp || new Date().toISOString(),
      message: validatedData.message,
      url: validatedData.url || request.url || '',
      stack: validatedData.stack,
      level: validatedData.level,
      context: validatedData.context,
    }
    
    // Add to store
    errorStore.push(errorRecord)
    
    // Keep only recent errors
    if (errorStore.length > MAX_ERRORS) {
      errorStore.splice(0, errorStore.length - MAX_ERRORS)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      apiLogger.error({ error: {
        id: errorRecord.id,
        message: errorRecord.message,
        url: errorRecord.url,
        timestamp: errorRecord.timestamp
      } }, '🔴 Client Error Logged:')
    }
    
    // In production, you might want to:
    // 1. Send to external error tracking service (Sentry, LogRocket, etc.)
    // 2. Store in database
    // 3. Send alert notifications for critical errors
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external service
      // await sendToExternalService(errorRecord)
      
      // Example: Check if error is critical and send alert
      if (isCriticalError(errorRecord)) {
        apiLogger.error({ error: errorRecord }, '🚨 CRITICAL ERROR:')
        // await sendCriticalErrorAler""
      }
    }
    
    return NextResponse.json({
      success: true,
      errorId: errorRecord.id,
      message: 'Error logged successfully'
    })
    
  } catch (err: unknown) {
    apiLogger.error({ err }, 'Failed to log error:')
    
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Only allow in development or with proper authentication
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }
  
  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
  
  const recentErrors = errorStore
    .slice(-limit)
    .reverse() // Most recent first
  
  return NextResponse.json({
    errors: recentErrors,
    total: errorStore.length
  })
}

function isCriticalError(error: ErrorRecord): boolean {
  const criticalKeywords = [
    'network error',
    'database connection',
    'authentication failed',
    'permission denied',
    'out of memory',
    'security violation'
  ]
  
  const errorText = `${error.message} ${error.stack || ''}`.toLowerCase()
  
  return criticalKeywords.some(keyword => errorText.includes(keyword))
}

// Example function to send to external service
// async function sendToExternalService(error: typeof errorStore[0]) {
//   // Sentry example:
//   // Sentry.captureException(new Error((error instanceof Error ? (error as any).message : String(error))), {
//   //   extra: {
//   //     componentStack: error.componentStack,
//   //     url: error.url,
//   //     errorId: error.errorId
//   //   }
//   // })
// }
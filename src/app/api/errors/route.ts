import { NextRequest, NextResponse } from 'next/server'
import { validateInput } from '@/lib/validation'

// Simple in-memory error store (in production, use a real database/service)
const errorStore: Array<{
  id: string
  timestamp: string
  message: string
  stack?: string
  componentStack?: string
  url: string
  userAgent: string
  errorId: string
}> = []

const MAX_ERRORS = 1000 // Keep only last 1000 errors

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateInput(body, {
      message: { required: true, type: 'string', maxLength: 1000 },
      stack: { type: 'string', maxLength: 10000 },
      componentStack: { type: 'string', maxLength: 10000 },
      url: { required: true, type: 'string', maxLength: 500 },
      userAgent: { required: true, type: 'string', maxLength: 500 },
      errorId: { required: true, type: 'string', maxLength: 100 },
      timestamp: { required: true, type: 'string' }
    })
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }
    
    // Create error record
    const errorRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: body.timestamp,
      message: body.message,
      stack: body.stack,
      componentStack: body.componentStack,
      url: body.url,
      userAgent: body.userAgent,
      errorId: body.errorId,
    }
    
    // Add to store
    errorStore.push(errorRecord)
    
    // Keep only recent errors
    if (errorStore.length > MAX_ERRORS) {
      errorStore.splice(0, errorStore.length - MAX_ERRORS)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Client Error Logged:', {
        id: errorRecord.id,
        message: errorRecord.message,
        url: errorRecord.url,
        timestamp: errorRecord.timestamp
      })
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
        console.error('🚨 CRITICAL ERROR:', errorRecord)
        // await sendCriticalErrorAler""
      }
    }
    
    return NextResponse.json({
      success: true,
      errorId: errorRecord.id,
      message: 'Error logged successfully'
    })
    
  } catch (error) {
    console.error('Failed to log error:', error)
    
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

function isCriticalError(error: typeof errorStore[0]): boolean {
  const criticalKeywords = [
    'network error',
    'database connection',
    'authentication failed',
    'permission denied',
    'out of memory',
    'security violation'
  ]
  
  const errorText = `${error.message} ${error.stack}`.toLowerCase()
  
  return criticalKeywords.some(keyword => errorText.includes(keyword))
}

// Example function to send to external service
// async function sendToExternalService(error: typeof errorStore[0]) {
//   // Sentry example:
//   // Sentry.captureException(new Error(error.message), {
//   //   extra: {
//   //     componentStack: error.componentStack,
//   //     url: error.url,
//   //     errorId: error.errorId
//   //   }
//   // })
// }
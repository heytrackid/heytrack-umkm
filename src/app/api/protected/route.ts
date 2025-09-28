import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  // If there is no signed in user, this will return a 404 error
  await auth.protect()
  
  const { userId } = await auth()
  
  // Add your Route Handler logic here
  return NextResponse.json({ 
    message: 'Hello from protected API!',
    userId,
    timestamp: new Date().toISOString()
  })
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Process the request with authenticated user
  return NextResponse.json({ 
    message: 'Data received successfully',
    userId,
    data: body
  })
}
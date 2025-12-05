/**
 * DEPRECATED: This route forwards to /api/production/batches
 * Use /api/production/batches for all production batch operations
 * This ensures inventory is properly synced on status changes.
 */

import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// Forward request to the correct endpoint (preserves body for POST/PUT)
async function forwardRequest(request: NextRequest, slug?: string[]) {
  const newPath = slug?.length 
    ? `/api/production/batches/${slug.join('/')}`
    : '/api/production/batches'
  
  const url = new URL(newPath, request.url)
  url.search = request.nextUrl.search
  
  // Clone the request with the new URL
  const headers = new Headers(request.headers)
  
  // Forward the request internally
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
  const body = hasBody ? await request.text() : null
  
  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  })
  
  return response
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return forwardRequest(request, slug)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return forwardRequest(request, slug)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return forwardRequest(request, slug)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return forwardRequest(request, slug)
}
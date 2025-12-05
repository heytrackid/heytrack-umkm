/**
 * DEPRECATED: This route redirects to /api/production/batches
 * Use /api/production/batches for all production batch operations
 * This ensures inventory is properly synced on status changes.
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Redirect all methods to the correct endpoint
function redirect(request: NextRequest, slug?: string[]) {
  const newPath = slug?.length 
    ? `/api/production/batches/${slug.join('/')}`
    : '/api/production/batches'
  
  const url = new URL(newPath, request.url)
  url.search = request.nextUrl.search
  
  return NextResponse.redirect(url, { status: 308 }) // Permanent redirect
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return redirect(request, slug)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return redirect(request, slug)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return redirect(request, slug)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  return redirect(request, slug)
}
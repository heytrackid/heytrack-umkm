import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Version is based on build time - changes on every deployment
const BUILD_VERSION = process.env['VERCEL_GIT_COMMIT_SHA']?.slice(0, 8) 
  || process.env['NEXT_PUBLIC_BUILD_ID'] 
  || Date.now().toString(36)

export function GET() {
  return NextResponse.json({
    version: BUILD_VERSION,
    timestamp: Date.now()
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}

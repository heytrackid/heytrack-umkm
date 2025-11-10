export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const verifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = verifySchema.parse(body)

    const secretKey = process.env['TURNSTILE_SECRET_KEY']

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'Turnstile not configured' },
        { status: 500 }
      )
    }

    // Verify token with Cloudflare
    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        }),
      }
    )

    const data = (await verifyResponse.json()) as TurnstileResponse

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed',
          errorCodes: data['error-codes'],
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification successful',
      timestamp: data.challenge_ts,
    })
  } catch (error) {
    console.error('Turnstile verification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

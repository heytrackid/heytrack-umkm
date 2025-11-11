export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createLogger } from '@/lib/logger'
import { SecurityPresets, withSecurity } from '@/utils/security/index'

const logger = createLogger('POST /api/verify-turnstile')

const TurnstileSchema = z.object({
  token: z.string().min(1),
})

interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
}

async function verifyTurnstilePOST(req: NextRequest) {
  try {
    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      logger.warn({ parseError }, 'Failed to parse request body')
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate request data
    const validation = TurnstileSchema.safeParse(body)
    if (!validation.success) {
      logger.warn({ 
        errors: validation.error.issues,
        receivedBody: body 
      }, 'Invalid request data')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { token } = validation.data
    const isDev = process.env.NODE_ENV === 'development'

    logger.info({ 
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20),
      isDev 
    }, 'Received Turnstile token')

    // Development bypass - accept dev token without verification
    if (isDev && token === 'dev-bypass-token') {
      logger.info('Development mode: Bypassing Turnstile verification')
      return NextResponse.json({
        success: true,
        hostname: 'localhost',
        challengeTs: new Date().toISOString(),
        dev: true,
      })
    }

    const secretKey = process.env['TURNSTILE_SECRET_KEY']
    if (!secretKey) {
      logger.error('Turnstile secret key not configured')
      return NextResponse.json(
        { success: false, error: 'Turnstile not configured' },
        { status: 500 }
      )
    }

    // Verify token with Cloudflare Turnstile API
    logger.info('Verifying token with Cloudflare API')
    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    })

    if (!verifyResponse.ok) {
      logger.error({ 
        status: verifyResponse.status,
        statusText: verifyResponse.statusText 
      }, 'Cloudflare API returned error status')
      return NextResponse.json(
        { success: false, error: 'Verification service error' },
        { status: 502 }
      )
    }

    const verifyData = (await verifyResponse.json()) as TurnstileVerifyResponse

    if (!verifyData.success) {
      logger.warn({
        errorCodes: verifyData['error-codes'],
        hostname: verifyData.hostname,
      }, 'Turnstile verification failed')
      return NextResponse.json(
        {
          success: false,
          error: 'Verification failed',
          errorCodes: verifyData['error-codes'],
        },
        { status: 400 }
      )
    }

    logger.info({
      hostname: verifyData.hostname,
      challengeTs: verifyData.challenge_ts,
    }, 'Turnstile verification successful')

    return NextResponse.json({
      success: true,
      hostname: verifyData.hostname,
      challengeTs: verifyData.challenge_ts,
    })
  } catch (error) {
    logger.error({ 
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    }, 'Error verifying Turnstile token')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withSecurity(verifyTurnstilePOST, SecurityPresets.enhanced())

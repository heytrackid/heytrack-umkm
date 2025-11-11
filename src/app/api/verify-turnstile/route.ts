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
  action?: string
  cdata?: string
  metadata?: {
    ephemeral_id?: string
  }
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

    logger.info({ 
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20)
    }, 'Received Turnstile token')

    const secretKey = process.env['TURNSTILE_SECRET_KEY']
    if (!secretKey) {
      logger.error('Turnstile secret key not configured')
      return NextResponse.json(
        { success: false, error: 'Turnstile not configured' },
        { status: 500 }
      )
    }

    // Log configuration for debugging (without exposing secret)
    logger.info({
      hasSecretKey: !!secretKey,
      secretKeyLength: secretKey.length,
      isTestKey: secretKey.startsWith('1x') || secretKey.startsWith('2x') || secretKey.startsWith('3x'),
      hostname: req.headers.get('host'),
    }, 'Turnstile configuration check')

    // Get client IP for better validation (recommended by Cloudflare)
    const clientIP = req.headers.get('cf-connecting-ip') ||
                     req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown'

    // Verify token with Cloudflare Turnstile API using URLSearchParams for form-encoded data
    logger.info({
      tokenLength: token.length,
      clientIP: clientIP !== 'unknown' ? clientIP : 'unknown',
      hasSecretKey: true
    }, 'Verifying token with Cloudflare API')

    const params = new URLSearchParams()
    params.append('secret', secretKey)
    params.append('response', token)
    if (clientIP !== 'unknown') {
      params.append('remoteip', clientIP)
    }

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
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
      const errorCodes = verifyData['error-codes'] || []
      logger.warn({
        errorCodes,
        hostname: verifyData.hostname,
        challengeTs: verifyData.challenge_ts,
        action: verifyData.action,
        cdata: verifyData.cdata,
        clientIP,
        errorDetails: JSON.stringify(verifyData),
      }, `Turnstile verification failed with codes: ${errorCodes.join(', ')}`)

      // Provide more specific error messages based on error codes
      let errorMessage = 'Verification failed'
      if (errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'Token expired or already used'
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Invalid token format'
      } else if (errorCodes.includes('missing-input-secret')) {
        errorMessage = 'Server configuration error'
      } else if (errorCodes.includes('invalid-input-secret')) {
        errorMessage = 'Server configuration error'
      } else if (errorCodes.includes('bad-request')) {
        errorMessage = 'Invalid request format'
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorCodes,
          details: `Cloudflare error codes: ${errorCodes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Additional validation for successful responses
    const challengeTime = verifyData.challenge_ts ? new Date(verifyData.challenge_ts) : null
    const now = new Date()
    const tokenAge = challengeTime ? (now.getTime() - challengeTime.getTime()) / (1000 * 60) : null // minutes

    if (tokenAge && tokenAge > 4) {
      logger.warn({
        tokenAge: tokenAge.toFixed(1),
        challengeTs: verifyData.challenge_ts
      }, 'Token is older than 4 minutes - close to expiry')
    }

    logger.info({
      hostname: verifyData.hostname,
      challengeTs: verifyData.challenge_ts,
      action: verifyData.action,
      cdata: verifyData.cdata,
      tokenAge: tokenAge?.toFixed(1),
      clientIP,
    }, 'Turnstile verification successful')

    return NextResponse.json({
      success: true,
      hostname: verifyData.hostname,
      challengeTs: verifyData.challenge_ts,
      action: verifyData.action,
      cdata: verifyData.cdata,
      tokenAge,
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

// Use basic security preset to avoid false positives on Turnstile tokens
// Turnstile tokens are opaque strings that may contain patterns like "0x" 
// which trigger SQL injection detection, but they're safe since they're
// verified directly with Cloudflare's API
export const POST = withSecurity(verifyTurnstilePOST, SecurityPresets.basic())

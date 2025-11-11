export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createLogger } from '@/lib/logger'
import { withSecurity, SecurityPresets } from '@/utils/security/index'

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
    const body = await req.json()
    const validation = TurnstileSchema.safeParse(body)

    if (!validation.success) {
      logger.warn({ errors: validation.error.issues }, 'Invalid request data')
      return NextResponse.json({ success: false, error: 'Invalid request data' }, { status: 400 })
    }

    const { token } = validation.data

    const secretKey = process.env['TURNSTILE_SECRET_KEY']

    if (!secretKey) {
      logger.error('Turnstile secret key not configured')
      return NextResponse.json(
        { success: false, error: 'Turnstile not configured' },
        { status: 500 }
      )
    }

    // Verify token with Cloudflare Turnstile API
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

    const verifyData = (await verifyResponse.json()) as TurnstileVerifyResponse

    if (!verifyData.success) {
      logger.warn({
        errorCodes: verifyData['error-codes'],
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
    logger.error({ error }, 'Error verifying Turnstile token')
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withSecurity(verifyTurnstilePOST, SecurityPresets.enhanced())

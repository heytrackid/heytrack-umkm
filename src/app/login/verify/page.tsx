import { verifyOTP } from '../actions'
import Link from 'next/link'

// Client component for form handling
'use client'
function VerifyForm({ email, message }: { email: string; message?: string }) {
  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <div className="text-center space-y-2 pb-4">
        <h2 className="text-2xl font-semibold">Check Your Email</h2>
        <p className="text-base">
          We've sent a 6-digit code to{' '}
          <span className="font-semibold">{email}</span>
        </p>
      </div>

      <div className="space-y-6">
        <form action={verifyOTP} className="space-y-4">
          <input
            type="hidden"
            name="email"
            value={email}
          />

          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium text-center block">
              Enter OTP Code
            </label>
            <input
              id="token"
              name="token"
              placeholder="000000"
              maxLength={6}
              className="w-full h-12 text-center text-xl font-mono tracking-widest border rounded-lg"
              required
            />
            <p className="text-xs text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-green-500 text-white font-medium rounded-lg"
          >
            Verify Code
          </button>
        </form>

        <Link href="/login">
          <button
            type="button"
            className="w-full h-11 border-2 rounded-lg"
          >
            ← Back to Login
          </button>
        </Link>

        {message && (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4">
            <p className="text-red-800 text-center">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Server Component (can be async)
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string; email: string }>
}) {
  console.log('VerifyPage: Starting render') // Debug log

  const params = await searchParams
  console.log('VerifyPage: Search params loaded:', { email: params.email, message: params.message }) // Debug log

  const email = params.email || ''

  console.log('VerifyPage: Render complete, email:', email) // Debug log

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header with Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">🍳</span>
          </div>
          <h1 className="text-3xl font-bold">
            HeyTrack UMKM
          </h1>
          <p className="text-muted-foreground">
            Smart Culinary Management System
          </p>
        </div>

        {/* Verify Form - Client Component */}
        <VerifyForm email={email} message={params.message} />

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 HeyTrack UMKM</p>
        </div>
      </div>
    </div>
  )
}

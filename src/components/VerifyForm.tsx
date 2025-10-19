'use client'

import { verifyOTP } from '@/app/login/actions'
import Link from 'next/link'

export function VerifyForm({ email, message }: { email: string; message?: string }) {
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

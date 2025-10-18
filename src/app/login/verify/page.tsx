import { verifyOTP } from '../actions'

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { message: string; email: string }
}) {
  const email = searchParams.email || ''

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-muted-foreground">
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <input
          type="hidden"
          name="email"
          value={email}
        />
        <label className="text-md" htmlFor="token">
          Enter OTP Code
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6 text-center text-2xl tracking-widest"
          name="token"
          placeholder="000000"
          maxLength={6}
          required
        />
        <button
          formAction={verifyOTP}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
        >
          Verify Code
        </button>
        <button
          type="button"
          onClick={() => window.location.href = '/login'}
          className="border border-gray-700 rounded-md px-4 py-2 text-foreground mb-2"
        >
          Back to Login
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}

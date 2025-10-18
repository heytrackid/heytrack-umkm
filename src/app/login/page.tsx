import { sendOTP } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">
          Sign in with your email to receive an OTP code
        </p>
      </div>

      <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        <label className="text-md" htmlFor="email">
          Email Address
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          type="email"
          placeholder="your.email@example.com"
          required
        />
        <button
          formAction={sendOTP}
          className="bg-green-700 rounded-md px-4 py-2 text-foreground mb-2"
        >
          Send OTP Code
        </button>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
            {searchParams.message}
          </p>
        )}
      </form>

      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Enter your email address above to receive a secure one-time password.</p>
        <p className="mt-2">No password needed - just check your email!</p>
      </div>
    </div>
  )
}

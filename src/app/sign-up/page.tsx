import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daftar ke HeyTrack
          </h1>
          <p className="text-gray-600">
            Buat akun baru untuk mulai menggunakan aplikasi
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              card: 'shadow-lg',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-gray-600',
            },
          }}
          routing="path"
          path="/sign-up"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}

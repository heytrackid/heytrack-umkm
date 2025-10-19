import { VerifyForm } from '@/components/VerifyForm'

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

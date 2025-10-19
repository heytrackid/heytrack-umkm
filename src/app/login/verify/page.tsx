import { verifyOTP } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, ChefHat, Shield, Mail } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header with Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
            HeyTrack UMKM
          </h1>
          <p className="text-muted-foreground">
            Smart Culinary Management System
          </p>
        </div>

        {/* Verify Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a 6-digit code to{' '}
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4">
              <input
                type="hidden"
                name="email"
                value={email}
              />

              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium text-center block">
                  Enter OTP Code
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="token"
                    name="token"
                    placeholder="000000"
                    maxLength={6}
                    className="pl-10 h-12 text-center text-xl font-mono tracking-widest bg-muted/50"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button
                formAction={verifyOTP}
                className="w-full h-11 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                Verify Code
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.href = '/login'}
                className="w-full h-11 border-2 hover:bg-muted transition-all duration-200"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </form>

            {params?.message && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
                <AlertDescription className="text-red-800 dark:text-red-200 text-center">
                  {params.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Security Note */}
            <div className="text-center space-y-2 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Verification</span>
              </div>
              <p className="text-xs text-muted-foreground">
                The code expires in 1 hour for your security
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2025 HeyTrack UMKM - Smart Culinary Management</p>
        </div>
      </div>
    </div>
  )
}

import { sendOTP } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ChefHat, Shield } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const params = await searchParams
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

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in with your email to receive a secure OTP code
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <Button
                formAction={sendOTP}
                className="w-full h-11 bg-black text-white font-medium shadow-lg transition-all duration-200"
                size="lg"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send OTP Code
              </Button>
            </form>

            {params?.message && (
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                <AlertDescription className="text-orange-800 dark:text-orange-200 text-center">
                  {params.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Security Note */}
            <div className="text-center space-y-2 pt-4 border-t">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure & Password-Free Authentication</span>
              </div>
              <p className="text-xs text-muted-foreground">
                No password needed - just check your email for the verification code!
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

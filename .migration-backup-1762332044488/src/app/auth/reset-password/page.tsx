'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getAuthErrorMessage, validateEmail } from '@/lib/auth-errors'
import { CheckCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, useState, useTransition } from 'react'
import { resetPassword } from './actions'

const ResetPasswordPage = () => {
  const [error, setError] = useState('')
  const [errorAction, setErrorAction] = useState<{ label: string; href: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string }>({})
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void setError('')
    void setErrorAction(null)
    void setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const emailValue = formData.get('email') as string

    // Client-side validation
    const emailValidation = validateEmail(emailValue)
    if (!emailValidation.isValid) {
      void setFieldErrors({ email: emailValidation.error })
      return
    }

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) {
        const authErrorMessage = getAuthErrorMessage(result.error)
        void setError(authErrorMessage)
      } else if (result?.success) {
        void setSuccess(true)
      }
    })
  }

  const clearFieldError = () => {
    void setFieldErrors({})
    void setError('')
    void setErrorAction(null)
  }

  if (success) {
    return (
      <div className="min-h-screen mobile-min-vh flex items-center justify-center bg-background p-4 sm:p-6 md:p-8 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800 animate-fade-in-scale">
          <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8 px-4 sm:px-6">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center mx-auto animate-success-pulse">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Email Terkirim!
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-2">
                  Kami telah mengirimkan link reset password ke:
                </p>
                <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-4 break-words">
                  {email}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Silakan check email Anda dan klik link untuk mereset password.
                  Link akan kadaluarsa dalam 1 jam.
                </p>
                <Link href="/auth/login">
                  <Button className="mt-6 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen mobile-min-vh flex items-center justify-center bg-background p-4 sm:p-6 md:p-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 dark:text-slate-100 font-bold text-base sm:text-lg">H</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">HeyTrack</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Reset password Anda</p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Lupa Password?</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            {error && (
              <Alert variant="destructive" className="animate-slide-in-top animate-shake">
                <AlertDescription className="text-sm">
                  {error}
                  {errorAction && (
                    <>
                      {' '}
                      <Link
                        href={errorAction.href}
                        className="font-medium underline underline-offset-4 hover:text-destructive-foreground/80 transition-colors duration-200"
                      >
                        {errorAction.label}
                      </Link>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    className={`pl-10 h-11 text-base transition-all duration-200 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                    disabled={isPending}
                    value={email}
                    onChange={(e) => {
                      void setEmail(e.target.value)
                      clearFieldError()
                    }}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="text-sm text-red-600 dark:text-red-400 animate-fade-in" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="animate-pulse">Mengirim...</span>
                  </span>
                ) : (
                  'Kirim Link Reset'
                )}
              </Button>
            </form>

            <div className="text-center text-sm sm:text-base">
              <span className="text-muted-foreground">Ingat password Anda? </span>
              <Link
                href="/auth/login"
                className="text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline underline-offset-4 inline-block min-h-[44px] leading-[44px]"
              >
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage

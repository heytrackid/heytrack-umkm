'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getAuthErrorMessage, validateEmail } from '@/lib/auth-errors'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, useState, useTransition } from 'react'
import { login } from './actions'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errorAction, setErrorAction] = useState<{ label: string; href: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void setError('')
    void setErrorAction(null)
    void setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Client-side validation
    const errors: { email?: string; password?: string } = {}

    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error
    }

    if (!password) {
      errors.password = 'Password wajib diisi'
    }

    if (Object.keys(errors).length > 0) {
      void setFieldErrors(errors)
      return
    }

    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) {
        const authError = getAuthErrorMessage(result.error)
        void setError(authError)
        // For now, no specific action - could be extended later
        void setErrorAction(null)
      }
    })
  }

  const clearFieldError = (field: 'email' | 'password') => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    void setError('')
    void setErrorAction(null)
  }

  return (
    <div className="min-h-screen mobile-min-vh flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 md:p-8 relative">
      {/* Theme Toggle */}
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
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Masuk ke akun Anda</p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Selamat Datang Kembali</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Masukkan kredensial Anda untuk melanjutkan
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
                    onChange={() => clearFieldError('email')}
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 underline underline-offset-2 min-h-[44px] flex items-center"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    className={`pl-10 pr-12 h-11 text-base transition-all duration-200 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                    disabled={isPending}
                    onChange={() => clearFieldError('password')}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 w-11 px-0 hover:bg-transparent flex items-center justify-center touch-manipulation"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isPending}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="text-sm text-red-600 dark:text-red-400 animate-fade-in" role="alert">
                    {fieldErrors.password}
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
                    <span className="animate-pulse">Masuk...</span>
                  </span>
                ) : (
                  'Masuk'
                )}
              </Button>
            </form>

            <div className="text-center text-sm sm:text-base">
              <span className="text-muted-foreground">Belum punya akun? </span>
              <Link
                href="/auth/register"
                className="text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-300 font-medium underline underline-offset-4 inline-block min-h-[44px] leading-[44px]"
              >
                Daftar sekarang
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage

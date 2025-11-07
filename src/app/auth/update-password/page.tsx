'use client'

import { Check, CheckCircle, Eye, EyeOff, Loader2, Lock, X } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, useState, useTransition } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { getAuthErrorMessage, validatePassword, } from '@/lib/auth-errors'

import { updatePassword } from './actions'

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string
    confirmPassword?: string
  }>({})
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) { strength++ }
    if (pwd.length >= 12) { strength++ }
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) { strength++ }
    if (/\d/.test(pwd)) { strength++ }
    if (/[^a-zA-Z\d]/.test(pwd)) { strength++ }
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-gray-500']
  const strengthLabels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat']

  const passwordRequirements = [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Huruf besar & kecil', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Mengandung angka', met: /\d/.test(password) },
  ]

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const pwd = formData.get('password') as string
    const confirmPwd = formData.get('confirmPassword') as string

    // Client-side validation
    const errors: { password?: string; confirmPassword?: string } = {}

    const passwordValidation = validatePassword(pwd)
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error ?? ''
    }

    if (pwd !== confirmPwd) {
      errors.confirmPassword = 'Password konfirmasi tidak cocok'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result?.error) {
        const authError = getAuthErrorMessage(result.error)
        setError(authError)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }

  const clearFieldError = (field: 'confirmPassword' | 'password') => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
    setError('')
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
                  Password Berhasil Diubah!
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4">
                  Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.
                </p>
                <Link href="/auth/login">
                  <Button className="mt-4 h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation">
                    Lanjut ke Login
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
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Buat password baru</p>
        </div>

        <Card className="shadow-xl border-slate-200 dark:border-slate-800">
          <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Reset Password</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Masukkan password baru Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            {error && (
              <Alert variant="destructive" className="animate-slide-in-top animate-shake">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearFieldError('password')
                    }}
                    className={`pl-10 pr-12 h-11 text-base transition-all duration-200 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                    disabled={isPending}
                    aria-invalid={Boolean(fieldErrors.password)}
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
                  <p id="password-error" className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in" role="alert">
                    {fieldErrors.password}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={`bar-${i}`}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 transition-opacity duration-200">
                      Kekuatan: {strengthLabels[passwordStrength - 1] ?? 'Sangat Lemah'}
                    </p>
                  </div>
                )}

                {/* Password Requirements */}
                {password && (
                  <div className="space-y-1 mt-2 animate-fade-in">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Persyaratan Password:
                    </p>
                    {passwordRequirements.map((req) => (
                      <div key={req.label} className="flex items-center gap-2 text-xs transition-all duration-200">
                        {req.met ? (
                          <Check className="h-3 w-3 text-gray-600 dark:text-gray-400 transition-all duration-200" />
                        ) : (
                          <X className="h-3 w-3 text-slate-400 transition-all duration-200" />
                        )}
                        <span className={`transition-colors duration-200 ${req.met ? 'text-gray-600 dark:text-gray-400' : 'text-slate-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Konfirmasi Password Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      clearFieldError('confirmPassword')
                    }}
                    className={`pl-10 pr-12 h-11 text-base transition-all duration-200 ${fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                    disabled={isPending}
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={fieldErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 w-11 px-0 hover:bg-transparent flex items-center justify-center touch-manipulation"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isPending}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-red-600 dark:text-red-400 animate-fade-in"
                    role="alert"
                  >
                    {fieldErrors.confirmPassword}
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
                    <span className="animate-pulse">Memperbarui...</span>
                  </span>
                ) : (
                  'Perbarui Password'
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

export default UpdatePasswordPage

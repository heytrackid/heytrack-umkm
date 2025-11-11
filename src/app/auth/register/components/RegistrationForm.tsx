'use client'

import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { type FormEvent, useEffect } from 'react'

import { useRegistration } from '@/app/auth/register/hooks/useRegistration'
import { TurnstileWidget } from '@/components/security/TurnstileWidget'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTurnstile } from '@/hooks/useTurnstile'

import { PasswordRequirements } from '@/app/auth/register/components/PasswordRequirements'
import { PasswordStrengthIndicator } from '@/app/auth/register/components/PasswordStrengthIndicator'



interface RegistrationFormProps {
  password: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  onPasswordChange: (password: string) => void
  onConfirmPasswordChange: (confirmPassword: string) => void
  onTogglePasswordVisibility: () => void
  onToggleConfirmPasswordVisibility: () => void
  onSuccess?: () => void
}

export const RegistrationForm = ({
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onSuccess
}: RegistrationFormProps): JSX.Element => {
  const {
    error,
    errorAction,
    fieldErrors,
    success,
    isPending,
    clearFieldError,
    handleSubmit
  } = useRegistration()

  // Turnstile integration
  const {
    isVerified,
    isVerifying,
    error: turnstileError,
    handleVerify,
    verifyToken,
    reset: resetTurnstile,
  } = useTurnstile()

  // Notify parent of success
  useEffect(() => {
    if (success && onSuccess) {
      onSuccess()
    }
  }, [success, onSuccess])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Verify Turnstile first
    const verified = await verifyToken()
    if (!verified) {
      return
    }

    const formData = new FormData(e.currentTarget)

    const result = await handleSubmit(formData)
    
    // Reset Turnstile if registration failed
    if (!result) {
      resetTurnstile()
    }
  }

  return (
    <Card className="border">
      <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl text-center">Bergabung Sekarang</CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Mulai kelola bisnis UMKM kuliner Anda
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

        <form onSubmit={onSubmit} className="space-y-4">
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
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              />
            </div>
            {fieldErrors.email && (
               <p id="email-error" className="text-sm text-destructive animate-fade-in" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onPasswordChange(e.target.value)
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
                onClick={onTogglePasswordVisibility}
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
               <p id="password-error" className="text-sm text-destructive animate-fade-in" role="alert">
                {fieldErrors.password}
              </p>
            )}

            <PasswordStrengthIndicator password={password} />
            <PasswordRequirements password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Konfirmasi Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  onConfirmPasswordChange(e.target.value)
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
                onClick={onToggleConfirmPasswordVisibility}
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
                 className="text-sm text-destructive animate-fade-in"
                role="alert"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Turnstile CAPTCHA */}
          <TurnstileWidget
            onVerify={handleVerify}
            onExpire={resetTurnstile}
            className="flex justify-center"
            theme="auto"
            size="normal"
          />

          {turnstileError && (
            <p className="text-sm text-destructive text-center animate-fade-in">
              {turnstileError}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
            disabled={isPending || isVerifying || !isVerified}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="animate-pulse">Mendaftarkan...</span>
              </span>
            ) : isVerifying ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </span>
            ) : (
              'Daftar'
            )}
          </Button>

          {isVerified && !isPending && (
            <div className="text-sm text-green-600 dark:text-green-400 text-center animate-fade-in">
              ✓ Verifikasi keamanan berhasil
            </div>
          )}
        </form>

        <div className="text-center text-sm sm:text-base">
          <span className="text-muted-foreground">Sudah punya akun? </span>
          <Link
            href="/auth/login"
            className="text-foreground hover:text-muted-foreground font-medium underline underline-offset-4 inline-block min-h-[44px] leading-[44px]"
          >
            Masuk sekarang
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

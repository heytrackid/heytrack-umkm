'use client'

import { useState } from 'react'

import { ThemeToggle } from '@/components/ui/theme-toggle'
import { RegistrationForm, RegistrationSuccess } from '@/app/auth/register/components/index'

export const RegisterPageClient = (): JSX.Element => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSuccess = (): void => {
    setSuccess(true)
  }

  if (success) {
    return <RegistrationSuccess />
  }

  return (
    <div className="min-h-screen mobile-min-vh flex items-center justify-center bg-background p-4 sm:p-6 md:p-8 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-foreground rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-base sm:text-lg">H</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">HeyTrack</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Buat akun baru Anda</p>
        </div>

        <RegistrationForm
          password={password}
          confirmPassword={confirmPassword}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onTogglePasswordVisibility={() => setShowPassword(!showPassword)}
          onToggleConfirmPasswordVisibility={() => setShowConfirmPassword(!showConfirmPassword)}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}

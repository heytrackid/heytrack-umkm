'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { RegistrationSuccess, RegistrationForm } from './components'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const RegisterPage = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSuccess = () => {
    void setSuccess(true)
  }

  if (success) {
    return <RegistrationSuccess />
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
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Buat akun baru Anda</p>
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

export default RegisterPage

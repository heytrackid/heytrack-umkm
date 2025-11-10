'use client'

import { usePasswordValidation } from '@/app/auth/register/hooks/usePasswordValidation'

interface PasswordStrengthIndicatorProps {
  password: string
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps): JSX.Element | null => {
  const { passwordStrength, strengthColors, currentStrengthLabel } = usePasswordValidation(password)

  if (!password) { return null }

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-slate-200 dark:bg-slate-700'
              }`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 transition-opacity duration-200">
        Kekuatan: {currentStrengthLabel}
      </p>
    </div>
  )
}

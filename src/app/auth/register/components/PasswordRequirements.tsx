import { Check, X } from 'lucide-react'
import { usePasswordValidation } from '@/app/auth/register/hooks/usePasswordValidation'

interface PasswordRequirementsProps {
  password: string
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const { passwordRequirements } = usePasswordValidation(password)

  if (!password) { return null }

  return (
    <div className="space-y-1 animate-fade-in">
      {passwordRequirements.map((req, i) => (
        <div key={i} className="flex items-center gap-2 text-xs transition-all duration-200">
          {req.met ? (
            <Check className="h-3 w-3 text-green-600 dark:text-green-400 transition-all duration-200" />
          ) : (
            <X className="h-3 w-3 text-slate-400 transition-all duration-200" />
          )}
          <span className={`transition-colors duration-200 ${req.met ? 'text-green-600 dark:text-green-400' : 'text-slate-500'
            }`}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}

import { useMemo } from 'react'

export function usePasswordValidation(password: string) {
  const passwordStrength = useMemo(() => {
    let strength = 0
    if (password.length >= 8) {strength++}
    if (password.length >= 12) {strength++}
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {strength++}
    if (/\d/.test(password)) {strength++}
    if (/[^a-zA-Z\d]/.test(password)) {strength++}
    return strength
  }, [password])

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat']

  const passwordRequirements = useMemo(() => [
    { label: 'Minimal 8 karakter', met: password.length >= 8 },
    { label: 'Huruf besar & kecil', met: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Mengandung angka', met: /\d/.test(password) },
  ], [password])

  return {
    passwordStrength,
    strengthColors,
    strengthLabels,
    passwordRequirements,
    currentStrengthColor: strengthColors[passwordStrength - 1] || 'bg-red-500',
    currentStrengthLabel: strengthLabels[passwordStrength - 1] || 'Sangat Lemah'
  }
}

# Authentication Error Handling

This document describes the comprehensive error handling system for authentication in the application.

## Overview

The authentication error handling system provides:
- Centralized error message mapping
- Indonesian translations for all error messages
- Inline validation errors for form fields
- Actionable error messages with links
- Client-side validation
- Consistent error display across all auth pages

## Files

### `src/lib/auth-errors.ts`

Central error handling utility that provides:

1. **Error Message Mapping**: Maps Supabase error codes to user-friendly Indonesian messages
2. **Validation Functions**: Client-side validation for email, password, and password match
3. **Success Messages**: Standardized success messages for auth actions

## Usage

### In Auth Pages

```typescript
import { getAuthErrorMessage, validateEmail, validatePassword } from '@/lib/auth-errors'

// Get user-friendly error message
const authError = getAuthErrorMessage(error.message)
setError(authError.message)

// Show actionable link if available
if (authError.action) {
  setErrorAction(authError.action)
}

// Validate email
const emailError = validateEmail(email)
if (emailError) {
  setFieldErrors({ email: emailError })
}

// Validate password
const passwordError = validatePassword(password)
if (passwordError) {
  setFieldErrors({ password: passwordError })
}

// Validate password match
const matchError = validatePasswordMatch(password, confirmPassword)
if (matchError) {
  setFieldErrors({ confirmPassword: matchError })
}
```

## Error Types

### Login Errors
- Invalid login credentials → "Email atau password salah" (with link to reset password)
- Email not confirmed → "Silakan konfirmasi email Anda terlebih dahulu"
- Invalid email → "Format email tidak valid"

### Registration Errors
- User already registered → "Email sudah terdaftar" (with link to login)
- Password too short → "Password minimal 8 karakter"
- Invalid email → "Format email tidak valid"

### Password Reset Errors
- User not found → "Email tidak terdaftar" (with link to register)
- Rate limit exceeded → "Silakan tunggu 60 detik sebelum mencoba lagi"

### Session Errors
- Invalid/expired token → "Sesi Anda telah berakhir. Silakan login kembali" (with link to login)

### Network Errors
- Network request failed → "Koneksi internet bermasalah. Silakan coba lagi"

## Validation Rules

### Email Validation
- Required field
- Must match email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)

### Password Validation
- Required field
- Minimum 8 characters
- Recommended: uppercase, lowercase, and numbers

### Password Match Validation
- Confirm password must match password field

## Error Display

### Alert Banner
Displays at the top of the form with:
- Error message in Indonesian
- Optional actionable link (e.g., "Lupa password?", "Login sekarang")

```tsx
{error && (
  <Alert variant="destructive">
    <AlertDescription className="text-sm">
      {error}
      {errorAction && (
        <>
          {' '}
          <Link href={errorAction.href} className="font-medium underline">
            {errorAction.label}
          </Link>
        </>
      )}
    </AlertDescription>
  </Alert>
)}
```

### Inline Field Errors
Displays below each input field with:
- Red border on input
- Error message in red text
- ARIA attributes for accessibility

```tsx
<Input
  className={fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
  aria-invalid={!!fieldErrors.email}
  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
/>
{fieldErrors.email && (
  <p id="email-error" className="text-sm text-red-600" role="alert">
    {fieldErrors.email}
  </p>
)}
```

## Error Clearing

Errors are automatically cleared when:
- User starts typing in a field (clears that field's error)
- User submits the form again (clears all errors)

```typescript
const clearFieldError = (field: 'email' | 'password') => {
  setFieldErrors((prev) => {
    const newErrors = { ...prev }
    delete newErrors[field]
    return newErrors
  })
  setError('')
  setErrorAction(null)
}
```

## Accessibility

All error handling includes proper accessibility features:
- `aria-invalid` attribute on inputs with errors
- `aria-describedby` linking inputs to error messages
- `role="alert"` on error messages for screen reader announcements
- `aria-label` on password toggle buttons

## Future Enhancements

Potential improvements:
1. Toast notifications for success messages (using existing toast system)
2. Error logging/tracking for debugging
3. Rate limiting feedback
4. Password strength meter improvements
5. Multi-language support beyond Indonesian

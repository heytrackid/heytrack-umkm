/**
 * Centralized authentication error handling
 * Maps Supabase auth errors to user-friendly Indonesian messages
 */

export interface AuthError {
    message: string
    action?: {
        label: string
        href: string
    }
}

/**
 * Common Supabase authentication error codes and their Indonesian translations
 */
export const AUTH_ERROR_MESSAGES: Record<string, AuthError> = {
    // Login errors
    'Invalid login credentials': {
        message: 'Email atau password salah',
        action: {
            label: 'Lupa password?',
            href: '/auth/reset-password',
        },
    },
    'Email not confirmed': {
        message: 'Silakan konfirmasi email Anda terlebih dahulu',
        action: {
            label: 'Kirim ulang email konfirmasi',
            href: '/auth/resend-confirmation',
        },
    },
    'Invalid email': {
        message: 'Format email tidak valid',
    },
    'Email rate limit exceeded': {
        message: 'Terlalu banyak percobaan. Silakan coba lagi nanti',
    },

    // Registration errors
    'User already registered': {
        message: 'Email sudah terdaftar',
        action: {
            label: 'Login sekarang',
            href: '/auth/login',
        },
    },
    'Password should be at least 6 characters': {
        message: 'Password minimal 6 karakter',
    },
    'Password should be at least 8 characters': {
        message: 'Password minimal 8 karakter',
    },
    'Signup requires a valid password': {
        message: 'Password tidak valid',
    },
    'Unable to validate email address': {
        message: 'Format email tidak valid',
    },

    // Password reset errors
    'User not found': {
        message: 'Email tidak terdaftar',
        action: {
            label: 'Daftar sekarang',
            href: '/auth/register',
        },
    },
    'For security purposes, you can only request this once every 60 seconds': {
        message: 'Silakan tunggu 60 detik sebelum mencoba lagi',
    },

    // Session errors
    'Invalid Refresh Token': {
        message: 'Sesi Anda telah berakhir. Silakan login kembali',
        action: {
            label: 'Login',
            href: '/auth/login',
        },
    },
    'Refresh Token Not Found': {
        message: 'Sesi Anda telah berakhir. Silakan login kembali',
        action: {
            label: 'Login',
            href: '/auth/login',
        },
    },

    // OAuth errors
    'OAuth error': {
        message: 'Terjadi kesalahan saat login dengan Google',
    },

    // Generic errors
    'Network request failed': {
        message: 'Koneksi internet bermasalah. Silakan coba lagi',
    },
    'Failed to fetch': {
        message: 'Koneksi internet bermasalah. Silakan coba lagi',
    },
}

/**
 * Get user-friendly error message from Supabase error
 */
export function getAuthErrorMessage(error: string): AuthError {
    // Check for exact match
    if (AUTH_ERROR_MESSAGES[error]) {
        return AUTH_ERROR_MESSAGES[error]
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
        if (error.includes(key)) {
            return value
        }
    }

    // Default error message
    return {
        message: error || 'Terjadi kesalahan. Silakan coba lagi',
    }
}

/**
 * Validation error messages for form fields
 */
export const VALIDATION_ERRORS = {
    email: {
        required: 'Email wajib diisi',
        invalid: 'Format email tidak valid',
    },
    password: {
        required: 'Password wajib diisi',
        minLength: 'Password minimal 8 karakter',
        weak: 'Password terlalu lemah',
        mismatch: 'Password tidak cocok',
    },
    confirmPassword: {
        required: 'Konfirmasi password wajib diisi',
        mismatch: 'Password tidak cocok',
    },
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
    if (!email) {
        return VALIDATION_ERRORS.email.required
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return VALIDATION_ERRORS.email.invalid
    }

    return null
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): string | null {
    if (!password) {
        return VALIDATION_ERRORS.password.required
    }

    if (password.length < 8) {
        return VALIDATION_ERRORS.password.minLength
    }

    return null
}

/**
 * Validate password match
 */
export function validatePasswordMatch(
    password: string,
    confirmPassword: string
): string | null {
    if (!confirmPassword) {
        return VALIDATION_ERRORS.confirmPassword.required
    }

    if (password !== confirmPassword) {
        return VALIDATION_ERRORS.confirmPassword.mismatch
    }

    return null
}

/**
 * Success messages for auth actions
 */
export const AUTH_SUCCESS_MESSAGES = {
    login: {
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
    },
    register: {
        title: 'Pendaftaran Berhasil',
        description: 'Silakan check email Anda untuk konfirmasi akun',
    },
    resetPassword: {
        title: 'Email Terkirim',
        description: 'Silakan check email Anda untuk link reset password',
    },
    updatePassword: {
        title: 'Password Berhasil Diubah',
        description: 'Silakan login dengan password baru Anda',
    },
    logout: {
        title: 'Logout Berhasil',
        description: 'Sampai jumpa lagi!',
    },
}

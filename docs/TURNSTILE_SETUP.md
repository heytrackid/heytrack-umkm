# Cloudflare Turnstile Setup Guide

Panduan lengkap untuk mengintegrasikan Cloudflare Turnstile (CAPTCHA) ke dalam HeyTrack.

## Apa itu Turnstile?

Cloudflare Turnstile adalah alternatif CAPTCHA yang lebih user-friendly dari Google reCAPTCHA. Keunggulannya:
- **Privacy-first**: Tidak tracking user
- **User-friendly**: Lebih sedikit challenge yang mengganggu
- **Free**: Gratis untuk unlimited requests
- **Fast**: Lebih cepat dari reCAPTCHA
- **No vendor lock-in**: Open source client

## Setup Cloudflare Turnstile

### 1. Dapatkan API Keys

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih account Anda
3. Navigasi ke **Turnstile** di sidebar
4. Klik **Add Site**
5. Isi form:
   - **Site name**: HeyTrack Production (atau sesuai environment)
   - **Domain**: `app.heytrack.id` (atau domain Anda)
   - **Widget Mode**: Managed (recommended)
6. Klik **Create**
7. Copy **Site Key** dan **Secret Key**

### 2. Konfigurasi Environment Variables

Tambahkan ke file `.env.local`:

```bash
# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key-here
TURNSTILE_SECRET_KEY=your-secret-key-here
```

**Penting**: 
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` akan di-expose ke client (aman)
- `TURNSTILE_SECRET_KEY` hanya untuk server-side (jangan expose!)

### 3. Testing Mode (Development)

Untuk development/testing, gunakan test keys dari Cloudflare:

```bash
# Test keys (always pass)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Test keys (always fail)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=2x00000000000000000000AB
TURNSTILE_SECRET_KEY=2x0000000000000000000000000000000AA

# Test keys (force interactive challenge)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=3x00000000000000000000FF
TURNSTILE_SECRET_KEY=3x0000000000000000000000000000000AA
```

## Penggunaan

### Basic Usage

```tsx
'use client'

import { TurnstileWidget } from '@/components/security/TurnstileWidget'
import { useTurnstile } from '@/hooks/useTurnstile'

export function MyForm() {
  const { handleVerify, verifyToken, isVerified } = useTurnstile()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Verify Turnstile before submitting
    const verified = await verifyToken()
    if (!verified) {
      alert('Please complete security check')
      return
    }

    // Continue with form submission
    // ...
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      
      <TurnstileWidget onVerify={handleVerify} />
      
      <button type="submit" disabled={!isVerified}>
        Submit
      </button>
    </form>
  )
}
```

### Advanced Usage dengan Error Handling

```tsx
'use client'

import { TurnstileWidget } from '@/components/security/TurnstileWidget'
import { useTurnstile } from '@/hooks/useTurnstile'
import { useState } from 'react'

export function SecureForm() {
  const [error, setError] = useState<string | null>(null)

  const {
    handleVerify,
    verifyToken,
    isVerified,
    isVerifying,
    error: turnstileError,
    reset,
  } = useTurnstile({
    onSuccess: () => {
      console.log('Verification successful')
      setError(null)
    },
    onError: (err) => {
      console.error('Verification failed:', err)
      setError(err)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const verified = await verifyToken()
    if (!verified) {
      setError('Security verification failed')
      return
    }

    try {
      // Your API call
      const response = await fetch('/api/your-endpoint', {
        method: 'POST',
        // ...
      })

      if (!response.ok) throw new Error('Request failed')

      // Success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      reset() // Reset Turnstile for retry
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}

      <TurnstileWidget
        onVerify={handleVerify}
        onError={() => setError('CAPTCHA failed')}
        onExpire={reset}
        theme="auto"
        size="normal"
      />

      {(error || turnstileError) && (
        <div className="text-destructive">{error || turnstileError}</div>
      )}

      <button type="submit" disabled={isVerifying || !isVerified}>
        {isVerifying ? 'Verifying...' : 'Submit'}
      </button>
    </form>
  )
}
```

### Server-Side Verification (API Route)

```ts
// app/api/your-endpoint/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { turnstileToken, ...otherData } = body

    // Verify Turnstile token
    const verifyResponse = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken }),
    })

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      return NextResponse.json(
        { error: 'Security verification failed' },
        { status: 403 }
      )
    }

    // Continue with your logic
    // ...

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Customization

### Theme Options

```tsx
<TurnstileWidget
  theme="light"  // 'light' | 'dark' | 'auto'
  size="compact" // 'normal' | 'compact'
  onVerify={handleVerify}
/>
```

### Custom Styling

```tsx
<TurnstileWidget
  className="my-4 flex justify-center"
  onVerify={handleVerify}
/>
```

## Use Cases

### 1. Login/Register Forms
Lindungi form authentication dari brute force attacks.

### 2. Contact Forms
Cegah spam submissions.

### 3. API Rate Limiting
Tambahkan layer proteksi untuk public APIs.

### 4. Password Reset
Verifikasi user sebelum mengirim reset link.

### 5. Order Submissions
Cegah automated bot orders.

## Best Practices

1. **Always verify server-side**: Jangan hanya verify di client
2. **Handle errors gracefully**: Berikan feedback yang jelas ke user
3. **Reset on failure**: Reset widget jika submission gagal
4. **Test with test keys**: Gunakan test keys untuk development
5. **Monitor analytics**: Check Cloudflare dashboard untuk metrics

## Troubleshooting

### Widget tidak muncul
- Pastikan `NEXT_PUBLIC_TURNSTILE_SITE_KEY` sudah di-set
- Check browser console untuk errors
- Pastikan domain sudah terdaftar di Cloudflare

### Verification selalu gagal
- Pastikan `TURNSTILE_SECRET_KEY` benar
- Check API logs untuk error details
- Pastikan tidak ada CORS issues

### Token expired
- Implement `onExpire` handler untuk reset widget
- Token valid selama 5 menit

## Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)
- [Test Keys](https://developers.cloudflare.com/turnstile/reference/testing/)

## Migration dari hCaptcha

Jika sebelumnya menggunakan hCaptcha:

1. Replace `<HCaptcha>` dengan `<TurnstileWidget>`
2. Update environment variables
3. Update verification endpoint
4. Test thoroughly

Turnstile lebih user-friendly dan tidak memerlukan user interaction dalam kebanyakan kasus.

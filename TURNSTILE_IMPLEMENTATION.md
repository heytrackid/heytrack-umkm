# Cloudflare Turnstile Integration

This document explains how Cloudflare Turnstile is implemented in the HeyTrack application for bot protection during login.

## Overview

Cloudflare Turnstile is implemented on the login page to prevent automated bot attacks. It provides a frictionless way to distinguish between human users and bots without traditional CAPTCHA challenges.

## Configuration

The implementation requires the following environment variables:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: The public site key for the Turnstile widget
- `TURNSTILE_SECRET_KEY`: The secret key used for server-side validation

These should be added to your `.env.local` file:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_public_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

## How It Works

### Client-Side

1. The Turnstile widget is rendered on the login page using `src/components/TurnstileWidget.tsx`
2. When the user interacts with the widget, a verification token is generated
3. The token is included in the login form submission
4. If no token is provided, the login attempt is blocked

### Server-Side

1. The login action in `src/app/auth/login/actions.ts` extracts the Turnstile token from the form data
2. The token is verified against Cloudflare's API using the secret key via `src/utils/turnstile.ts`
3. Client IP is included in the verification request for enhanced security
4. If verification fails, the login attempt is rejected
5. Only after successful verification does the system proceed with Supabase authentication

## Files Modified

- `src/components/TurnstileWidget.tsx` - Client-side widget component
- `src/app/auth/login/page.tsx` - Login page with Turnstile integration
- `src/app/auth/login/actions.ts` - Server-side validation logic
- `src/utils/turnstile.ts` - Turnstile verification utility
- `.env.local` - Environment variables

## Testing

To test the integration:

1. Ensure your environment variables are properly set with valid Cloudflare Turnstile keys
2. Visit the login page at `/auth/login`
3. Verify the Turnstile widget appears and functions correctly
4. Try submitting the form without completing the Turnstile challenge - it should fail
5. Complete the Turnstile challenge and submit - it should proceed to authentication

## Troubleshooting

- If the widget doesn't appear, check that `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set correctly
- If verification always fails, verify that `TURNSTILE_SECRET_KEY` matches your Cloudflare account
- Check browser console for any JavaScript errors related to the Turnstile widget
- Check server logs for any verification API errors

## Security Notes

- The secret key (TURNSTILE_SECRET_KEY) must never be exposed in client-side code
- The verification happens server-side to prevent bypassing the check
- The widget supports dark/light theme matching the application's theme
- Client IP is included in verification requests for enhanced security
- Additional custom data and action parameters can be passed for analytics
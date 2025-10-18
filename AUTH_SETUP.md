# Supabase OTP Authentication Setup

This application uses **Email OTP (One-Time Password)** authentication with Supabase.

## 🚀 How It Works

1. **User enters email** on login page
2. **Supabase sends OTP** to user's email
3. **User enters 6-digit code** on verify page
4. **User gets authenticated** and redirected to dashboard

## 📋 Setup Instructions

### 1. Environment Variables
Add these to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Supabase Configuration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Go to **Authentication > Settings**
4. Configure **Email Templates** for OTP
5. Enable **Email OTP** in Authentication settings

### 3. Email Templates
Configure these email templates in Supabase:
- **Confirm signup**: OTP email template
- **Invite user**: OTP email template  
- **Email change**: OTP email template
- **Magic link**: OTP email template

## 🔐 Authentication Flow

### Login Process:
```
1. User visits /login
2. Enters email address
3. Clicks "Send OTP Code"
4. Redirected to /login/verify
5. Enters 6-digit OTP code
6. Gets authenticated and redirected to /dashboard
```

### Protected Routes:
- All routes except `/login*` require authentication
- Unauthenticated users are redirected to `/login`
- Authenticated users can access all features

## 🎯 Features

- ✅ **Passwordless authentication**
- ✅ **Email OTP verification**
- ✅ **Automatic user creation** on first login
- ✅ **Secure session management**
- ✅ **Route protection middleware**

## 🧪 Testing

### Test URLs:
- **Login**: `http://localhost:3000/login`
- **OTP Verify**: `http://localhost:3000/login/verify`
- **Protected Dashboard**: `http://localhost:3000/dashboard`

### Test Flow:
1. Visit login page
2. Enter any email (even non-existent)
3. Check email for OTP code
4. Enter code on verify page
5. Should be redirected to dashboard

## 🔧 Troubleshooting

### Common Issues:

1. **OTP not received**:
   - Check spam folder
   - Verify email address is correct
   - Check Supabase email templates

2. **Invalid OTP error**:
   - OTP codes expire after 1 hour
   - Codes can only be used once
   - Check for typos in code entry

3. **Middleware redirect loop**:
   - Clear browser cookies
   - Check middleware.ts configuration
   - Verify environment variables

### Debug Tips:
- Check browser network tab for API calls
- Check Supabase dashboard for auth events
- Check server logs for middleware errors

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [OTP Authentication Guide](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)

# Supabase Email Template Configuration

This document provides instructions for configuring Supabase email templates to work with the password reset functionality.

## Prerequisites

- Access to your Supabase project dashboard
- Admin/Owner permissions on the project

## Configuration Steps

### 1. Access Email Templates

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Email Templates** in the left sidebar

### 2. Configure "Reset Password" Email Template

1. In the Email Templates section, find **"Reset Password"** template
2. Update the **Confirmation URL** field with:
   ```
   {{ .SiteURL }}/auth/update-password?token_hash={{ .TokenHash }}&type=recovery
   ```

3. (Optional) Customize the email content in Indonesian:
   ```html
   <h2>Reset Password Anda</h2>
   <p>Halo,</p>
   <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
   <p>Klik tombol di bawah ini untuk membuat password baru:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   <p>Link ini akan kadaluarsa dalam 1 jam.</p>
   <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
   <p>Terima kasih,<br>Tim HeyTrack</p>
   ```

4. Click **Save** to apply changes

### 3. Configure "Confirm Signup" Email Template (Optional)

If you want to customize the signup confirmation email:

1. Find **"Confirm Signup"** template
2. Update the **Confirmation URL** field with:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```

3. (Optional) Customize the email content in Indonesian:
   ```html
   <h2>Konfirmasi Email Anda</h2>
   <p>Halo,</p>
   <p>Terima kasih telah mendaftar di HeyTrack!</p>
   <p>Klik tombol di bawah ini untuk mengkonfirmasi email Anda:</p>
   <p><a href="{{ .ConfirmationURL }}">Konfirmasi Email</a></p>
   <p>Jika Anda tidak membuat akun ini, abaikan email ini.</p>
   <p>Terima kasih,<br>Tim HeyTrack</p>
   ```

4. Click **Save** to apply changes

### 4. Verify Site URL Configuration

1. Navigate to **Authentication** → **URL Configuration**
2. Ensure **Site URL** is set correctly:
   - Development: `http://localhost:3000`
   - Production: Your production domain (e.g., `https://yourdomain.com`)
3. Add redirect URLs if needed:
   - `http://localhost:3000/auth/**`
   - `https://yourdomain.com/auth/**`

### 5. Test Email Delivery

#### Test Password Reset Flow:

1. Go to `http://localhost:3000/auth/reset-password`
2. Enter a registered email address
3. Click "Kirim Link Reset"
4. Check your email inbox (and spam folder)
5. Click the reset link in the email
6. Verify you're redirected to `/auth/update-password`
7. Enter a new password and submit
8. Verify you can login with the new password

#### Test Signup Confirmation Flow:

1. Go to `http://localhost:3000/auth/register`
2. Register with a new email
3. Check your email inbox (and spam folder)
4. Click the confirmation link
5. Verify you're redirected to the dashboard

## Troubleshooting

### Email Not Received

1. **Check Spam Folder**: Supabase emails might be filtered as spam
2. **Verify Email Settings**: Go to Authentication → Email Templates and check SMTP settings
3. **Check Rate Limits**: Supabase has rate limits on email sending
4. **Use Custom SMTP** (Production): For production, configure custom SMTP provider:
   - Go to **Project Settings** → **Auth**
   - Enable **Custom SMTP**
   - Configure your SMTP provider (SendGrid, AWS SES, etc.)

### Link Not Working

1. **Verify Site URL**: Ensure Site URL matches your application URL
2. **Check Token Expiry**: Reset links expire after 1 hour
3. **Check URL Format**: Ensure the template uses `token_hash` not `token`
4. **Browser Console**: Check for any JavaScript errors

### Redirect Issues

1. **Verify Redirect URLs**: Add all auth routes to allowed redirect URLs
2. **Check Middleware**: Ensure middleware.ts is properly configured
3. **Environment Variables**: Verify `NEXT_PUBLIC_SITE_URL` is set correctly

## Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## Production Checklist

Before deploying to production:

- [ ] Update Site URL to production domain
- [ ] Configure custom SMTP provider
- [ ] Test email delivery in production
- [ ] Add production domain to redirect URLs
- [ ] Update email templates with production branding
- [ ] Test complete password reset flow
- [ ] Test complete signup confirmation flow
- [ ] Monitor email delivery rates
- [ ] Set up email bounce handling

## Additional Resources

- [Supabase Auth Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Auth Configuration](https://supabase.com/docs/guides/auth/auth-deep-dive/auth-deep-dive-jwts)
- [Custom SMTP Setup](https://supabase.com/docs/guides/auth/auth-smtp)

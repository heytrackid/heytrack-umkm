# Stack Auth Setup Guide

## 🚨 Required: Environment Variables

Stack Auth memerlukan environment variables berikut untuk berfungsi:

```env
# Stack Auth (REQUIRED)
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key

# Supabase (REQUIRED for RLS)
SUPABASE_JWT_SECRET=your_jwt_secret
```

---

## 📝 Step-by-Step Setup

### 1. Create Stack Auth Project

1. Buka [Stack Auth Dashboard](https://app.stack-auth.com)
2. Sign up atau login
3. Klik "Create New Project"
4. Beri nama project (contoh: "HeyTrack UMKM")
5. Pilih region (pilih yang terdekat dengan users)

### 2. Get Project Credentials

Setelah project dibuat, copy credentials:

1. **Project ID**: 
   - Buka project settings
   - Copy "Project ID"
   - Format: `proj_xxxxxxxxxxxxx`

2. **Publishable Client Key**:
   - Masih di settings
   - Copy "Publishable Client Key"
   - Format: `pk_xxxxxxxxxxxxx`

### 3. Configure Environment Variables

#### Development (.env.local)

Buat atau edit file `.env.local`:

```env
# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=proj_your_actual_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_your_actual_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# App Domain
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
```

#### Production (Vercel/Deployment)

Tambahkan environment variables di dashboard deployment:

1. **Vercel:**
   - Settings → Environment Variables
   - Add each variable
   - Redeploy

2. **Other Platforms:**
   - Sesuaikan dengan platform masing-masing
   - Pastikan semua variables tersedia

### 4. Get Supabase JWT Secret

JWT Secret diperlukan untuk integrasi Supabase RLS:

```bash
# Method 1: Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Settings → API
3. Copy "JWT Secret"

# Method 2: Via Supabase CLI
supabase status | grep "JWT secret"
```

### 5. Configure Stack Auth Project

Di Stack Auth Dashboard:

1. **Allowed Domains:**
   - Development: `http://localhost:3000`
   - Production: `https://app.heytrack.id`

2. **Redirect URLs:**
   - Sign In: `/handler/sign-in`
   - After Sign In: `/dashboard`
   - After Sign Out: `/handler/sign-in`

3. **Authentication Methods:**
   - Enable Email/Password
   - Optional: Enable OAuth (Google, GitHub, etc.)

### 6. Test Configuration

```bash
# 1. Install dependencies
pnpm install

# 2. Check environment variables
pnpm run env:check  # (if script exists)

# 3. Start dev server
pnpm dev

# 4. Open browser
# Navigate to: http://localhost:3000
# Should redirect to: http://localhost:3000/handler/sign-in
```

---

## ✅ Verification Checklist

- [ ] Stack Auth project created
- [ ] Project ID copied to `.env.local`
- [ ] Publishable key copied to `.env.local`
- [ ] Supabase JWT secret added to `.env.local`
- [ ] All Supabase credentials configured
- [ ] Allowed domains configured in Stack Auth
- [ ] Dev server starts without errors
- [ ] Login page loads at `/handler/sign-in`
- [ ] Can create test account
- [ ] Can login successfully
- [ ] Redirects to dashboard after login
- [ ] Protected routes require authentication

---

## 🐛 Troubleshooting

### Error: "Missing NEXT_PUBLIC_STACK_PROJECT_ID"

**Cause:** Environment variable tidak diset

**Solution:**
1. Check `.env.local` exists
2. Verify variable name exact: `NEXT_PUBLIC_STACK_PROJECT_ID`
3. Restart dev server after adding env vars
4. Clear Next.js cache: `rm -rf .next`

### Error: "Invalid project ID"

**Cause:** Project ID salah atau tidak valid

**Solution:**
1. Verify project ID di Stack Auth dashboard
2. Pastikan format: `proj_xxxxxxxxxxxxx`
3. Copy-paste langsung (jangan ketik manual)

### Error: "Unauthorized" di API routes

**Cause:** JWT secret tidak match atau tidak diset

**Solution:**
1. Verify `SUPABASE_JWT_SECRET` di `.env.local`
2. Pastikan sama dengan Supabase project
3. Restart dev server

### Login page tidak muncul

**Cause:** Routing atau middleware issue

**Solution:**
1. Check `src/app/handler/[...stack]/page.tsx` exists
2. Verify middleware tidak block `/handler/*`
3. Check browser console for errors

---

## 📚 Additional Resources

- [Stack Auth Documentation](https://docs.stack-auth.com/)
- [Stack Auth Dashboard](https://app.stack-auth.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🔐 Security Notes

### DO NOT:
- ❌ Commit `.env.local` to git
- ❌ Share JWT secrets publicly
- ❌ Use production credentials in development
- ❌ Expose service role keys in client code

### DO:
- ✅ Use `.env.example` as template
- ✅ Keep credentials in secure password manager
- ✅ Use different credentials for dev/staging/prod
- ✅ Rotate secrets regularly
- ✅ Use environment-specific variables

---

## 📞 Support

Jika masih ada masalah:

1. Check [Stack Auth Discord](https://discord.gg/stack-auth)
2. Check [GitHub Issues](https://github.com/stack-auth/stack)
3. Contact team via email

---

## ✨ Quick Start Commands

```bash
# 1. Clone & Install
git clone <repo>
cd heytrack-umkm
pnpm install

# 2. Setup Environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Start Development
pnpm dev

# 4. Open Browser
# http://localhost:3000
```

**Status: Ready to Go!** 🚀

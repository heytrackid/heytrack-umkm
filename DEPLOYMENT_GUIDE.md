# 🚀 HeyTrack Deployment Guide

## Pre-Deployment Checklist

### 1. Database Setup (Supabase)

#### Enable Security Features
```bash
# Login to Supabase Dashboard
# Navigate to: Authentication > Policies

✅ Enable "Leaked Password Protection"
   - Protects against compromised passwords
   - Uses HaveIBeenPwned database
   
✅ Review RLS Policies
   - All tables have RLS enabled
   - User isolation enforced at database level
```

#### Optimize Database
```sql
-- Run these optimizations in Supabase SQL Editor

-- 1. Optimize RLS policies (wrap auth.uid() for better performance)
-- Example for ingredients table:
CREATE POLICY "Users can view own ingredients optimized"
ON ingredients FOR SELECT
USING (user_id = (SELECT auth.uid()));

-- 2. Add missing indexes for foreign keys (if needed)
-- Check with: SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- 3. Move extensions from public schema (optional)
-- ALTER EXTENSION pg_trgm SET SCHEMA extensions;
-- ALTER EXTENSION pg_net SET SCHEMA extensions;
```

### 2. Environment Variables

Create `.env.production` file:

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# AI Services (Choose one)
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
# OR
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Optional: Cron Job Security
CRON_SECRET=your-random-secret-for-cron-endpoints
```

### 3. Vercel Deployment

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
```

#### Option B: Deploy via GitHub

```bash
# 1. Push to GitHub
git add .
git commit -m "Production ready deployment"
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import your GitHub repository
# - Add environment variables in Vercel dashboard
# - Deploy!
```

### 4. Post-Deployment Setup

#### A. Setup Monitoring

**Sentry (Error Tracking)**
```bash
# Install Sentry
pnpm add @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Add to .env.production
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

**Vercel Analytics** (Already included)
```typescript
// Already configured in src/app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
```

#### B. Setup Database Backups

```bash
# Supabase Dashboard > Settings > Backups
# Enable automatic daily backups
# Configure backup retention period
```

#### C. Setup Cron Jobs (Optional)

For automated HPP snapshots and alerts:

```bash
# Vercel Cron Jobs (vercel.json already configured)
# Or use Supabase Edge Functions with pg_cron

# Test cron endpoints:
curl -X POST https://your-domain.com/api/hpp/snapshots \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 5. Testing in Production

#### Critical User Flows to Test

```bash
# 1. Authentication
✅ Register new user
✅ Login with email/password
✅ Reset password
✅ Logout

# 2. Ingredients
✅ Add new ingredient
✅ Update ingredient stock
✅ Record purchase
✅ View WAC calculation

# 3. Recipes
✅ Create recipe with ingredients
✅ View HPP calculation
✅ Update recipe pricing
✅ Generate AI recipe (if enabled)

# 4. Orders
✅ Create new order
✅ Add order items
✅ Update order status
✅ Complete order
✅ View order history

# 5. Reports
✅ View cash flow report
✅ View profit analysis
✅ Export to Excel
✅ View HPP trends
```

### 6. Performance Optimization

#### Enable Caching
```typescript
// Already configured in next.config.ts
// Verify cache headers in production
```

#### Monitor Performance
```bash
# Use Vercel Analytics to monitor:
- Page load times
- Core Web Vitals
- API response times
- Error rates
```

### 7. Security Checklist

```bash
✅ HTTPS enabled (automatic with Vercel)
✅ Environment variables secured
✅ RLS policies active on all tables
✅ API routes protected with authentication
✅ CORS configured properly
✅ Rate limiting on sensitive endpoints
✅ SQL injection prevention (using Supabase client)
✅ XSS prevention (React default)
```

## 🔧 Troubleshooting

### Build Fails
```bash
# Check build logs
vercel logs

# Test build locally
pnpm build

# Common issues:
- Missing environment variables
- TypeScript errors (should be suppressed)
- Import errors
```

### Database Connection Issues
```bash
# Verify Supabase credentials
# Check RLS policies
# Review Supabase logs in dashboard
```

### Performance Issues
```bash
# Check Vercel Analytics
# Review database query performance
# Enable caching
# Optimize images
```

## 📊 Monitoring Dashboard

### Key Metrics to Track

1. **Application Health**
   - Uptime percentage
   - Error rate
   - Response times

2. **Business Metrics**
   - Daily active users
   - Orders created
   - Revenue tracked
   - HPP calculations performed

3. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Storage usage

4. **User Experience**
   - Page load times
   - Core Web Vitals
   - User session duration

## 🎉 Launch Checklist

```bash
✅ Database optimized
✅ Environment variables set
✅ Application deployed
✅ Monitoring configured
✅ Backups enabled
✅ Critical flows tested
✅ Performance verified
✅ Security hardened
✅ Documentation updated
✅ Team trained

🚀 READY TO LAUNCH!
```

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Error Tracking**: Check Sentry dashboard
- **Performance**: Check Vercel Analytics

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Status**: Production Ready ✅

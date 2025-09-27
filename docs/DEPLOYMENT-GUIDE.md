# Deployment Guide - AI-Powered Bakery Management System

## 🚀 Vercel Deployment Instructions

### Prerequisites
- ✅ Vercel account (free or pro)
- ✅ GitHub repository with your code
- ✅ Environment variables from `.env.local`

### Step 1: Install Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to your Vercel account
vercel login
```

### Step 2: Initial Deployment
```bash
# In your project directory
cd /Users/mymac/Projects/HeyTrack/bakery-management

# Deploy to Vercel
vercel

# Follow the prompts:
# ? Set up and deploy "~/Projects/HeyTrack/bakery-management"? [Y/n] y
# ? Which scope do you want to deploy to? [your-username]
# ? Link to existing project? [y/N] n
# ? What's your project's name? bakery-management-ai
# ? In which directory is your code located? ./
```

### Step 3: Configure Environment Variables

#### Via Vercel CLI
```bash
# Add all environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://vrrjoswzmlhkmmcfhicw.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
# Paste your anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste your service role key

vercel env add OPENROUTER_API_KEY production
# Paste your OpenRouter API key

vercel env add AI_MODEL production
# Enter: x-ai/grok-4-fast:free

vercel env add AI_TEMPERATURE production
# Enter: 0.2

vercel env add AI_MAX_TOKENS production  
# Enter: 1500
```

#### Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with values from your `.env.local`:

| Variable | Value | Environment |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vrrjoswzmlhkmmcfhicw.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...jVd4` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...xAnY` | Production |
| `OPENROUTER_API_KEY` | `sk-or-v1-d144...a4c2` | Production |
| `AI_MODEL` | `x-ai/grok-4-fast:free` | Production |
| `AI_TEMPERATURE` | `0.2` | Production |
| `AI_MAX_TOKENS` | `1500` | Production |

### Step 4: Deploy with Environment Variables
```bash
# Redeploy with new environment variables
vercel --prod
```

### Step 5: Verify Deployment
Your app will be live at: `https://bakery-management-ai.vercel.app` (or similar)

Test the following:
- ✅ Homepage loads correctly
- ✅ AI Hub accessible at `/ai`
- ✅ AI analysis works (click "Jalankan Analisa AI")
- ✅ All navigation links work
- ✅ Database connection works

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Check build locally first
pnpm build

# If successful locally, check Vercel build logs
vercel logs [deployment-url]
```

#### 2. Environment Variables Not Working
```bash
# List all env vars
vercel env ls

# Pull env vars to local for testing
vercel env pull .env.local
```

#### 3. AI API Not Working
- Check OpenRouter API key in Vercel dashboard
- Verify the API key has credits
- Check Vercel function logs: `vercel logs --since=10m`

#### 4. Database Connection Issues  
- Verify Supabase URL and keys in Vercel dashboard
- Check Supabase dashboard for API usage
- Test connection: `curl https://vrrjoswzmlhkmmcfhicw.supabase.co/rest/v1/`

### Performance Optimization

#### 1. Enable Edge Runtime (Optional)
For faster cold starts, add to your API routes:
```typescript
// In src/app/api/ai/*/route.ts
export const runtime = 'edge'
```

#### 2. Configure Caching
```typescript
// Next.js config for better caching
export const revalidate = 300 // 5 minutes
```

## 🌏 Indonesian Hosting Alternatives

### 1. Railway
- Good for Indonesian users
- Easy database integration
- One-click deployment from GitHub

```bash
# Deploy to Railway
npx @railway/cli login
railway new
railway up
```

### 2. Netlify
- Global CDN with good Asian coverage
- Easy static site deployment

```bash
# Deploy to Netlify  
npm install -g netlify-cli
netlify deploy --build
netlify deploy --prod
```

## 🔒 Security Checklist

### Before Production:
- [ ] All API keys stored as environment variables
- [ ] No secrets in code or git history  
- [ ] Supabase RLS policies configured
- [ ] Rate limiting enabled for AI endpoints
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active

### Supabase Security:
- [ ] Row Level Security enabled on all tables
- [ ] Proper access policies for anonymous users
- [ ] Service role key only used server-side
- [ ] API rate limits configured

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
Enable in Vercel dashboard:
- Go to **Analytics** tab
- Enable **Web Analytics** and **Speed Insights**

### 2. Error Tracking (Optional)
Add Sentry for error monitoring:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 3. AI Usage Monitoring
Track AI API usage:
- Monitor OpenRouter usage at openrouter.ai
- Set up budget alerts
- Track response times in Vercel logs

## 🚀 Post-Deployment

### 1. Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias [deployment-url] yourdomain.com
```

### 2. Performance Testing
```bash
# Test site speed
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app

# Load testing with AI endpoints
for i in {1..5}; do
  curl -X POST https://your-app.vercel.app/api/ai/pricing \
    -H "Content-Type: application/json" \
    -d '{"test": true}'
done
```

### 3. Backup Strategy
- Supabase: Automatic backups enabled
- Code: GitHub repository 
- Environment: Export Vercel env vars regularly

## 📞 Support

### Resources:
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### Getting Help:
- Vercel Support: [vercel.com/help](https://vercel.com/help)
- Community: GitHub Issues in your repo
- Email: your-support@email.com (if applicable)

---

## ✅ Deployment Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Build passes locally and in Vercel
- [ ] AI functionality tested in production
- [ ] Database connection verified
- [ ] All navigation links work  
- [ ] Mobile responsiveness tested
- [ ] Performance is acceptable (<3s load time)
- [ ] Error handling works properly
- [ ] Security measures in place

**Status: 🟢 Ready for Production Deployment!**

*Last updated: January 2024*
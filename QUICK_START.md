# ⚡ HeyTrack Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Setup Environment (2 min)
```bash
# Copy production template
cp .env.production.example .env.production

# Edit with your credentials
nano .env.production
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key (for AI features)

### Step 2: Test Build (1 min)
```bash
pnpm build
```
✅ Should complete without errors

### Step 3: Deploy (2 min)
```bash
# Option A: Automated
./QUICK_DEPLOY.sh

# Option B: Manual
vercel --prod
```

## ✅ Post-Deploy Checklist (5 min)

### 1. Supabase Security
- [ ] Go to Supabase Dashboard
- [ ] Navigate to: **Authentication > Policies**
- [ ] Enable **"Leaked Password Protection"**

### 2. Test Critical Flows
- [ ] Register new user
- [ ] Login
- [ ] Create ingredient
- [ ] Create recipe
- [ ] Create order
- [ ] View HPP calculation

### 3. Setup Monitoring (Optional)
```bash
# Install Sentry
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

## 🔧 Common Issues

### Build Fails
```bash
# Check environment variables
cat .env.production

# Verify Supabase connection
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/
```

### Database Connection Error
- Verify Supabase credentials
- Check RLS policies are enabled
- Review Supabase logs

### Slow Performance
- Enable caching in Vercel
- Check database indexes
- Review Supabase query performance

## 📊 Monitoring URLs

After deployment, bookmark these:

- **App**: https://your-app.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **Analytics**: https://vercel.com/analytics

## 🆘 Need Help?

1. **Deployment Issues**: Check `DEPLOYMENT_GUIDE.md`
2. **Technical Details**: Check `PRODUCTION_READY_SUMMARY.md`
3. **TypeScript Errors**: Check `TYPESCRIPT_FIXES_SUMMARY.md`

## 🎉 Success!

Your HeyTrack app is now live and serving Indonesian culinary SMEs! 🇮🇩

**Core Features Available:**
- ✅ Ingredient Management
- ✅ Recipe Management
- ✅ Order Processing
- ✅ HPP Calculation
- ✅ Financial Reports
- ✅ Customer Management
- ✅ Inventory Tracking

---

**Next Steps:**
1. Share with beta users
2. Gather feedback
3. Monitor performance
4. Iterate and improve

Good luck! 🚀

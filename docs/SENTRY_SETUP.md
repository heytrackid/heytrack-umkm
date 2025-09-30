# Sentry Error Tracking Setup Guide

## 🎯 Overview

Sentry is now configured for production error tracking in the HeyTrack Bakery Management System. This guide will help you complete the setup.

---

## 📋 Prerequisites

- Sentry account (free tier available)
- Access to project environment variables
- 5-10 minutes

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Sign up (free tier: 5,000 errors/month)
3. Create a new project
   - Platform: **Next.js**
   - Name: `heytrack-bakery`

### Step 2: Get Your DSN

After creating the project, Sentry will show you a DSN. It looks like:
```
https://abc123...@o123456.ingest.sentry.io/789012
```

Copy this DSN.

### Step 3: Add Environment Variables

Add to your `.env.local` file:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=heytrack-bakery
SENTRY_AUTH_TOKEN=your-auth-token  # Optional, for sourcemaps
```

**For Vercel/Production:**
Add the same variables in:
- Vercel Dashboard → Settings → Environment Variables
- OR your hosting platform's environment variables

### Step 4: Verify Installation

Run the app and trigger a test error:

```bash
npm run dev
```

Open: `http://localhost:3000`

### Step 5: Test Error Tracking

Create a test error in your app:

```typescript
// Add to any page temporarily
<button onClick={() => {
  throw new Error('Sentry Test Error!')
}}>
  Test Sentry
</button>
```

Click the button → Check Sentry dashboard → Should see the error!

---

## 📊 What's Included

### ✅ Configured Features

1. **Client-Side Error Tracking**
   - Captures unhandled exceptions
   - Tracks component errors
   - Session replay on errors

2. **Server-Side Error Tracking**
   - API route errors
   - Server-side rendering errors
   - Edge runtime errors

3. **Performance Monitoring**
   - Slow operation detection
   - API endpoint performance
   - Database query tracking

4. **Privacy & Security**
   - Sensitive data filtering
   - Header sanitization
   - Development errors excluded

---

## 🔧 Usage Examples

### Basic Error Capture

```typescript
import { captureError } from '@/lib/error-handler'

try {
  await riskyOperation()
} catch (error) {
  captureError(error as Error, {
    tags: { operation: 'riskyOperation' },
    extra: { userId: user.id }
  })
}
```

### API Route Error Handling

```typescript
import { handleApiError } from '@/lib/error-handler'

export async function POST(request: Request) {
  try {
    // Your logic here
  } catch (error) {
    const { error: message, statusCode } = handleApiError(error, {
      tags: { route: '/api/orders' }
    })
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
```

### Track User Context

```typescript
import { setUser } from '@/lib/error-handler'

// After user logs in
setUser({
  id: user.id,
  email: user.email,
  username: user.name
})

// On logout
setUser(null)
```

### Performance Tracking

```typescript
import { trackPerformance } from '@/lib/error-handler'

const result = await trackPerformance(
  'fetch-large-dataset',
  async () => {
    return await fetchLargeDataset()
  },
  2000 // Alert if >2 seconds
)
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/error-handler'

addBreadcrumb('User clicked export button', 'user-action', {
  exportType: 'pdf',
  recordCount: 100
})
```

---

## 🎨 Sentry Dashboard Features

Once setup, you'll have access to:

### 1. Issues
- See all errors in real-time
- Group similar errors
- Track error frequency
- Assign to team members

### 2. Performance
- View slow transactions
- Database query performance
- API endpoint latency
- Frontend load times

### 3. Releases
- Track errors by version
- Compare release health
- Regression detection

### 4. Alerts
- Email notifications
- Slack integration
- PagerDuty integration
- Custom alert rules

---

## ⚙️ Configuration Options

### Adjust Sample Rates

In `sentry.client.config.ts`:

```typescript
tracesSampleRate: 0.1, // 10% of transactions (production)
replaysSessionSampleRate: 0.1, // 10% of sessions
```

### Ignore Specific Errors

Add to `ignoreErrors` array:

```typescript
ignoreErrors: [
  'NetworkError',
  'Failed to fetch',
  'Custom error to ignore',
]
```

### Environment-Specific Config

```typescript
environment: process.env.VERCEL_ENV || process.env.NODE_ENV
```

---

## 📈 Monitoring Best Practices

### 1. Set Up Alerts

Create alerts for:
- High error rate (> 10 errors/min)
- New issues (first time seen)
- Performance degradation

### 2. Weekly Reviews

- Review top 10 errors
- Check error trends
- Monitor performance metrics

### 3. Release Tracking

Tag errors by version:
```bash
SENTRY_RELEASE=v1.0.0 npm run build
```

### 4. User Feedback

Enable User Feedback widget to collect context:
```typescript
Sentry.showReportDialog({
  eventId: errorId,
  user: { email: user.email, name: user.name }
})
```

---

## 🔍 Troubleshooting

### Errors Not Appearing?

1. **Check DSN is correct**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify NODE_ENV**
   - Sentry only sends in production by default
   - Set `debug: true` temporarily to test

3. **Check browser console**
   - Should see Sentry initialization logs

4. **Test manually**
   ```javascript
   Sentry.captureException(new Error('Test'))
   ```

### Too Many Errors?

1. **Increase sample rate filtering**
2. **Add more ignoreErrors patterns**
3. **Upgrade Sentry plan**

---

## 💰 Pricing

### Free Tier (Developer)
- 5,000 errors/month
- 10,000 performance units/month
- 500 replays/month
- ✅ Perfect for getting started

### Team Tier ($26/month)
- 50,000 errors/month
- 100,000 performance units/month
- 500 replays/month
- ✅ Good for small production apps

### Business Tier (Custom)
- Unlimited errors
- Custom retention
- SLA support
- ✅ For enterprise scale

---

## 🔗 Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Handler Util](../src/lib/error-handler.ts)
- [Best Practices](https://docs.sentry.io/product/sentry-basics/guides/enrich-data/)

---

## ✅ Checklist

Before going to production:

- [ ] Sentry account created
- [ ] DSN added to environment variables
- [ ] Tested error capture locally
- [ ] Verified errors appear in dashboard
- [ ] Set up email/Slack alerts
- [ ] Configured sample rates for production
- [ ] Added to Vercel/hosting env vars
- [ ] Team members invited to Sentry project

---

## 📞 Support

Questions? Check:
- `CODE_QUALITY.md` - Development guidelines
- `PRODUCTION_READINESS.md` - Production checklist
- Sentry Community Forum
- GitHub Issues

---

**Last Updated**: December 30, 2024  
**Setup Time**: ~10 minutes  
**Status**: ✅ Ready to use

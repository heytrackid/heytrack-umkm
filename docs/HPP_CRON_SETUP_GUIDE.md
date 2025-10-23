# HPP Cron Jobs Setup Guide

Quick setup guide for deploying HPP historical tracking cron jobs.

## Prerequisites

- Vercel account with project deployed
- Supabase database with HPP tables created
- Environment variables configured

## Setup Steps

### 1. Environment Variables

Add these to your Vercel project settings:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Optional (for security)
CRON_SECRET=generate-a-random-secret-key
```

### 2. Deploy to Vercel

The `vercel.json` file is already configured with cron schedules:

```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch if auto-deploy is enabled
git add .
git commit -m "Add HPP cron jobs"
git push origin main
```

### 3. Verify Cron Jobs

After deployment:

1. Go to Vercel Dashboard → Your Project
2. Click on "Cron Jobs" tab
3. You should see 3 cron jobs:
   - `hpp-snapshots` - Daily at 00:00
   - `hpp-alerts` - Every 6 hours
   - `hpp-archive` - Monthly on 1st at 02:00

### 4. Test Manually

Test each cron job endpoint:

```bash
# Test snapshot creation
curl https://your-domain.vercel.app/api/cron/hpp-snapshots \
  -H "Authorization: Bearer your-cron-secret"

# Test alert detection
curl https://your-domain.vercel.app/api/cron/hpp-alerts \
  -H "Authorization: Bearer your-cron-secret"

# Test data archival
curl https://your-domain.vercel.app/api/cron/hpp-archive \
  -H "Authorization: Bearer your-cron-secret"
```

## Cron Schedules Explained

| Job | Schedule | Cron Expression | Description |
|-----|----------|----------------|-------------|
| Snapshots | Daily at midnight | `0 0 * * *` | Creates HPP snapshots for all recipes |
| Alerts | Every 6 hours | `0 */6 * * *` | Detects and generates HPP alerts |
| Archive | Monthly on 1st at 2am | `0 2 1 * *` | Archives data older than 1 year |

## Monitoring

### View Logs

In Vercel Dashboard:
1. Go to "Deployments" → Select latest deployment
2. Click "Functions" tab
3. Find cron function logs

### Check Execution

In Vercel Dashboard:
1. Go to "Cron Jobs" tab
2. View execution history
3. Check success/failure status

## Troubleshooting

### Cron Job Not Appearing

- Ensure `vercel.json` is in root directory
- Redeploy the project
- Check Vercel dashboard for errors

### 401 Unauthorized Error

- Set `CRON_SECRET` environment variable
- Update authorization header in test requests
- Or remove auth check for testing (not recommended for production)

### 500 Internal Server Error

- Check function logs in Vercel
- Verify database connection
- Ensure all environment variables are set
- Check Supabase service role key permissions

### No Snapshots Created

- Verify users have active recipes
- Check database for existing recipes
- Review function logs for errors
- Test `/api/hpp/snapshot` endpoint directly

## Local Development

For local testing, you can manually call the cron functions:

```typescript
// In your code or API route
import { createDailyHPPSnapshots, detectHPPAlertsForAllUsers, archiveOldHPPSnapshots } from '@/lib/cron-jobs'

// Test snapshot creation
const snapshotResult = await createDailyHPPSnapshots()
console.log(snapshotResult)

// Test alert detection
const alertResult = await detectHPPAlertsForAllUsers()
console.log(alertResult)

// Test archival
const archiveResult = await archiveOldHPPSnapshots()
console.log(archiveResult)
```

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] `vercel.json` committed to repository
- [ ] Database migrations applied
- [ ] HPP tables created (hpp_snapshots, hpp_alerts, hpp_snapshots_archive)
- [ ] Cron jobs visible in Vercel dashboard
- [ ] Manual test of each endpoint successful
- [ ] Monitoring and alerting configured
- [ ] Documentation reviewed by team

## Next Steps

After cron jobs are running:

1. Monitor first few executions
2. Check database for new snapshots and alerts
3. Verify alert notifications appear in UI
4. Review performance metrics
5. Adjust schedules if needed

## Support

For issues or questions:
- Check [HPP_CRON_JOBS.md](./HPP_CRON_JOBS.md) for detailed documentation
- Review Vercel function logs
- Check Supabase logs for database errors
- Contact development team

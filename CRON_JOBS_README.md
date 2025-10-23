# HPP Historical Tracking - Cron Jobs

This project includes automated cron jobs for HPP (Harga Pokok Produksi) historical tracking.

## Quick Start

### 1. Deploy to Vercel

```bash
vercel --prod
```

### 2. Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
CRON_SECRET=your-random-secret-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 3. Verify Cron Jobs

Go to Vercel Dashboard → Your Project → Cron Jobs

You should see:
- ✅ `hpp-snapshots` - Daily at 00:00
- ✅ `hpp-alerts` - Every 6 hours  
- ✅ `hpp-archive` - Monthly on 1st at 02:00

## Cron Jobs Overview

| Job | Schedule | Purpose |
|-----|----------|---------|
| **Snapshots** | Daily at midnight | Creates HPP snapshots for all recipes |
| **Alerts** | Every 6 hours | Detects significant HPP changes and generates alerts |
| **Archive** | Monthly on 1st | Archives data older than 1 year |

## Testing

### Manual Testing

**Note:** HPP snapshot creation has been migrated to a Supabase Edge Function.  
See `.kiro/specs/hpp-edge-function-migration/` for details.

Test each endpoint:

```bash
# Test snapshots (MIGRATED TO EDGE FUNCTION)
# New method:
curl -X POST https://your-project.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer your-service-role-key"

# Test alerts
curl https://your-domain.vercel.app/api/cron/hpp-alerts \
  -H "Authorization: Bearer your-cron-secret"

# Test archive
curl https://your-domain.vercel.app/api/cron/hpp-archive \
  -H "Authorization: Bearer your-cron-secret"
```

### Local Testing

```bash
# Install tsx if not already installed
npm install -g tsx

# Test individual jobs
npx tsx scripts/test-cron-jobs.ts snapshots
npx tsx scripts/test-cron-jobs.ts alerts
npx tsx scripts/test-cron-jobs.ts archive

# Test all jobs
npx tsx scripts/test-cron-jobs.ts all
```

## Documentation

- 📖 [Detailed Documentation](docs/HPP_CRON_JOBS.md) - Complete guide with technical details
- 🚀 [Setup Guide](docs/HPP_CRON_SETUP_GUIDE.md) - Step-by-step deployment instructions
- 📝 [Implementation Summary](docs/HPP_CRON_IMPLEMENTATION_SUMMARY.md) - What was built and why

## Monitoring

### View Logs

Vercel Dashboard → Deployments → Latest → Functions → Select cron function

### Check Status

Vercel Dashboard → Cron Jobs → View execution history

## Troubleshooting

### Cron Job Not Running

1. Check `vercel.json` is in root directory
2. Redeploy the project
3. Verify in Vercel Dashboard → Cron Jobs

### 401 Unauthorized

1. Set `CRON_SECRET` environment variable in Vercel
2. Use correct secret in Authorization header
3. Or remove auth check for testing (not recommended)

### 500 Internal Server Error

1. Check function logs in Vercel Dashboard
2. Verify database connection
3. Ensure all environment variables are set
4. Check Supabase service role key

## Support

For detailed troubleshooting, see:
- [HPP Cron Jobs Documentation](docs/HPP_CRON_JOBS.md)
- [Setup Guide](docs/HPP_CRON_SETUP_GUIDE.md)

## Architecture

```
┌─────────────────────────────────────────┐
│         Vercel Cron Scheduler           │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   Snapshots    Alerts     Archive
   (Daily)    (6 hours)   (Monthly)
        │           │           │
        └───────────┼───────────┘
                    ▼
        ┌─────────────────────┐
        │   Cron Job Logic    │
        │  (src/lib/cron-     │
        │      jobs.ts)       │
        └─────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    Snapshot    Alert      Archive
     API      Detector    Manager
        │           │           │
        └───────────┼───────────┘
                    ▼
        ┌─────────────────────┐
        │  Supabase Database  │
        │  - hpp_snapshots    │
        │  - hpp_alerts       │
        │  - hpp_snapshots_   │
        │    archive          │
        └─────────────────────┘
```

## Files Structure

```
.
├── vercel.json                          # Cron configuration
├── src/
│   ├── lib/
│   │   └── cron-jobs.ts                # Cron job functions
│   └── app/
│       └── api/
│           └── cron/
│               ├── hpp-snapshots/      # Snapshot endpoint
│               ├── hpp-alerts/         # Alert endpoint
│               └── hpp-archive/        # Archive endpoint
├── scripts/
│   └── test-cron-jobs.ts              # Testing utility
└── docs/
    ├── HPP_CRON_JOBS.md               # Detailed docs
    ├── HPP_CRON_SETUP_GUIDE.md        # Setup guide
    └── HPP_CRON_IMPLEMENTATION_       # Implementation summary
        SUMMARY.md
```

## Requirements Fulfilled

✅ Requirement 7.1 - Daily HPP snapshot creation  
✅ Requirement 7.2 - Automatic snapshot storage  
✅ Requirement 7.4 - Data archival (> 1 year)  
✅ Requirement 7.5 - Archive to separate table  
✅ Requirement 3.1 - Automatic alert generation  
✅ Requirement 3.2 - Alert storage in database  

---

**Status**: ✅ Production Ready  
**Last Updated**: January 22, 2025

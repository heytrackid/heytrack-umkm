# Admin Panel - Production Setup

## Quick Setup for Production

### 1. Run Database Migration

```bash
# Local Supabase
supabase migration up

# Or apply manually via Supabase Dashboard > SQL Editor
```

Paste this SQL:
```sql
-- Create system_broadcasts table
CREATE TABLE IF NOT EXISTS public.system_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  query_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.system_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read broadcasts"
  ON public.system_broadcasts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert broadcasts"
  ON public.system_broadcasts FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_system_broadcasts_created_at 
  ON public.system_broadcasts(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.system_broadcasts;
```

### 2. Enable Realtime in Supabase Dashboard

1. Go to **Database > Replication**
2. Find `system_broadcasts` table
3. Enable **Realtime** toggle
4. Save changes

### 3. Set Admin Emails

**Vercel:**
```bash
vercel env add ADMIN_EMAILS
# Enter: your-email@example.com,another-admin@example.com
```

**Or via Vercel Dashboard:**
1. Project Settings > Environment Variables
2. Add `ADMIN_EMAILS`
3. Value: `your-email@example.com,another-admin@example.com`
4. Redeploy

### 4. Test in Production

1. Deploy your app
2. Login with admin email
3. Go to `https://your-app.com/admin`
4. Click a broadcast button
5. Open app on another device/browser
6. See banner appear instantly! 🎉

## How It Works in Production

```
┌─────────────┐
│   Admin     │
│  (Laptop)   │
└──────┬──────┘
       │ 1. Click broadcast
       ▼
┌─────────────────────┐
│  API Route          │
│  /api/admin/        │
│  broadcast-realtime │
└──────┬──────────────┘
       │ 2. Insert to DB
       ▼
┌─────────────────────┐
│  Supabase Database  │
│  system_broadcasts  │
└──────┬──────────────┘
       │ 3. Realtime broadcast
       ▼
┌──────────────────────────────────────┐
│         All Connected Users          │
├──────────────┬──────────────┬────────┤
│   User 1     │   User 2     │  ...   │
│   (Phone)    │   (Tablet)   │        │
└──────────────┴──────────────┴────────┘
       │              │            │
       └──────────────┴────────────┘
                      │ 4. Show banner
                      ▼
              ┌───────────────┐
              │ UpdateBanner  │
              │ "Click Refresh"│
              └───────────────┘
```

## Security Considerations

### Current Setup (Email-based)
- Simple and works for small teams
- Admin emails in environment variables
- Easy to add/remove admins

### Recommended for Scale
Add proper role-based access control:

```sql
-- Add role column to users table
ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';

-- Update RLS policy
CREATE POLICY "Only admins can insert broadcasts"
  ON public.system_broadcasts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

Update `src/lib/admin/auth.ts`:
```typescript
export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  if (!user) return false

  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  return data?.role === 'admin'
}
```

## Monitoring

### Check Broadcast History
```sql
SELECT 
  message,
  created_at,
  created_by
FROM system_broadcasts
ORDER BY created_at DESC
LIMIT 50;
```

### Active Realtime Connections
Check in Supabase Dashboard > Database > Replication

### User Engagement
Track how many users click refresh:
```typescript
// Add to UpdateBanner.tsx
const handleRefresh = (id: string, queryKeys: string[][]) => {
  // Track analytics
  fetch('/api/analytics/broadcast-engagement', {
    method: 'POST',
    body: JSON.stringify({ broadcastId: id })
  })
  
  refreshData(id, queryKeys)
}
```

## Cost Considerations

**Supabase Realtime:**
- Free tier: 200 concurrent connections
- Pro tier: 500 concurrent connections
- Enterprise: Unlimited

**Database Storage:**
- Broadcasts are small (~100 bytes each)
- 1000 broadcasts ≈ 100 KB
- Consider cleanup policy:

```sql
-- Auto-delete broadcasts older than 30 days
CREATE OR REPLACE FUNCTION cleanup_old_broadcasts()
RETURNS void AS $$
BEGIN
  DELETE FROM system_broadcasts
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Run daily via pg_cron or external cron
```

## Troubleshooting

### "Unauthorized: Admin access required"
- Check `ADMIN_EMAILS` environment variable
- Verify email matches exactly (case-sensitive)
- Redeploy after changing env vars

### Broadcast not received on other devices
- Verify Realtime is enabled in Supabase Dashboard
- Check user is authenticated
- Look for errors in browser console
- Test with Supabase Realtime Inspector

### Slow broadcast delivery
- Check Supabase region (should be close to users)
- Verify network connection
- Check Realtime connection status in DevTools

## Alternative: WebSockets

For more control, implement custom WebSocket server:

```typescript
// Using Pusher, Ably, or Socket.io
import Pusher from 'pusher'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER
})

// Broadcast
pusher.trigger('system-updates', 'broadcast', {
  message: 'Update available',
  queryKeys: [['orders']]
})
```

Benefits:
- More control over delivery
- Better analytics
- Presence channels (see who's online)
- Private channels per user

Trade-offs:
- Additional service cost
- More complexity
- Extra dependency

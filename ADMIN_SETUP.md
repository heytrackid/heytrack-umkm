# Admin Panel Setup Guide

## Overview
The admin panel provides system-wide management capabilities including:
- 📊 System statistics and health monitoring
- 📢 Broadcast updates to all users
- 👥 User management and activity tracking
- 🗑️ Cache management
- 📝 System logs (placeholder for production logging)

## Setup

### 1. Configure Admin Access

Add admin email addresses to your `.env.local`:

```bash
ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

Multiple emails can be separated by commas.

### 2. Access the Admin Panel

Navigate to `/admin` in your browser. Only users with emails listed in `ADMIN_EMAILS` can access this page.

## Features

### Overview Tab
- **System Statistics**: Total users, orders, recipes, ingredients, customers
- **Recent Activity**: New items in the last 7 days
- **System Health**: Database, API, and cache status

### Broadcast Tab
Send real-time notifications to all connected users:

**Preset Messages:**
- Data Updated (all data)
- Orders Updated
- Recipes Updated
- Inventory Updated
- Dashboard Updated

**Custom Messages:**
- Write your own message
- Automatically invalidates relevant React Query caches

**How it works:**
1. Click a preset or write a custom message
2. All connected users see a banner notification
3. Users click "Refresh" to update their data
4. Uses BroadcastChannel API for real-time sync

### Users Tab
- View all registered users
- See registration dates
- Track last sign-in times
- Monitor user activity

### Cache Tab
- Clear Next.js server-side cache
- Clear React Query client cache
- View cache information
- Best practices guide

### Logs Tab
- System activity logs (placeholder)
- User actions tracking
- Error monitoring
- Integration ready for production logging services

## Technical Details

### Architecture

**Backend:**
- `/api/admin/broadcast-update` - Send broadcast messages
- `/api/admin/stats` - Get system statistics
- `/api/admin/users` - List users
- `/api/admin/cache/clear` - Clear server cache

**Frontend:**
- `UpdateProvider` - Global context for update notifications
- `UpdateBanner` - Banner component shown to all users
- `BroadcastChannel API` - Real-time communication

**Security:**
- Admin routes protected by `requireAdmin()` middleware
- Email-based access control
- Stack Auth integration

### How Broadcast Works

**Production (Cross-Device):**
1. **Admin triggers broadcast** → API endpoint receives message
2. **Insert to database** → Message saved to `system_broadcasts` table
3. **Supabase Realtime** → Broadcasts to ALL connected clients (any device)
4. **UpdateProvider listens** → All users receive notification
5. **UpdateBanner displays** → User sees notification with refresh button
6. **User clicks refresh** → React Query invalidates and refetches data

**Development (Same Browser):**
- Uses BroadcastChannel API as fallback
- Only works across tabs in same browser
- Useful for local testing

### Adding New Admin Features

1. Create API route in `/api/admin/`
2. Add `requireAdmin()` check
3. Create component in `/app/admin/components/`
4. Add tab to `AdminDashboard.tsx`

Example:

```typescript
// src/app/api/admin/my-feature/route.ts
export const runtime = 'nodejs'

import { createApiRoute } from '@/lib/api/route-factory'
import { requireAdmin } from '@/lib/admin/auth'

export const GET = createApiRoute(
  { method: 'GET', path: '/api/admin/my-feature', requireAuth: true },
  async (context) => {
    await requireAdmin()
    // Your logic here
    return Response.json({ data: 'something' })
  }
)
```

## Production Considerations

### Logging Integration
Replace the placeholder logs with real logging:
- **Vercel**: Use Vercel Logs API
- **Sentry**: Integrate Sentry for error tracking
- **Custom**: Build custom logging service

### Monitoring
Consider adding:
- Performance metrics (response times, error rates)
- Database query performance
- API endpoint usage statistics
- User session analytics

### Security Enhancements
- Add role-based access control (RBAC)
- Implement audit logging for admin actions
- Add two-factor authentication for admin access
- Rate limiting on admin endpoints

### Scalability
- Implement proper pagination for user lists
- Add search and filtering capabilities
- Cache statistics with Redis
- Use WebSockets for real-time updates (instead of BroadcastChannel)

## Troubleshooting

### "Unauthorized: Admin access required"
- Check your email is in `ADMIN_EMAILS` environment variable
- Verify you're logged in with the correct account
- Restart dev server after changing `.env.local`

### Broadcast not working
- **Production**: Ensure Supabase Realtime is enabled for `system_broadcasts` table
- **Development**: BroadcastChannel only works in same browser
- Check browser console for errors
- Verify user is authenticated (Realtime requires auth)
- Run migration: `supabase/migrations/20241203_create_system_broadcasts.sql`

### Stats not loading
- Check Supabase connection
- Verify RLS policies allow admin access
- Check browser network tab for API errors

## Future Enhancements

- [ ] Advanced user management (roles, permissions)
- [ ] Scheduled broadcasts
- [ ] Email notifications
- [ ] System backup and restore
- [ ] Database migration tools
- [ ] Performance monitoring dashboard
- [ ] A/B testing controls
- [ ] Feature flags management

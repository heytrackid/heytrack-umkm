# Enable Leaked Password Protection

## Overview

Supabase Auth can prevent users from using compromised passwords by checking against the HaveIBeenPwned.org database. This feature is currently disabled and should be enabled for better security.

## Steps to Enable

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Policies** (or **Settings**)
3. Find **Password Security** section
4. Enable **Leaked Password Protection**
5. Save changes

### Option 2: Via Supabase CLI

```bash
# Update auth config
supabase secrets set AUTH_PASSWORD_HIBP_ENABLED=true
```

### Option 3: Via Management API

```bash
# Get your project ref and service role key
PROJECT_REF="your-project-ref"
SERVICE_ROLE_KEY="your-service-role-key"

# Update auth config
curl -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "SECURITY_PASSWORD_HIBP_ENABLED": true
  }'
```

## What This Does

When enabled, Supabase will:
1. Check new passwords against HaveIBeenPwned.org database during signup
2. Check passwords during password reset/change
3. Reject passwords that have been compromised in data breaches
4. Return error: "Password has been found in a data breach"

## User Experience

- Users with compromised passwords will be prompted to choose a different password
- Existing users with compromised passwords are NOT forced to change (only on next password change)
- No impact on users with secure passwords

## Privacy

- Passwords are checked using k-anonymity model
- Only first 5 characters of password hash are sent to HaveIBeenPwned
- Full password is never transmitted
- No user data is shared with third parties

## Testing

After enabling, test with a known compromised password:

```bash
# This password is known to be compromised
curl -X POST "https://your-project.supabase.co/auth/v1/signup" \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected response:
# {
#   "error": "Password has been found in a data breach",
#   "error_description": "The password you entered has been found in a data breach. Please choose a different password."
# }
```

## Additional Password Security Settings

While enabling leaked password protection, consider also configuring:

### Minimum Password Length
```json
{
  "SECURITY_PASSWORD_MIN_LENGTH": 8
}
```

### Password Requirements
```json
{
  "SECURITY_PASSWORD_REQUIRED_CHARACTERS": ["upper", "lower", "number", "special"]
}
```

### Password Strength Meter
Enable in your frontend using libraries like:
- `zxcvbn` - Password strength estimator
- `@zxcvbn-ts/core` - TypeScript version

## Verification

After enabling, verify the setting:

```bash
# Check auth config
curl "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  | jq '.SECURITY_PASSWORD_HIBP_ENABLED'

# Should return: true
```

## Rollback

If you need to disable:

```bash
# Via CLI
supabase secrets set AUTH_PASSWORD_HIBP_ENABLED=false

# Via API
curl -X PATCH "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "SECURITY_PASSWORD_HIBP_ENABLED": false
  }'
```

## Resources

- [Supabase Password Security Docs](https://supabase.com/docs/guides/auth/password-security)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [k-Anonymity Model](https://en.wikipedia.org/wiki/K-anonymity)

## Status

- [ ] Leaked password protection enabled
- [ ] Tested with compromised password
- [ ] Verified configuration
- [ ] Updated user documentation

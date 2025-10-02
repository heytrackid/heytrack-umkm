# 🔒 Security Setup Guide

## 🚨 Important Security Notice

This document contains instructions for setting up sensitive configuration data. **NEVER commit actual API keys or secrets to version control.**

## 📋 Environment Variables Required

Create `.env.local` file in your project root with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# For MCP Configuration (optional)
SUPABASE_PROJECT_REF=your_project_ref_here
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here

# OpenRouter AI (optional)
OPENROUTER_API_KEY=your_openrouter_api_key_here
AI_MODEL=x-ai/grok-4-fast:free
AI_TEMPERATURE=0.2
AI_MAX_TOKENS=1500

# Clerk Authentication (if using Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Clerk-Supabase Integration
SUPABASE_THIRD_PARTY_AUTH_ENABLED=true
CLERK_ISSUER_URL=https://your-clerk-domain.clerk.accounts.dev

# Application Settings
NODE_ENV=development
```

## 🔧 Configuration Files Setup

### 1. MCP Configuration (Cursor IDE)

If using Cursor IDE with MCP, copy the template files:

```bash
# Copy template to actual config (DO NOT COMMIT the actual config)
cp .cursor/mcp.json.template .cursor/mcp.json
cp .mcp.json.template .mcp.json
```

Then edit the files and replace placeholders with actual values:
- `${SUPABASE_PROJECT_REF}` → your actual Supabase project reference
- `${SUPABASE_ACCESS_TOKEN}` → your actual Supabase access token

### 2. Vercel Deployment

For production deployment on Vercel, set environment variables in the Vercel dashboard or use the CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all other required variables
```

## 🛡️ Security Best Practices

### ✅ DO:
- Use environment variables for all sensitive data
- Keep `.env.local` in your `.gitignore`
- Use different API keys for development and production
- Regularly rotate API keys and access tokens
- Use Supabase Row Level Security (RLS) policies
- Enable HTTPS in production
- Set up proper CORS policies

### ❌ DON'T:
- Never commit API keys or secrets to Git
- Don't share `.env.local` files via chat/email
- Don't use production keys in development
- Don't disable security headers in production
- Don't expose service role keys to client-side code

## 🔍 Files Protected by .gitignore

The following files are automatically excluded from Git:

```
.env*                    # All environment files
.cursor/                 # Cursor IDE configuration
.mcp.json               # MCP server configuration
supabase/.temp/         # Temporary Supabase files
*.log                   # Log files
*.temp                  # Temporary files
**/pooler-url          # Database connection URLs
**/database-url        # Database URLs
```

## 🚀 Secure Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in deployment platform
- [ ] API keys are production-ready (not test/development keys)
- [ ] CORS settings configured for your domain
- [ ] HTTPS enabled and HTTP redirected
- [ ] Security headers configured in `next.config.ts`
- [ ] Database RLS policies tested
- [ ] Rate limiting configured for API routes
- [ ] Error messages don't expose sensitive information

## 🆘 Security Incident Response

If you accidentally expose API keys:

1. **Immediately rotate/revoke** the exposed keys
2. **Generate new keys** from the respective service dashboards
3. **Update all environments** with new keys
4. **Review commit history** for any other potential exposures
5. **Update team** about the incident and new keys

## 📞 Support

For security-related questions or incidents:
- Check service provider documentation (Supabase, Clerk, OpenRouter)
- Review this repository's security documentation
- Contact your system administrator

---

**⚠️ Remember: Security is everyone's responsibility. When in doubt, err on the side of caution.**

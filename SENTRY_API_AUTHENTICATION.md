# Sentry API Authentication Implementation Guide

This document outlines how to use the Sentry API authentication system implemented in the HeyTrack project.

## Overview

The implementation provides three authentication methods as per Sentry's documentation:
- Bearer token authentication (for user tokens and internal integration tokens)
- DSN authentication (for limited operations)
- API key authentication (legacy method using Basic auth)

## Implementation Files

- `src/lib/sentry-api-auth.ts` - Main authentication service module
- `src/app/api/sentry-protected/route.ts` - Example API route demonstrating usage

## Using Authentication in Your Code

### Basic Authentication

To authenticate a request in any API route:

```typescript
import { authenticateSentryAPI } from "@/lib/sentry-api-auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authResult = await authenticateSentryAPI(request);
  
  if (!authResult.isValid) {
    return new Response(
      JSON.stringify({ error: authResult.error }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  
  // Process authenticated request
  return new Response(
    JSON.stringify({ message: "Authenticated successfully" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
```

### Using the Authenticated API Client

To make authenticated calls to Sentry API:

```typescript
import { authenticateSentryAPI, createSentryAPIClient } from "@/lib/sentry-api-auth";

export async function GET(request: NextRequest) {
  const authResult = await authenticateSentryAPI(request);
  
  if (!authResult.isValid) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Create an authenticated API client
  const sentryAPIClient = createSentryAPIClient(authResult);
  
  // Use the client to call Sentry API
  const response = await sentryAPIClient("organizations/", {
    method: "GET",
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

## Authentication Methods

### 1. Bearer Token Authentication

```bash
curl -H 'Authorization: Bearer {TOKEN}' http://localhost:3000/api/sentry-protected
```

### 2. DSN Authentication

```bash
curl -H 'Authorization: DSN {DSN}' http://localhost:3000/api/sentry-protected
```

### 3. API Key Authentication (Basic Auth)

```bash
curl -u '{API_KEY}:' http://localhost:3000/api/sentry-protected
```

## Security Considerations

- Store authentication credentials securely (use environment variables)
- Implement rate limiting for authentication attempts
- Log authentication failures for security monitoring
- Regularly rotate authentication tokens
- Use HTTPS for all authenticated requests

## Error Handling

The authentication system includes comprehensive error handling with Sentry logging:
- All authentication errors are captured using `Sentry.captureException`
- Failed authentication attempts are logged with relevant context
- Each authentication method has proper error handling

## Testing the Implementation

To test the example API route:

1. Bearer token: `curl -H 'Authorization: Bearer test-token' http://localhost:3000/api/sentry-protected`
2. DSN: `curl -H 'Authorization: DSN https://test@sentry.io/12345' http://localhost:3000/api/sentry-protected`
3. API key: `curl -u 'test-api-key:' http://localhost:3000/api/sentry-protected`

## Integration with HeyTrack System

The authentication system is designed to integrate with HeyTrack's existing architecture:
- Compatible with the existing error handling patterns
- Uses HeyTrack's logging and monitoring practices
- Follows the code structure and conventions already established
- Works with HeyTrack's Sentry monitoring setup
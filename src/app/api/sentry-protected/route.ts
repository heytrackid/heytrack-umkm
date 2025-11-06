import type { NextRequest } from "next/server";
 
import {
  authenticateSentryAPI,
  createSentryAPIClient,
  SentryAuthMethod
} from "@/lib/sentry-api-auth";
 
import type { SentryAuthResult } from "@/lib/sentry-api-auth"; // eslint-disable-line no-duplicate-imports
import { createErrorResponse } from "@/lib/api-core/responses";
import * as Sentry from "@sentry/nextjs";

/**
 * Example API route demonstrating Sentry API authentication
 * 
 * This route shows how to:
 * 1. Authenticate requests using different Sentry auth methods
 * 2. Handle authenticated requests to Sentry API
 * 3. Respond appropriately based on auth results
 * 
 * Usage examples:
 * - Bearer token: curl -H 'Authorization: Bearer {TOKEN}' http://localhost:3000/api/sentry-protected
 * - DSN: curl -H 'Authorization: DSN {DSN}' http://localhost:3000/api/sentry-protected
 * - API key: curl -u '{API_KEY}:' http://localhost:3000/api/sentry-protected
 */

// eslint-disable-next-line require-await
export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/sentry-protected",
    },
    async (span) => {
      try {
        // Extract and validate authentication
        const authResult = await authenticateSentryAPI(request);
        span.setAttribute("auth_valid", authResult.isValid);
        span.setAttribute("auth_method", authResult.method);

        if (!authResult.isValid) {
          return createErrorResponse(
            authResult.error || "Authentication failed",
            401
          );
        }

        // Create authenticated API client using the auth result
        createSentryAPIClient(authResult); // Client created but not used in this example

        // Example: Make a request to Sentry API using the authenticated client
        // In a real implementation, you might fetch org data, projects, etc.
        let sentryResponseData = null;
        
        if (authResult.method === SentryAuthMethod.Bearer && authResult.scopes?.includes('org:read')) {
          // Example of making an authenticated request to Sentry API
          // This would fetch organization data in a real implementation
          try {
            // Example API call - in practice you would call Sentry's actual API
            // const response = await sentryAPIClient('organizations/', {
            //   method: 'GET',
            // });
            // sentryResponseData = await response.json();
            
            // For this example, we'll simulate a successful response
            sentryResponseData = {
              message: "Successfully authenticated with Sentry API",
              authMethod: authResult.method,
              scopes: authResult.scopes,
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            Sentry.captureException(error, {
              tags: {
                operation: "sentry_api_call",
              },
              extra: {
                auth_method: authResult.method,
              },
            });

            return createErrorResponse(
              "Failed to make request to Sentry API",
              500
            );
          }
        }

        // Return successful response with authentication info
        return new Response(
          JSON.stringify({
            authenticated: true,
            method: authResult.method,
            scopes: authResult.scopes,
            sentry_data: sentryResponseData,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            endpoint: "/api/sentry-protected",
            method: "GET",
          },
        });

        return createErrorResponse(
          "Internal server error during authentication",
          500
        );
      }
    }
  );
}

/**
 * POST endpoint to demonstrate how to use authentication for creating Sentry resources
 */
// eslint-disable-next-line require-await
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/sentry-protected",
    },
    async (span) => {
      try {
        // Authenticate the request
        const authResult = await authenticateSentryAPI(request);
        span.setAttribute("auth_valid", authResult.isValid);
        span.setAttribute("auth_method", authResult.method);

        if (!authResult.isValid) {
          return createErrorResponse(
            authResult.error || "Authentication failed",
            401
          );
        }

        // Parse request body
        let body;
        try {
          body = await request.json();
        } catch (_error) {
          return createErrorResponse("Invalid JSON in request body", 400);
        }

        // Create authenticated API client
        const sentryAPIClient = createSentryAPIClient(authResult);

        // Process the request based on auth method
        let result;
        switch (authResult.method) {
          case SentryAuthMethod.Bearer:
            result = await handleBearerRequest(sentryAPIClient, authResult, body);
            break;
          case SentryAuthMethod.DSN:
            result = await handleDSNRequest(sentryAPIClient, authResult, body);
            break;
          case SentryAuthMethod.APIKey:
            result = await handleAPIKeyRequest(sentryAPIClient, authResult, body);
            break;
          default:
            return createErrorResponse("Unsupported authentication method", 400);
        }

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            endpoint: "/api/sentry-protected",
            method: "POST",
          },
        });

        return createErrorResponse(
          "Internal server error during processing",
          500
        );
      }
    }
  );
}

/**
 * Handle requests with Bearer token authentication
 */
function handleBearerRequest(
  _client: ReturnType<typeof createSentryAPIClient>,
  authResult: SentryAuthResult,
  body: unknown
) {
  return Sentry.startSpan(
    {
      op: "auth.handler",
      name: "Handle Bearer Token Request",
    },
    (span) => {
      span.setAttribute("auth_method", "bearer");
      
      // In a real implementation, you might create an issue, fetch events, etc.
      // Example: const response = await client('projects/{org}/{project}/events/', { method: 'GET' });
      
      return {
        message: "Handled request with Bearer token authentication",
        auth: {
          method: authResult.method,
          scopes: authResult.scopes,
        },
        data: body,
        processed: new Date().toISOString(),
      };
    }
  );
}

/**
 * Handle requests with DSN authentication
 */
function handleDSNRequest(
  _client: ReturnType<typeof createSentryAPIClient>,
  authResult: SentryAuthResult,
  body: unknown
) {
  return Sentry.startSpan(
    {
      op: "auth.handler",
      name: "Handle DSN Request",
    },
    (span) => {
      span.setAttribute("auth_method", "dsn");
      
      // DSN auth is typically for limited operations like submitting events
      // In a real implementation, you might validate the DSN and forward the event
      
      return {
        message: "Handled request with DSN authentication",
        auth: {
          method: authResult.method,
        },
        data: body,
        processed: new Date().toISOString(),
      };
    }
  );
}

/**
 * Handle requests with API key authentication
 */
function handleAPIKeyRequest(
  _client: ReturnType<typeof createSentryAPIClient>,
  authResult: SentryAuthResult,
  body: unknown
) {
  return Sentry.startSpan(
    {
      op: "auth.handler",
      name: "Handle API Key Request",
    },
    (span) => {
      span.setAttribute("auth_method", "api_key");
      
      // API key auth (legacy) would typically be used for various API operations
      // In a real implementation, you might use this to create projects, etc.
      
      return {
        message: "Handled request with API key authentication",
        auth: {
          method: authResult.method,
        },
        data: body,
        processed: new Date().toISOString(),
      };
    }
  );
}
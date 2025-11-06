import * as Sentry from "@sentry/nextjs";
import type { NextRequest } from "next/server";

/**
 * Sentry API Authentication Module
 * Implements various Sentry API authentication methods
 * 
 * Supports:
 * - Bearer token authentication (User tokens and Internal integration tokens)
 * - DSN authentication 
 * - API key authentication (Basic auth) - Legacy
 */

// Define authentication methods enum
// eslint-disable-next-line no-restricted-syntax
export enum SentryAuthMethod {
  Bearer = "bearer",
  DSN = "dsn",
  APIKey = "api_key"
}

// Authentication result interface
export interface SentryAuthResult {
  isValid: boolean;
  userId?: string;
  orgId?: string;
  scopes?: string[];
  method: SentryAuthMethod;
  error?: string;
  token?: string;
}

/**
 * Bearer Token Authentication
 * Supports both user tokens and internal integration tokens
 */
export function authenticateWithBearerToken(
  token: string
): SentryAuthResult {
  return Sentry.startSpan(
    {
      op: "auth",
      name: "Bearer Token Authentication",
    },
    (span) => {
      try {
        span.setAttribute("auth_method", "bearer");
        span.setAttribute("token_length", token.length);

        // In a real implementation, we would make an API call to Sentry to validate the token
        // For now, we'll implement basic validation
        if (!token || typeof token !== "string") {
          return {
            isValid: false,
            method: SentryAuthMethod.Bearer,
            error: "Invalid token format",
          };
        }

        // Basic token validation (length, format)
        if (token.length < 10) {
          return {
            isValid: false,
            method: SentryAuthMethod.Bearer,
            error: "Token too short",
          };
        }

        // In a real implementation, you would make an API call to:
        // GET https://sentry.io/api/0/users/me/ (for user tokens)
        // or validate against internal integration
        // Example: 
        // const response = await fetch('https://sentry.io/api/0/users/me/', {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
        // const userData = await response.json();

        // For this example, we'll assume the token is valid
        span.setAttribute("auth_valid", true);
        
        return {
          isValid: true,
          method: SentryAuthMethod.Bearer,
          token,
          scopes: ["event:read", "org:read", "project:read"], // Example scopes
        };
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            auth_method: "bearer",
          },
          extra: {
            token_length: token?.length,
          },
        });

        return {
          isValid: false,
          method: SentryAuthMethod.Bearer,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

/**
 * DSN Authentication
 * Uses DSN (Client Key) for authentication
 */
export function authenticateWithDSN(
  dsn: string
): SentryAuthResult {
  return Sentry.startSpan(
    {
      op: "auth",
      name: "DSN Authentication",
    },
    (span) => {
      try {
        span.setAttribute("auth_method", "dsn");
        span.setAttribute("dsn_length", dsn.length);

        if (!dsn || typeof dsn !== "string") {
          return {
            isValid: false,
            method: SentryAuthMethod.DSN,
            error: "Invalid DSN format",
          };
        }

        // Basic format validation for DSN
        // DSNs typically look like: https://publicKey@host/projectId
        const dsnRegex = /^https:\/\/([a-f0-9]{32})@sentry\.io\/(\d+)$/;
        if (!dsnRegex.test(dsn)) {
          return {
            isValid: false,
            method: SentryAuthMethod.DSN,
            error: "Invalid DSN format",
          };
        }

        // In a real implementation, you would use the DSN to make authenticated requests
        // For example: const response = await fetch(`${dsn}/store/`, { ... });

        span.setAttribute("auth_valid", true);

        return {
          isValid: true,
          method: SentryAuthMethod.DSN,
          token: dsn,
        };
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            auth_method: "dsn",
          },
          extra: {
            dsn_length: dsn?.length,
          },
        });

        return {
          isValid: false,
          method: SentryAuthMethod.DSN,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

/**
 * API Key Authentication (Legacy)
 * Uses HTTP Basic auth with API key as username and empty password
 */
export function authenticateWithAPIKey(
  apiKey: string
): SentryAuthResult {
  return Sentry.startSpan(
    {
      op: "auth",
      name: "API Key Authentication",
    },
    (span) => {
      try {
        span.setAttribute("auth_method", "api_key");
        span.setAttribute("api_key_length", apiKey.length);

        if (!apiKey || typeof apiKey !== "string") {
          return {
            isValid: false,
            method: SentryAuthMethod.APIKey,
            error: "Invalid API key format",
          };
        }

        // Basic validation
        if (apiKey.length < 10) {
          return {
            isValid: false,
            method: SentryAuthMethod.APIKey,
            error: "API key too short",
          };
        }

        // In a real implementation, you would validate the API key against
        // Sentry's API key storage system
        // Example API call would use Basic auth: `Authorization: Basic ${base64encode(apiKey:)}`

        span.setAttribute("auth_valid", true);

        return {
          isValid: true,
          method: SentryAuthMethod.APIKey,
          token: apiKey,
        };
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            auth_method: "api_key",
          },
          extra: {
            api_key_length: apiKey?.length,
          },
        });

        return {
          isValid: false,
          method: SentryAuthMethod.APIKey,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

/**
 * Extract authentication token from request headers
 * Supports Authorization header with Bearer, DSN, or Basic auth
 */
export function extractAuthToken(request: NextRequest): {
  token: string | null;
  method: SentryAuthMethod | null;
} {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return { token: null, method: null };
  }

  // Check for Bearer token
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    return {
      token: authHeader.substring(7).trim(),
      method: SentryAuthMethod.Bearer,
    };
  }

  // Check for DSN authentication
  if (authHeader.toLowerCase().startsWith("dsn ")) {
    return {
      token: authHeader.substring(4).trim(),
      method: SentryAuthMethod.DSN,
    };
  }

  // Check for Basic auth (API key)
  if (authHeader.toLowerCase().startsWith("basic ")) {
    // Decode base64 encoded "apiKey:" string
    try {
      const encodedCredentials = authHeader.substring(6).trim();
      const decodedCredentials = atob(encodedCredentials);
      const [apiKey] = decodedCredentials.split(":");
      return {
        token: apiKey,
        method: SentryAuthMethod.APIKey,
      };
    } catch (error) {
      // If decoding fails, it's not a valid basic auth header
      Sentry.captureException(error);
      return { token: null, method: null };
    }
  }

  // If header doesn't match expected formats, return null
  return { token: null, method: null };
}

/**
 * Main authentication function that tries all methods
 */
export function authenticateSentryAPI(
  request: NextRequest
): SentryAuthResult {
  return Sentry.startSpan(
    {
      op: "auth",
      name: "Sentry API Authentication",
    },
    (span) => {
      try {
        const { token, method } = extractAuthToken(request);

        if (!token || !method) {
          return {
            isValid: false,
            method: SentryAuthMethod.Bearer, // Default
            error: "No authentication token found",
          };
        }

        span.setAttribute("auth_method_used", method);

        switch (method) {
          case SentryAuthMethod.Bearer:
            return authenticateWithBearerToken(token);
          case SentryAuthMethod.DSN:
            return authenticateWithDSN(token);
          case SentryAuthMethod.APIKey:
            return authenticateWithAPIKey(token);
          default:
            return {
              isValid: false,
              method,
              error: "Unsupported authentication method",
            };
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            operation: "authenticateSentryAPI",
          },
        });

        return {
          isValid: false,
          method: SentryAuthMethod.Bearer, // Default
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

/**
 * Create an authenticated fetch function with Sentry tracking
 */
export function createSentryAPIClient(authResult: SentryAuthResult) {
  return async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => { // eslint-disable-line require-await, arrow-body-style
    return Sentry.startSpan(
      {
        op: "http.client",
        name: `Sentry API: ${options.method || "GET"} ${endpoint}`,
      },
      async (span) => {
        try {
          // Construct headers based on authentication method
          const headers: Record<string, string> = {
            ...(options.headers as Record<string, string>),
          };

          switch (authResult.method) {
            case SentryAuthMethod.Bearer:
              if (authResult.token) {
                headers["Authorization"] = `Bearer ${authResult.token}`;
              }
              break;
            case SentryAuthMethod.DSN:
              if (authResult.token) {
                headers["Authorization"] = `DSN ${authResult.token}`;
              }
              break;
            case SentryAuthMethod.APIKey:
              if (authResult.token) {
                // For API key, the format is Authorization: Basic base64(apiKey:)
                const credentials = btoa(`${authResult.token}:`);
                headers["Authorization"] = `Basic ${credentials}`;
              }
              break;
          }

          // Track the API call
          span.setAttribute("sentry_endpoint", endpoint);
          span.setAttribute("auth_method", authResult.method);
          span.setAttribute("has_auth_token", !!authResult.token);

          const url = endpoint.startsWith("http") 
            ? endpoint 
            : `https://sentry.io/api/0/${endpoint}`;

          const response = await fetch(url, {
            ...options,
            headers,
          });

          span.setAttribute("http_status", response.status);
          span.setAttribute("success", response.ok);

          return response;
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              operation: "sentry_api_call",
            },
            extra: {
              endpoint,
              auth_method: authResult.method,
            },
          });

          throw error;
        }
      }
    );
  };
}
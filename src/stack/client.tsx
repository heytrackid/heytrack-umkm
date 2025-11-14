import { StackClientApp } from "@stackframe/stack";

// Get Stack Auth credentials from environment
const projectId = process.env['NEXT_PUBLIC_STACK_PROJECT_ID'];
const publishableClientKey = process.env['NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY'];

// Validate required environment variables
if (!projectId) {
  throw new Error(
    'Missing NEXT_PUBLIC_STACK_PROJECT_ID environment variable. ' +
    'Please create a Stack Auth project at https://app.stack-auth.com ' +
    'and add the project ID to your .env.local file.'
  );
}

export const stackClientApp = new StackClientApp({
  projectId,
  publishableClientKey,
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    afterSignIn: "/dashboard",
    afterSignOut: "/handler/sign-in",
  },
});

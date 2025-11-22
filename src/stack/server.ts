import { StackServerApp } from "@stackframe/stack";
import "server-only";

const projectId = process.env['NEXT_PUBLIC_STACK_PROJECT_ID'];
const publishableClientKey = process.env['NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY'];
const secretServerKey = process.env['STACK_SECRET_SERVER_KEY'];

if (!projectId || !publishableClientKey || !secretServerKey) {
  throw new Error('Stack Auth environment variables are required: NEXT_PUBLIC_STACK_PROJECT_ID, NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY, and STACK_SECRET_SERVER_KEY');
}

export const stackServerApp = new StackServerApp({
  projectId,
  publishableClientKey,
  secretServerKey,
  tokenStore: "nextjs-cookie", // storing auth tokens in cookies
  urls: {
    home: '/dashboard',
    signIn: '/handler/sign-in',
    signUp: '/handler/sign-up',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    afterSignOut: '/handler/sign-in',
  },
});

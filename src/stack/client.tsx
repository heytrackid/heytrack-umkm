import { StackClientApp } from "@stackframe/stack";

const projectId = process.env['NEXT_PUBLIC_STACK_PROJECT_ID'];
const publishableClientKey = process.env['NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY'];

if (!projectId || !publishableClientKey) {
  throw new Error('Stack Auth environment variables are required: NEXT_PUBLIC_STACK_PROJECT_ID and NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY');
}

export const stackClientApp = new StackClientApp({
  projectId,
  publishableClientKey,
  tokenStore: "nextjs-cookie",
  urls: {
    home: '/dashboard',
    signIn: '/handler/sign-in',
    signUp: '/handler/sign-up',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    afterSignOut: '/handler/sign-in',
  },
});

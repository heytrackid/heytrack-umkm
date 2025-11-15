import { StackServerApp } from "@stackframe/stack";
import "server-only";

export const stackServerApp = new StackServerApp({
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

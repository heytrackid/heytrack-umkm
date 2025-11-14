import { StackClientApp } from "@stackframe/stack";

export const stackClientApp = new StackClientApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    afterSignIn: "/dashboard",
    afterSignOut: "/handler/sign-in",
  },
});

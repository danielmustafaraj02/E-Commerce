import type { NextAuthResult } from "next-auth";

// Public storefront: guest sessions only. The development bundler aliases this
// module to the ignored local implementation; production never imports it.
export const auth = (async () => null) as NextAuthResult["auth"];
export const handlers = {
  GET: async () => new Response(null, { status: 404 }),
  POST: async () => new Response(null, { status: 404 }),
};
export const signIn = (async () => {
  throw new Error("Sign-in is available only in the local workspace.");
}) as NextAuthResult["signIn"];
export const signOut = (async () => undefined) as NextAuthResult["signOut"];

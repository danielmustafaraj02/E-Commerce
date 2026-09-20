import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      mfaEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    mfaEnabled: boolean;
    // ms timestamp of the sign-in that created this session
    authAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    mfaEnabled: boolean;
    // ms timestamp of the sign-in that created this session
    authAt?: number;
  }
}

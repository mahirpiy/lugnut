import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasActiveSubscription: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    subscriptionExpiresAt?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    subscriptionExpiresAt: string | null;
  }
}

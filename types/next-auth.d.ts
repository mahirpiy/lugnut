import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasActiveSubscription: boolean;
      usageCredits: UsageCredits | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
  }
}

type UsageCredits = {
  vehicle: {
    total: number;
    used: number;
  };
  job: {
    total: number;
    used: number;
  };
  fuel: {
    total: number;
    used: number;
  };
  odometer: {
    total: number;
    used: number;
  };
};

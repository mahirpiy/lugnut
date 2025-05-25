import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      uuid: string;
      isPaid: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: number;
    uuid: string;
    isPaid?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: number;
    uuid: string;
  }
}

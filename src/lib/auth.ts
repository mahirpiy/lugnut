import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { accounts, sessions, users, verificationTokens } from "./db/schema";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (!user.length || !user[0].password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user[0].password
        );

        if (!isPasswordValid) {
          return null;
        }

        console.log("subscriptionExpiresAt", user[0].subscriptionExpiresAt);
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          subscriptionExpiresAt: user[0].subscriptionExpiresAt,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.subscriptionExpiresAt = user.subscriptionExpiresAt
          ? new Date(user.subscriptionExpiresAt).toISOString()
          : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        const expiryDate = token.subscriptionExpiresAt
          ? new Date(token.subscriptionExpiresAt)
          : null;
        session.user.hasActiveSubscription = expiryDate
          ? expiryDate > new Date()
          : false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
};

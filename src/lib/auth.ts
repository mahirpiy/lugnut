import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UsageCredits } from "../../types/next-auth";
import { db } from "./db";
import {
  accounts,
  paygUsageCredits,
  sessions,
  subscriptions,
  users,
  verificationTokens,
} from "./db/schema";
import {
  SubscriptionStatus,
  SubscriptionType,
  UsageCreditType,
} from "./enums/upgrades";

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
        return {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.hasActiveSubscription = await userHasActiveSubscription(
          session.user.id
        );
        session.user.usageCredits = await getUserUsageCredits(session.user.id);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup",
  },
};

async function userHasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  const hasActiveSubscription =
    subscription.some((sub) => sub.status === SubscriptionStatus.ACTIVE) ||
    subscription.some((sub) => sub.status === SubscriptionType.PERMANENT);

  return hasActiveSubscription;
}

async function getUserUsageCredits(userId: string): Promise<UsageCredits> {
  const usageCredits = await db
    .select()
    .from(paygUsageCredits)
    .where(eq(paygUsageCredits.userId, userId));

  const vehicleCredits = usageCredits.filter(
    (credit) => credit.creditType === UsageCreditType.VEHICLE
  );
  const jobCredits = usageCredits.filter(
    (credit) => credit.creditType === UsageCreditType.JOB
  );
  const fuelCredits = usageCredits.filter(
    (credit) => credit.creditType === UsageCreditType.FUEL
  );
  const odometerCredits = usageCredits.filter(
    (credit) => credit.creditType === UsageCreditType.ODOMETER
  );

  return {
    vehicle: {
      total: vehicleCredits.reduce(
        (acc, credit) => acc + credit.purchasedCount,
        0
      ),
      used: vehicleCredits.reduce((acc, credit) => acc + credit.usedCount, 0),
    },
    job: {
      total: jobCredits.reduce((acc, credit) => acc + credit.purchasedCount, 0),
      used: jobCredits.reduce((acc, credit) => acc + credit.usedCount, 0),
    },
    fuel: {
      total: fuelCredits.reduce(
        (acc, credit) => acc + credit.purchasedCount,
        0
      ),
      used: fuelCredits.reduce((acc, credit) => acc + credit.usedCount, 0),
    },
    odometer: {
      total: odometerCredits.reduce(
        (acc, credit) => acc + credit.purchasedCount,
        0
      ),
      used: odometerCredits.reduce((acc, credit) => acc + credit.usedCount, 0),
    },
  };
}

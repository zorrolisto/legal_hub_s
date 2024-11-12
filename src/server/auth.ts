import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "~/env";
import { db } from "~/server/db";
import {
  accounts,
  customUser,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/signin",
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({
      token,
      user,
      account,
      profile,
      trigger,
      isNewUser,
    }: {
      token: any;
      user?: any;
      account?: any;
      profile?: any;
      trigger?: any;
      isNewUser?: boolean;
    }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }) {
      if (account && account.provider === "google") {
        const userCustom = await db
          .select()
          .from(customUser)
          .where(
            and(
              eq(customUser.mail, user.email || ""),
              eq(customUser.enable, true),
            ),
          );
        if (userCustom.length === 0) {
          return false;
        }
      }

      return true;
    },
    session: async ({ session, user, token, newSession }) => {
      const userCustom = await db
        .select()
        .from(customUser)
        .where(eq(customUser.mail, session.user.email || ""));

      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture; // `picture` es el nombre de la propiedad en el token de Google

      return {
        ...session,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          id: userCustom.length > 0 ? userCustom[0]?.id : 0,
        },
      };
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid profile email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar",
        },
      },
      client: {
        httpOptions: {
          timeout: 10000, // 10 segundos de espera
        },
      },
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "julio" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        const userFinded = await db
          .select()
          .from(customUser)
          .where(eq(customUser.nroDocumento, credentials.username))
          .limit(1);
        if (!userFinded || userFinded.length === 0 || !userFinded[0])
          return null;
        const user = userFinded[0];
        // bcrypt compare but with the password from the credentials and the password from the user
        if (
          user.nroDocumento === credentials.username &&
          user.nroDocumento === credentials.password
        ) {
          return {
            ...user,
            id: user.id.toString(), // Ensure id is a string
          };
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

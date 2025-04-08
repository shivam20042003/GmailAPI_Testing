// src/lib/authOptions.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Session } from 'next-auth';
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
            scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
          },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }:{
        session: Session;
        token: JWT;
    } ) {
      
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};
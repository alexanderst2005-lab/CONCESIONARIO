import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Faltan credenciales");
        }

        const userResults = await db.select().from(users).where(eq(users.email, credentials.email));
        const user = userResults[0];

        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id.toString(),
          name: `${user.name} ${user.lastName}`,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const nextAuthHandler = NextAuth(authOptions);

async function customHandler(req: NextRequest, ctx: any) {
  // Call the original handler
  const response = await nextAuthHandler(req, ctx);

  // Intercept cookies to make non-admin sessions purely session cookies (expire on browser close)
  const setCookieHeaders = response.headers.get("set-cookie");
  if (setCookieHeaders && setCookieHeaders.includes("next-auth.session-token")) {
    const tokenMatch = setCookieHeaders.match(/next-auth\.session-token=([^;]+)/);
    if (tokenMatch) {
      try {
        const decoded = await decode({ token: tokenMatch[1], secret: process.env.NEXTAUTH_SECRET! });
        
        // If the user is NOT an Admin, strip Expires and Max-Age from the cookie
        if (decoded && decoded.role !== "ADMIN") {
          // split cookies correctly handling commas inside dates (Expires=Wed, 21 Oct 2015 07:28:00 GMT)
          // a simple replace on the whole header is easier for Expires and Max-Age
          let newSetCookie = setCookieHeaders
            .replace(/Max-Age=[0-9]+;\s?/gi, '')
            .replace(/Expires=[a-zA-Z]{3},\s[0-9]{2}\s[a-zA-Z]{3}\s[0-9]{4}\s[0-9]{2}:[0-9]{2}:[0-9]{2}\sGMT;\s?/gi, '');
          
          const newRes = new NextResponse(response.body, response);
          newRes.headers.set("set-cookie", newSetCookie);
          return newRes;
        }
      } catch (e) {
        console.error("Error decoding token for session cookie modification:", e);
      }
    }
  }

  return response;
}

export { customHandler as GET, customHandler as POST };

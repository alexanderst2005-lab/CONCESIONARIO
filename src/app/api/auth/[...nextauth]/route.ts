import NextAuth, { NextAuthOptions } from "next-auth";
import { cookies } from "next/headers";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
          phone: user.phone,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          if (!user.email) return false;
          
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email)
          });

          const cookieStore = await cookies();
          const authAction = cookieStore.get('auth_action')?.value;

          if (!existingUser) {
            if (authAction === 'register') {
              // Generate a random password since they use Google
              const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
              const hashedPassword = await bcrypt.hash(randomPassword, 10);
              
              let firstName = (profile as any)?.given_name || user.name?.split(' ')[0] || "Usuario";
              let lastName = (profile as any)?.family_name || user.name?.split(' ').slice(1).join(' ') || "";

              await db.insert(users).values({
                name: firstName,
                lastName: lastName,
                email: user.email,
                password: hashedPassword,
                role: 'USER',
              });
              return true;
            } else {
              return "/login?error=GoogleNotRegistered";
            }
          }
          return true;
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (account && user?.email) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, user.email)
          });
          if (dbUser) {
            token.id = dbUser.id.toString();
            token.role = dbUser.role;
            token.phone = dbUser.phone;
            token.name = `${dbUser.name} ${dbUser.lastName}`;
          }
        } else if (user) {
          token.id = user.id;
          token.role = (user as any).role;
          token.phone = (user as any).phone;
        }

        // Forzar cierre de sesión para sesiones antiguas del admin
        const PASSWORD_RESET_TIMESTAMP = 1791562535;
        if (token.email === 'crmautoselpatron@gmail.com' && typeof token.iat === 'number' && token.iat < PASSWORD_RESET_TIMESTAMP) {
          token.exp = 0; // Expirar token inmediatamente
          token.role = undefined;
          token.id = undefined;
        }

      } catch (error) {
        console.error("Error in jwt callback:", error);
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          (session.user as any).id = token.id;
          (session.user as any).role = token.role;
          (session.user as any).phone = token.phone;
        }
      } catch (error) {
        console.error("Error in session callback:", error);
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

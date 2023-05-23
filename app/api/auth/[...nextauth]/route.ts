import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/app/libs/prismadb";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma), // Pass Prisma Client instance to NextAuth as database adapter 
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }), // OAuth authentication providers of github
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }), // OAuth authentication providers of google
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      }, // Login form fields 
      async authorize(credentials) {

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }; // Check credentials are valid 

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        }); // Find user based on email 

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid credentials");
        }; // If no user, or password does not match, return error 

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        ); // Check password is correct 

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }; // If password does not match, return error

        return user; // If everything is correct, return user object 
      }, 
    }),
  ],
  debug: process.env.NODE_ENV === "development",  // Enable debug messages in the console if you are having problems 
  session:{
    strategy: "jwt",
  }, // Session configuration type jwt 
  secret: process.env.NEXTAUTH_SECRET!, // Add a random string used to hash tokens and sign cookies 
};

const handler = NextAuth(authOptions); // Call NextAuth and export a Next.js API Route 

export { handler as GET, handler as POST }; // Export the NextAuth handler 
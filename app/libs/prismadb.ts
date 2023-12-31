import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined;
}; // Prevent multiple instances of Prisma Client in development 

const client = globalThis.prisma || new PrismaClient(); // Create Prisma Client instance once

if (process.env.NODE_ENV !== "production") globalThis.prisma = client; // Enable Prisma Client DevTools in development 

export default client;
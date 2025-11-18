import { PrismaClient } from "@prisma/client";

// PrismaClient singleton for Next.js
// Prevents multiple instances during development hot-reloading

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Helper to safely disconnect
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

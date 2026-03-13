import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPoolConnectionString() {
  const url = process.env.DATABASE_URL!;
  return url.replace(/[?&]schema=[^&]+/, "");
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: getPoolConnectionString(),
    ssl: { rejectUnauthorized: false },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransactionClient = Parameters<Extract<Parameters<typeof prisma.$transaction>[0], (...args: any[]) => any>>[0];

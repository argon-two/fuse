import { PrismaClient } from "../generated/prisma/client";

export const prisma = new PrismaClient();

export async function disconnectPrisma() {
  await prisma.$disconnect();
}

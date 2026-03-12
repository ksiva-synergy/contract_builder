import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth";

async function seed() {
  console.log("Seeding users...");

  const users = [
    { email: "admin@cba.com", name: "Admin User", password: "admin123", role: "ADMIN" as const },
    { email: "initiator@cba.com", name: "Contract Initiator", password: "init123", role: "INITIATOR" as const },
    { email: "signer@cba.com", name: "Captain Signer", password: "sign123", role: "SIGNER" as const },
    { email: "reviewer@cba.com", name: "Legal Reviewer", password: "review123", role: "REVIEWER" as const },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`  User ${u.email} already exists, skipping`);
      continue;
    }

    await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        passwordHash: await hashPassword(u.password),
        role: u.role,
      },
    });
    console.log(`  Created ${u.role}: ${u.email}`);
  }

  console.log("Seed complete!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import "dotenv/config";

import { prisma } from "../lib/prisma";

async function main() {
  const adminEmail = "admin@dota.local";

  const admin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!admin) {
    throw new Error("Usuário administrador não encontrado.");
  }

  const team = await prisma.team.upsert({
    where: {
      slug: "main-team",
    },
    update: {},
    create: {
      name: "Main Team",
      slug: "main-team",
    },
  });

  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: admin.id,
        teamId: team.id,
      },
    },
    update: {
      role: "ADMIN",
    },
    create: {
      userId: admin.id,
      teamId: team.id,
      role: "ADMIN",
    },
  });

  console.log("Time inicial configurado com sucesso.");
  console.log(`Time: ${team.name}`);
  console.log(`Admin: ${admin.email}`);
  console.log("Role: ADMIN");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
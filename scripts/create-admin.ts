import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
  const email = "admin@dota.local";
  const password = "Admin123!";

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    console.log("Usuário administrador já existe.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: "Administrador",
      email,
      passwordHash,
    },
  });

  console.log("Usuário administrador criado com sucesso.");
  console.log(`Email: ${user.email}`);
  console.log(`Senha temporária: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
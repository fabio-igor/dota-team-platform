import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },

    select: {
      id: true,
      name: true,
      email: true,

      memberships: {
        select: {
          id: true,
          role: true,

          team: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },

          playerProfile: {
            select: {
              id: true,
              nickname: true,
              primaryPosition: true,
              secondaryPosition: true,
              steamAccountId: true,
              mmr: true,
            },
          },
        },
      },
    },
  });

  return user;
}
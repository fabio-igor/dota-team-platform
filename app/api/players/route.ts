import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 },
    );
  }

  const membership = user.memberships[0];

  if (!membership) {
    return NextResponse.json(
      { error: "Usuário sem time" },
      { status: 400 },
    );
  }

  const players = await prisma.playerProfile.findMany({
    where: {
      teamMember: {
        teamId: membership.team.id,
      },
    },

    include: {
      teamMember: {
        include: {
          user: true,
        },
      },
    },

    orderBy: {
      nickname: "asc",
    },
  });

  return NextResponse.json({
    players,
  });
}

export async function POST(request: Request) {
  const authContext = await requireRole([
    "ADMIN",
    "COACH",
  ]);

  if (!authContext) {
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 403 },
    );
  }

  const body = await request.json();

  const {
    name,
    nickname,
    email,
    steamAccountId,
    primaryPosition,
    secondaryPosition,
    mmr,
  } = body;

  if (
    typeof name !== "string" ||
    typeof nickname !== "string" ||
    typeof email !== "string" ||
    typeof primaryPosition !== "string"
  ) {
    return NextResponse.json(
      { error: "Dados inválidos" },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Já existe um usuário com este e-mail" },
      { status: 409 },
    );
  }

  const temporaryPassword = "Player123!";

  const passwordHash = await bcrypt.hash(
    temporaryPassword,
    12,
  );

  const player = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,

      memberships: {
        create: {
          role: "PLAYER",
          teamId: authContext.team.id,

          playerProfile: {
            create: {
              nickname: nickname.trim(),
              steamAccountId:
                typeof steamAccountId === "string" &&
                steamAccountId.trim()
                  ? steamAccountId.trim()
                  : null,

              primaryPosition,

              secondaryPosition:
                typeof secondaryPosition === "string" &&
                secondaryPosition
                  ? secondaryPosition
                  : null,

              mmr:
                typeof mmr === "number"
                  ? mmr
                  : null,
            },
          },
        },
      },
    },

    include: {
      memberships: {
        include: {
          playerProfile: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      player,
      temporaryPassword,
    },
    {
      status: 201,
    },
  );
}
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const validPositions = [
  "CARRY",
  "MID",
  "OFFLANE",
  "SUPPORT_4",
  "SUPPORT_5",
] as const;

type PlayerPosition = (typeof validPositions)[number];

function isValidPosition(
  value: unknown,
): value is PlayerPosition {
  return (
    typeof value === "string" &&
    validPositions.includes(value as PlayerPosition)
  );
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const authContext = await requireRole([
    "ADMIN",
    "COACH",
    "PLAYER",
  ]);

  if (!authContext) {
    return NextResponse.json(
      {
        error: "Acesso negado",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  const player = await prisma.playerProfile.findFirst({
    where: {
      id,
      teamMember: {
        teamId: authContext.team.id,
      },
    },
    include: {
      teamMember: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!player) {
    return NextResponse.json(
      {
        error: "Jogador não encontrado",
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    player,
  });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  const authContext = await requireRole([
    "ADMIN",
    "COACH",
  ]);

  if (!authContext) {
    return NextResponse.json(
      {
        error: "Acesso negado",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await context.params;

  const existingPlayer =
    await prisma.playerProfile.findFirst({
      where: {
        id,
        teamMember: {
          teamId: authContext.team.id,
        },
      },
      include: {
        teamMember: {
          include: {
            user: true,
          },
        },
      },
    });

  if (!existingPlayer) {
    return NextResponse.json(
      {
        error: "Jogador não encontrado",
      },
      {
        status: 404,
      },
    );
  }

  const body = await request.json();

  const {
    name,
    nickname,
    steamAccountId,
    primaryPosition,
    secondaryPosition,
    mmr,
  } = body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof nickname !== "string" ||
    !nickname.trim() ||
    !isValidPosition(primaryPosition)
  ) {
    return NextResponse.json(
      {
        error: "Dados inválidos",
      },
      {
        status: 400,
      },
    );
  }

  if (
    secondaryPosition !== null &&
    secondaryPosition !== "" &&
    !isValidPosition(secondaryPosition)
  ) {
    return NextResponse.json(
      {
        error: "Posição secundária inválida",
      },
      {
        status: 400,
      },
    );
  }

  const parsedMmr =
    mmr === null || mmr === ""
      ? null
      : Number(mmr);

  if (
    parsedMmr !== null &&
    (!Number.isInteger(parsedMmr) || parsedMmr < 0)
  ) {
    return NextResponse.json(
      {
        error: "MMR inválido",
      },
      {
        status: 400,
      },
    );
  }

  const updatedPlayer =
    await prisma.$transaction(async (transaction) => {
      await transaction.user.update({
        where: {
          id: existingPlayer.teamMember.user.id,
        },
        data: {
          name: name.trim(),
        },
      });

      return transaction.playerProfile.update({
        where: {
          id,
        },
        data: {
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

          mmr: parsedMmr,
        },
        include: {
          teamMember: {
            include: {
              user: true,
            },
          },
        },
      });
    });

  return NextResponse.json({
    player: updatedPlayer,
  });
}
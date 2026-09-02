import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { getStratzMatch } from "@/services/stratz/matches";

type RouteContext = {
  params: Promise<{
    matchId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const authContext =
    await requireRole([
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

  const { matchId } =
    await context.params;

  try {
    const match =
      await getStratzMatch(
        matchId,
      );

    return NextResponse.json({
      status: "ok",
      match,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao consultar STRATZ.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 502,
      },
    );
  }
}
import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";

export async function GET() {
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

  return NextResponse.json({
    status: "ok",
    message: "Acesso de staff permitido",
    role: authContext.membership.role,
    team: authContext.team.name,
  });
}
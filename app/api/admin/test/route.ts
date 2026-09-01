import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const authContext = await requireAdmin();

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
    message: "Acesso administrativo permitido",
    user: {
      id: authContext.user.id,
      name: authContext.user.name,
      email: authContext.user.email,
    },
    team: {
      id: authContext.team.id,
      name: authContext.team.name,
      slug: authContext.team.slug,
    },
  });
}
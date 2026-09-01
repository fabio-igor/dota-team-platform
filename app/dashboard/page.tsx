import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const membership = user.memberships[0];

  if (!membership) {
    return null;
  }

  const playersCount = await prisma.playerProfile.count({
    where: {
      teamMember: {
        teamId: membership.team.id,
      },
    },
  });

  return (
    <div>
      <div>
        <p className="text-sm text-zinc-400">
          Visão geral
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Acompanhe performance, partidas e indicadores do seu time.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Jogadores
          </p>

          <p className="mt-3 text-3xl font-bold">
            {playersCount}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Partidas analisadas
          </p>

          <p className="mt-3 text-3xl font-bold">
            0
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Win rate
          </p>

          <p className="mt-3 text-3xl font-bold">
            0%
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Treinos
          </p>

          <p className="mt-3 text-3xl font-bold">
            0
          </p>
        </div>
      </div>
    </div>
  );
}
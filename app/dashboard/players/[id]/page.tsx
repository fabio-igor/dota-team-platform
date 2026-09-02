import Link from "next/link";
import { notFound } from "next/navigation";

import OpenDotaProfile from "./opendota-profile";
import PlayerEditForm from "./player-edit-form";

import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";

function positionLabel(
  position: string | null,
) {
  if (!position) {
    return "Não informada";
  }

  const labels: Record<
    string,
    string
  > = {
    CARRY: "Carry / Pos 1",
    MID: "Mid / Pos 2",
    OFFLANE: "Offlane / Pos 3",
    SUPPORT_4: "Support / Pos 4",
    SUPPORT_5: "Support / Pos 5",
  };

  return labels[position] ?? position;
}

type PlayerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerPage({
  params,
}: PlayerPageProps) {
  const user =
    await getCurrentUser();

  if (!user) {
    return null;
  }

  const membership =
    user.memberships[0];

  if (!membership) {
    return null;
  }

  const { id } = await params;

  const player =
    await prisma.playerProfile.findFirst({
      where: {
        id,

        teamMember: {
          teamId:
            membership.team.id,
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
    notFound();
  }

  const canEdit =
    membership.role === "ADMIN" ||
    membership.role === "COACH";

  return (
    <div>
      <Link
        href="/dashboard/players"
        className="text-sm text-zinc-400 transition hover:text-white"
      >
        ← Voltar para jogadores
      </Link>

      <div className="mt-6">
        <p className="text-sm text-zinc-400">
          Perfil competitivo
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          {player.nickname}
        </h1>

        <p className="mt-2 text-zinc-400">
          {player.teamMember.user.name}
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          {player.teamMember.user.email}
        </p>

        {canEdit && (
          <PlayerEditForm
            player={{
              id: player.id,

              nickname:
                player.nickname,

              steamAccountId:
                player.steamAccountId,

              primaryPosition:
                player.primaryPosition,

              secondaryPosition:
                player.secondaryPosition,

              mmr:
                player.mmr,

              teamMember: {
                user: {
                  name:
                    player.teamMember.user
                      .name,
                },
              },
            }}
          />
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Posição principal
          </p>

          <p className="mt-2 font-semibold">
            {positionLabel(
              player.primaryPosition,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Posição secundária
          </p>

          <p className="mt-2 font-semibold">
            {positionLabel(
              player.secondaryPosition,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            MMR
          </p>

          <p className="mt-2 text-2xl font-bold">
            {player.mmr ?? "N/A"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Steam Account ID
          </p>

          <p className="mt-2 font-semibold">
            {player.steamAccountId ??
              "Não informado"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <OpenDotaProfile
          playerId={player.id}
          hasSteamAccountId={
            Boolean(
              player.steamAccountId,
            )
          }
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">
            Performance
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            KDA, GPM, XPM, dano, visão e partidas recentes serão adicionados na próxima etapa.
          </p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-semibold">
            Heróis e estratégia
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Hero pool, tendências, combinações e dados estratégicos serão enriquecidos posteriormente com STRATZ.
          </p>
        </section>
      </div>
    </div>
  );
}
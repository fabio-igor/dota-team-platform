import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";
import { prisma } from "@/lib/prisma";

import {
  getHeroImageUrl,
  getOpenDotaHeroes,
  getOpenDotaPlayer,
  getOpenDotaRecentMatches,
} from "@/services/opendota/client";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

function calculatePerformanceScore({
  kills,
  deaths,
  assists,
  gpm,
  xpm,
  duration,
  won,
}: {
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  duration: number;
  won: boolean;
}) {
  const kda =
    (kills + assists) /
    Math.max(deaths, 1);

  const kdaScore =
    clamp(kda / 5, 0, 1) *
    35;

  const gpmScore =
    clamp(
      (gpm - 250) / 500,
      0,
      1,
    ) * 25;

  const xpmScore =
    clamp(
      (xpm - 300) / 600,
      0,
      1,
    ) * 20;

  const minutes =
    Math.max(
      duration / 60,
      1,
    );

  const actionsPerMinute =
    (kills + assists) /
    minutes;

  const activityScore =
    clamp(
      actionsPerMinute / 0.6,
      0,
      1,
    ) * 10;

  const resultScore =
    won ? 10 : 0;

  const total =
    kdaScore +
    gpmScore +
    xpmScore +
    activityScore +
    resultScore;

  return Math.round(
    clamp(total, 0, 100),
  );
}

function getPerformanceLabel(
  score: number,
) {
  if (score >= 85) {
    return "Excelente";
  }

  if (score >= 70) {
    return "Muito boa";
  }

  if (score >= 55) {
    return "Boa";
  }

  if (score >= 40) {
    return "Regular";
  }

  if (score >= 25) {
    return "Ruim";
  }

  return "Muito ruim";
}

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

  const { id } =
    await context.params;

  const player =
    await prisma.playerProfile.findFirst({
      where: {
        id,
        teamMember: {
          teamId:
            authContext.team.id,
        },
      },

      select: {
        id: true,
        nickname: true,
        steamAccountId: true,
        primaryPosition: true,
      },
    });

  if (!player) {
    return NextResponse.json(
      {
        error:
          "Jogador não encontrado",
      },
      {
        status: 404,
      },
    );
  }

  if (!player.steamAccountId) {
    return NextResponse.json(
      {
        error:
          "Este jogador ainda não possui Steam Account ID.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const [
      openDotaPlayer,
      recentMatches,
      heroes,
    ] = await Promise.all([
      getOpenDotaPlayer(
        player.steamAccountId,
      ),

      getOpenDotaRecentMatches(
        player.steamAccountId,
      ),

      getOpenDotaHeroes(),
    ]);

    const heroMap =
      new Map(
        heroes.map((hero) => [
          hero.id,
          hero,
        ]),
      );

    const matches =
      recentMatches.map(
        (match) => {
          const hero =
            heroMap.get(
              match.hero_id,
            );

          const isRadiant =
            match.player_slot <
            128;

          const won =
            isRadiant ===
            match.radiant_win;

          const performanceScore =
            calculatePerformanceScore({
              kills:
                match.kills,

              deaths:
                match.deaths,

              assists:
                match.assists,

              gpm:
                match.gold_per_min,

              xpm:
                match.xp_per_min,

              duration:
                match.duration,

              won,
            });

          return {
            matchId:
              String(
                match.match_id,
              ),

            heroId:
              match.hero_id,

            heroName:
              hero?.localized_name ??
              `Herói ${match.hero_id}`,

            heroImageUrl:
              hero
                ? getHeroImageUrl(
                    hero.name,
                  )
                : null,

            result:
              won
                ? "WIN"
                : "LOSS",

            kills:
              match.kills,

            deaths:
              match.deaths,

            assists:
              match.assists,

            gpm:
              match.gold_per_min,

            xpm:
              match.xp_per_min,

            duration:
              match.duration,

            heroDamage:
              match.hero_damage ??
              null,

            towerDamage:
              match.tower_damage ??
              null,

            heroHealing:
              match.hero_healing ??
              null,

            lastHits:
              match.last_hits ??
              null,

            startTime:
              match.start_time ??
              null,

            performanceScore,

            performanceLabel:
              getPerformanceLabel(
                performanceScore,
              ),
          };
        },
      );

    const totalMatches =
      matches.length;

    const wins =
      matches.filter(
        (match) =>
          match.result === "WIN",
      ).length;

    const totalKills =
      matches.reduce(
        (total, match) =>
          total +
          match.kills,
        0,
      );

    const totalDeaths =
      matches.reduce(
        (total, match) =>
          total +
          match.deaths,
        0,
      );

    const totalAssists =
      matches.reduce(
        (total, match) =>
          total +
          match.assists,
        0,
      );

    const totalGpm =
      matches.reduce(
        (total, match) =>
          total +
          match.gpm,
        0,
      );

    const totalXpm =
      matches.reduce(
        (total, match) =>
          total +
          match.xpm,
        0,
      );

    const totalPerformance =
      matches.reduce(
        (total, match) =>
          total +
          match.performanceScore,
        0,
      );

    const summary =
      totalMatches > 0
        ? {
            matches:
              totalMatches,

            wins,

            losses:
              totalMatches -
              wins,

            winRate:
              Math.round(
                (wins /
                  totalMatches) *
                  1000,
              ) / 10,

            averageKda:
              Math.round(
                ((totalKills +
                  totalAssists) /
                  Math.max(
                    totalDeaths,
                    1,
                  )) *
                  100,
              ) / 100,

            averageGpm:
              Math.round(
                totalGpm /
                  totalMatches,
              ),

            averageXpm:
              Math.round(
                totalXpm /
                  totalMatches,
              ),

            averagePerformance:
              Math.round(
                totalPerformance /
                  totalMatches,
              ),
          }
        : {
            matches: 0,
            wins: 0,
            losses: 0,
            winRate: 0,
            averageKda: 0,
            averageGpm: 0,
            averageXpm: 0,
            averagePerformance: 0,
          };

    const heroPoolMap =
      new Map<
        number,
        {
          heroId: number;
          heroName: string;
          heroImageUrl: string | null;
          matches: number;
          wins: number;
          kills: number;
          deaths: number;
          assists: number;
          totalGpm: number;
          totalXpm: number;
          totalPerformance: number;
        }
      >();

    for (const match of matches) {
      const current =
        heroPoolMap.get(
          match.heroId,
        );

      if (current) {
        current.matches += 1;

        if (
          match.result ===
          "WIN"
        ) {
          current.wins += 1;
        }

        current.kills +=
          match.kills;

        current.deaths +=
          match.deaths;

        current.assists +=
          match.assists;

        current.totalGpm +=
          match.gpm;

        current.totalXpm +=
          match.xpm;

        current.totalPerformance +=
          match.performanceScore;

        continue;
      }

      heroPoolMap.set(
        match.heroId,
        {
          heroId:
            match.heroId,

          heroName:
            match.heroName,

          heroImageUrl:
            match.heroImageUrl,

          matches: 1,

          wins:
            match.result ===
            "WIN"
              ? 1
              : 0,

          kills:
            match.kills,

          deaths:
            match.deaths,

          assists:
            match.assists,

          totalGpm:
            match.gpm,

          totalXpm:
            match.xpm,

          totalPerformance:
            match.performanceScore,
        },
      );
    }

    const heroPool =
      Array.from(
        heroPoolMap.values(),
      )
        .map((hero) => ({
          heroId:
            hero.heroId,

          heroName:
            hero.heroName,

          heroImageUrl:
            hero.heroImageUrl,

          matches:
            hero.matches,

          wins:
            hero.wins,

          losses:
            hero.matches -
            hero.wins,

          winRate:
            Math.round(
              (hero.wins /
                hero.matches) *
                1000,
            ) / 10,

          averageKda:
            Math.round(
              ((hero.kills +
                hero.assists) /
                Math.max(
                  hero.deaths,
                  1,
                )) *
                100,
            ) / 100,

          averageGpm:
            Math.round(
              hero.totalGpm /
                hero.matches,
            ),

          averageXpm:
            Math.round(
              hero.totalXpm /
                hero.matches,
            ),

          averagePerformance:
            Math.round(
              hero.totalPerformance /
                hero.matches,
            ),
        }))
        .sort(
          (a, b) =>
            b.matches -
              a.matches ||
            b.averagePerformance -
              a.averagePerformance,
        );

    return NextResponse.json({
      player: {
        id: player.id,

        nickname:
          player.nickname,

        steamAccountId:
          player.steamAccountId,

        primaryPosition:
          player.primaryPosition,
      },

      openDota:
        openDotaPlayer,

      summary,

      heroPool,

      matches,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao consultar OpenDota.";

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
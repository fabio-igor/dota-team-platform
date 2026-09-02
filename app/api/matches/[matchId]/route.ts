import { NextResponse } from "next/server";

import { requireRole } from "@/lib/auth/require-role";

import {
  getHeroImageUrl,
  getOpenDotaHeroes,
  getOpenDotaMatch,
} from "@/services/opendota/client";

type RouteContext = {
  params: Promise<{
    matchId: string;
  }>;
};

type Side = "RADIANT" | "DIRE";

type KillLogEntry = {
  time: number;
  key: string;
};

type NormalizedPlayer = {
  accountId: number | null;
  playerSlot: number;
  side: Side;
  won: boolean;

  heroId: number;
  heroInternalName: string | null;
  heroName: string;
  heroImageUrl: string | null;

  personaname: string;

  kills: number;
  deaths: number;
  assists: number;

  killsLog: KillLogEntry[];

  gpm: number | null;
  xpm: number | null;

  heroDamage: number | null;
  towerDamage: number | null;
  heroHealing: number | null;

  lastHits: number | null;
  denies: number | null;

  lane: number | null;
  laneLabel: string;

  laneRole: number | null;
  laneRoleLabel: string;

  laneEfficiency: number | null;

  isRoaming: boolean | null;

  goldAt7: number | null;
  xpAt7: number | null;
  lastHitsAt7: number | null;
  deniesAt7: number | null;

  goldAt10: number | null;
  xpAt10: number | null;
  lastHitsAt10: number | null;
  deniesAt10: number | null;

  killParticipation: number | null;
  damagePerMinute: number | null;
};

function laneLabel(
  lane?: number | null,
) {
  const labels: Record<number, string> = {
    1: "Bottom",
    2: "Mid",
    3: "Top",
    4: "Jungle",
  };

  if (!lane) {
    return "Não informada";
  }

  return labels[lane] ?? `Lane ${lane}`;
}

function laneRoleLabel(
  laneRole?: number | null,
) {
  const labels: Record<number, string> = {
    1: "Safe",
    2: "Mid",
    3: "Off",
    4: "Jungle",
  };

  if (!laneRole) {
    return "Não informado";
  }

  return labels[laneRole] ?? `Lane Role ${laneRole}`;
}

function valueAtMinute(
  timeline: number[] | null | undefined,
  minute: number,
) {
  if (!timeline) {
    return null;
  }

  if (
    minute < 0 ||
    minute >= timeline.length
  ) {
    return null;
  }

  return timeline[minute] ?? null;
}

function sumNullable(
  values: Array<number | null>,
) {
  const validValues =
    values.filter(
      (value): value is number =>
        value !== null,
    );

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce(
    (total, value) =>
      total + value,
    0,
  );
}

function averageNullable(
  values: Array<number | null>,
) {
  const validValues =
    values.filter(
      (value): value is number =>
        value !== null,
    );

  if (validValues.length === 0) {
    return null;
  }

  return (
    validValues.reduce(
      (total, value) =>
        total + value,
      0,
    ) / validValues.length
  );
}

function normalizedDifference(
  first: number | null,
  second: number | null,
) {
  if (
    first === null ||
    second === null
  ) {
    return 0;
  }

  const denominator =
    Math.max(
      Math.abs(first),
      Math.abs(second),
      1,
    );

  return (
    (first - second) /
    denominator
  );
}

function heroKillsUntil(
  killsLog: KillLogEntry[],
  seconds: number,
) {
  return killsLog.filter(
    (kill) =>
      kill.time >= 0 &&
      kill.time <= seconds,
  ).length;
}

function laneKillsUntil(
  killsLog: KillLogEntry[],
  opponentHeroNames: string[],
  seconds: number,
) {
  return killsLog.filter(
    (kill) =>
      kill.time >= 0 &&
      kill.time <= seconds &&
      opponentHeroNames.includes(
        kill.key,
      ),
  ).length;
}

function buildLaneMetrics(
  players: NormalizedPlayer[],
  opponents: NormalizedPlayer[],
) {
  const opponentHeroNames =
    opponents
      .map(
        (player) =>
          player.heroInternalName,
      )
      .filter(
        (
          heroName,
        ): heroName is string =>
          heroName !== null,
      );

  const laneKillsAt7 =
    players.reduce(
      (total, player) =>
        total +
        laneKillsUntil(
          player.killsLog,
          opponentHeroNames,
          7 * 60,
        ),
      0,
    );

  const totalKillsAt7 =
    players.reduce(
      (total, player) =>
        total +
        heroKillsUntil(
          player.killsLog,
          7 * 60,
        ),
      0,
    );

  return {
    goldAt7:
      sumNullable(
        players.map(
          (player) =>
            player.goldAt7,
        ),
      ),

    xpAt7:
      sumNullable(
        players.map(
          (player) =>
            player.xpAt7,
        ),
      ),

    lastHitsAt7:
      sumNullable(
        players.map(
          (player) =>
            player.lastHitsAt7,
        ),
      ),

    deniesAt7:
      sumNullable(
        players.map(
          (player) =>
            player.deniesAt7,
        ),
      ),

    laneEfficiency:
      averageNullable(
        players.map(
          (player) =>
            player.laneEfficiency,
        ),
      ),

    laneKillsAt7,

    otherKillsAt7:
      Math.max(
        totalKillsAt7 -
          laneKillsAt7,
        0,
      ),
  };
}

function calculateLaneScore(
  first: ReturnType<
    typeof buildLaneMetrics
  >,
  second: ReturnType<
    typeof buildLaneMetrics
  >,
) {
  const goldScore =
    normalizedDifference(
      first.goldAt7,
      second.goldAt7,
    ) * 0.4;

  const xpScore =
    normalizedDifference(
      first.xpAt7,
      second.xpAt7,
    ) * 0.3;

  const lhScore =
    normalizedDifference(
      first.lastHitsAt7,
      second.lastHitsAt7,
    ) * 0.2;

  const deniesScore =
    normalizedDifference(
      first.deniesAt7,
      second.deniesAt7,
    ) * 0.05;

  const efficiencyScore =
    normalizedDifference(
      first.laneEfficiency,
      second.laneEfficiency,
    ) * 0.05;

  return (
    goldScore +
    xpScore +
    lhScore +
    deniesScore +
    efficiencyScore
  );
}

function classifyLane(
  score: number,
) {
  if (score >= 0.1) {
    return "WIN";
  }

  if (score <= -0.1) {
    return "LOSS";
  }

  return "EVEN";
}

function laneScoreValue(
  score: number,
) {
  return Math.round(
    score * 1000,
  ) / 10;
}

function buildLaneResult({
  name,
  radiantPlayers,
  direPlayers,
}: {
  name: string;
  radiantPlayers: NormalizedPlayer[];
  direPlayers: NormalizedPlayer[];
}) {
  const radiantMetrics =
    buildLaneMetrics(
      radiantPlayers,
      direPlayers,
    );

  const direMetrics =
    buildLaneMetrics(
      direPlayers,
      radiantPlayers,
    );

  const radiantRawScore =
    calculateLaneScore(
      radiantMetrics,
      direMetrics,
    );

  const radiantResult =
    classifyLane(
      radiantRawScore,
    );

  const direResult =
    radiantResult === "WIN"
      ? "LOSS"
      : radiantResult === "LOSS"
        ? "WIN"
        : "EVEN";

  return {
    name,

    radiant: {
      result:
        radiantResult,

      advantage:
        laneScoreValue(
          radiantRawScore,
        ),

      players:
        radiantPlayers.map(
          (player) => ({
            heroId:
              player.heroId,

            heroName:
              player.heroName,

            heroImageUrl:
              player.heroImageUrl,

            personaname:
              player.personaname,

            totalKillsAt7:
              heroKillsUntil(
                player.killsLog,
                7 * 60,
              ),

            laneKillsAt7:
              laneKillsUntil(
                player.killsLog,
                direPlayers
                  .map(
                    (opponent) =>
                      opponent.heroInternalName,
                  )
                  .filter(
                    (
                      heroName,
                    ): heroName is string =>
                      heroName !== null,
                  ),
                7 * 60,
              ),
          }),
        ),

      metrics:
        radiantMetrics,
    },

    dire: {
      result:
        direResult,

      advantage:
        laneScoreValue(
          -radiantRawScore,
        ),

      players:
        direPlayers.map(
          (player) => ({
            heroId:
              player.heroId,

            heroName:
              player.heroName,

            heroImageUrl:
              player.heroImageUrl,

            personaname:
              player.personaname,

            totalKillsAt7:
              heroKillsUntil(
                player.killsLog,
                7 * 60,
              ),

            laneKillsAt7:
              laneKillsUntil(
                player.killsLog,
                radiantPlayers
                  .map(
                    (opponent) =>
                      opponent.heroInternalName,
                  )
                  .filter(
                    (
                      heroName,
                    ): heroName is string =>
                      heroName !== null,
                  ),
                7 * 60,
              ),
          }),
        ),

      metrics:
        direMetrics,
    },
  };
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
        error:
          "Acesso negado",
      },
      {
        status: 403,
      },
    );
  }

  const { matchId } =
    await context.params;

  try {
    const [
      match,
      heroes,
    ] = await Promise.all([
      getOpenDotaMatch(
        matchId,
      ),

      getOpenDotaHeroes(),
    ]);

    const heroMap =
      new Map(
        heroes.map(
          (hero) => [
            hero.id,
            hero,
          ],
        ),
      );

    const radiantKills =
      match.radiant_score ?? 0;

    const direKills =
      match.dire_score ?? 0;

    const players: NormalizedPlayer[] =
      (match.players ?? []).map(
        (player) => {
          const hero =
            heroMap.get(
              player.hero_id,
            );

          const isRadiant =
            player.player_slot < 128;

          const side: Side =
            isRadiant
              ? "RADIANT"
              : "DIRE";

          const won =
            isRadiant ===
            match.radiant_win;

          const teamKills =
            isRadiant
              ? radiantKills
              : direKills;

          const killParticipation =
            teamKills > 0
              ? Math.round(
                  ((player.kills +
                    player.assists) /
                    teamKills) *
                    1000,
                ) / 10
              : null;

          const damagePerMinute =
            player.hero_damage !==
              null &&
            player.hero_damage !==
              undefined &&
            match.duration > 0
              ? Math.round(
                  player.hero_damage /
                    (match.duration /
                      60),
                )
              : null;

          return {
            accountId:
              player.account_id ??
              null,

            playerSlot:
              player.player_slot,

            side,

            won,

            heroId:
              player.hero_id,

            heroInternalName:
              hero?.name ??
              null,

            heroName:
              hero?.localized_name ??
              `Herói ${player.hero_id}`,

            heroImageUrl:
              hero
                ? getHeroImageUrl(
                    hero.name,
                  )
                : null,

            personaname:
              player.personaname ??
              "Desconhecido",

            kills:
              player.kills,

            deaths:
              player.deaths,

            assists:
              player.assists,

            killsLog:
              player.kills_log ??
              [],

            gpm:
              player.gold_per_min ??
              null,

            xpm:
              player.xp_per_min ??
              null,

            heroDamage:
              player.hero_damage ??
              null,

            towerDamage:
              player.tower_damage ??
              null,

            heroHealing:
              player.hero_healing ??
              null,

            lastHits:
              player.last_hits ??
              null,

            denies:
              player.denies ??
              null,

            lane:
              player.lane ??
              null,

            laneLabel:
              laneLabel(
                player.lane,
              ),

            laneRole:
              player.lane_role ??
              null,

            laneRoleLabel:
              laneRoleLabel(
                player.lane_role,
              ),

            laneEfficiency:
              player.lane_efficiency ??
              null,

            isRoaming:
              player.is_roaming ??
              null,

            goldAt7:
              valueAtMinute(
                player.gold_t,
                7,
              ),

            xpAt7:
              valueAtMinute(
                player.xp_t,
                7,
              ),

            lastHitsAt7:
              valueAtMinute(
                player.lh_t,
                7,
              ),

            deniesAt7:
              valueAtMinute(
                player.dn_t,
                7,
              ),

            goldAt10:
              valueAtMinute(
                player.gold_t,
                10,
              ),

            xpAt10:
              valueAtMinute(
                player.xp_t,
                10,
              ),

            lastHitsAt10:
              valueAtMinute(
                player.lh_t,
                10,
              ),

            deniesAt10:
              valueAtMinute(
                player.dn_t,
                10,
              ),

            killParticipation,

            damagePerMinute,
          };
        },
      );

    const radiantSafe =
      players.filter(
        (player) =>
          player.side ===
            "RADIANT" &&
          player.laneRole === 1,
      );

    const radiantMid =
      players.filter(
        (player) =>
          player.side ===
            "RADIANT" &&
          player.laneRole === 2,
      );

    const radiantOff =
      players.filter(
        (player) =>
          player.side ===
            "RADIANT" &&
          player.laneRole === 3,
      );

    const direSafe =
      players.filter(
        (player) =>
          player.side ===
            "DIRE" &&
          player.laneRole === 1,
      );

    const direMid =
      players.filter(
        (player) =>
          player.side ===
            "DIRE" &&
          player.laneRole === 2,
      );

    const direOff =
      players.filter(
        (player) =>
          player.side ===
            "DIRE" &&
          player.laneRole === 3,
      );

    const lanes =
      match.version
        ? [
            buildLaneResult({
              name:
                "Radiant Safe vs Dire Off",

              radiantPlayers:
                radiantSafe,

              direPlayers:
                direOff,
            }),

            buildLaneResult({
              name:
                "Mid",

              radiantPlayers:
                radiantMid,

              direPlayers:
                direMid,
            }),

            buildLaneResult({
              name:
                "Radiant Off vs Dire Safe",

              radiantPlayers:
                radiantOff,

              direPlayers:
                direSafe,
            }),
          ]
        : [];

    return NextResponse.json({
      match: {
        id:
          String(
            match.match_id,
          ),

        radiantWin:
          match.radiant_win,

        duration:
          match.duration,

        startTime:
          match.start_time ??
          null,

        radiantScore:
          match.radiant_score ??
          null,

        direScore:
          match.dire_score ??
          null,

        gameMode:
          match.game_mode ??
          null,

        lobbyType:
          match.lobby_type ??
          null,

        patch:
          match.patch ??
          null,

        parsed:
          Boolean(
            match.version,
          ),

        version:
          match.version ??
          null,

        laneMinute: 7,

        lanes,

        players,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao consultar partida.";

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
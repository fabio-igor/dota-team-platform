"use client";

import Link from "next/link";
import { useState } from "react";

type OpenDotaProfileProps = {
  playerId: string;
  hasSteamAccountId: boolean;
};

type OpenDotaMatch = {
  matchId: string;
  heroId: number;
  heroName: string;
  heroImageUrl: string | null;
  result: "WIN" | "LOSS";
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  xpm: number;
  duration: number;
  heroDamage: number | null;
  towerDamage: number | null;
  heroHealing: number | null;
  lastHits: number | null;
  startTime: number | null;
  performanceScore: number;
  performanceLabel: string;
};

type PlayerSummary = {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKda: number;
  averageGpm: number;
  averageXpm: number;
  averagePerformance: number;
};

type HeroPoolItem = {
  heroId: number;
  heroName: string;
  heroImageUrl: string | null;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKda: number;
  averageGpm: number;
  averageXpm: number;
  averagePerformance: number;
};

type OpenDotaResponse = {
  player?: {
    id: string;
    nickname: string;
    steamAccountId: string;
    primaryPosition: string;
  };

  openDota?: {
    rank_tier?: number | null;

    leaderboard_rank?: number | null;

    mmr_estimate?: {
      estimate?: number | null;
    };

    profile?: {
      account_id?: number;
      personaname?: string | null;
      name?: string | null;
      avatarfull?: string | null;
      profileurl?: string | null;
      loccountrycode?: string | null;
    };
  };

  summary?: PlayerSummary;

  heroPool?: HeroPoolItem[];

  matches?: OpenDotaMatch[];

  error?: string;
};

function rankLabel(
  rankTier?: number | null,
) {
  if (!rankTier) {
    return "Não informado";
  }

  const medal =
    Math.floor(
      rankTier / 10,
    );

  const stars =
    rankTier % 10;

  const medals: Record<number, string> = {
    1: "Herald",
    2: "Guardian",
    3: "Crusader",
    4: "Archon",
    5: "Legend",
    6: "Ancient",
    7: "Divine",
    8: "Immortal",
  };

  const medalName =
    medals[medal];

  if (!medalName) {
    return String(rankTier);
  }

  if (medal === 8) {
    return medalName;
  }

  return `${medalName} ${stars}`;
}

function formatDuration(
  duration: number,
) {
  const minutes =
    Math.floor(
      duration / 60,
    );

  const seconds =
    duration % 60;

  return `${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

function formatDate(
  timestamp: number | null,
) {
  if (!timestamp) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(
      timestamp * 1000,
    ),
  );
}

function performanceClasses(
  score: number,
) {
  if (score >= 70) {
    return "border-emerald-900 bg-emerald-950/40 text-emerald-400";
  }

  if (score >= 40) {
    return "border-amber-900 bg-amber-950/40 text-amber-400";
  }

  return "border-red-900 bg-red-950/40 text-red-400";
}

export default function OpenDotaProfile({
  playerId,
  hasSteamAccountId,
}: OpenDotaProfileProps) {
  const [data, setData] =
    useState<OpenDotaResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(false);

  async function loadOpenDota() {
    setLoading(true);
    setData(null);

    try {
      const response =
        await fetch(
          `/api/players/${playerId}/opendota`,
        );

      const json =
        await response.json();

      setData(json);
    } catch {
      setData({
        error:
          "Não foi possível consultar o OpenDota.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!hasSteamAccountId) {
    return (
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold">
          OpenDota
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Cadastre o Steam Account ID deste jogador para consultar os dados do OpenDota.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            OpenDota
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Perfil competitivo, hero pool e partidas recentes.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOpenDota}
          disabled={loading}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Consultando..."
            : "Atualizar OpenDota"}
        </button>
      </div>

      {data?.error && (
        <div className="mt-5 rounded-lg border border-zinc-700 bg-zinc-950 p-4">
          <p className="text-sm text-zinc-300">
            {data.error}
          </p>
        </div>
      )}

      {data?.openDota && (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Persona
              </p>

              <p className="mt-2 font-semibold">
                {data.openDota
                  .profile
                  ?.personaname ??
                  "Não informado"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Rank
              </p>

              <p className="mt-2 font-semibold">
                {rankLabel(
                  data.openDota.rank_tier,
                )}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                MMR estimado
              </p>

              <p className="mt-2 font-semibold">
                {data.openDota
                  .mmr_estimate
                  ?.estimate ??
                  "Não informado"}
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Leaderboard
              </p>

              <p className="mt-2 font-semibold">
                {data.openDota
                  .leaderboard_rank ??
                  "Não informado"}
              </p>
            </div>
          </div>

          {data.summary && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                Resumo de performance
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                Indicadores calculados a partir das partidas recentes disponíveis.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase text-zinc-500">
                    Partidas
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {data.summary.matches}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase text-zinc-500">
                    Win rate
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {data.summary.winRate}%
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {data.summary.wins}V /{" "}
                    {data.summary.losses}D
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase text-zinc-500">
                    KDA médio
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {data.summary.averageKda}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase text-zinc-500">
                    GPM médio
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {data.summary.averageGpm}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase text-zinc-500">
                    XPM médio
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {data.summary.averageXpm}
                  </p>
                </div>

                <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase text-zinc-500">
                    Score médio
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {data.summary.averagePerformance}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    de 100
                  </p>
                </div>
              </div>
            </div>
          )}

          {data.heroPool &&
            data.heroPool.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold">
                  Hero Pool recente
                </h3>

                <p className="mt-1 text-sm text-zinc-400">
                  Heróis agrupados a partir das partidas recentes disponíveis no OpenDota.
                </p>

                <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">
                          Herói
                        </th>

                        <th className="px-4 py-3">
                          Partidas
                        </th>

                        <th className="px-4 py-3">
                          Win rate
                        </th>

                        <th className="px-4 py-3">
                          KDA
                        </th>

                        <th className="px-4 py-3">
                          GPM
                        </th>

                        <th className="px-4 py-3">
                          XPM
                        </th>

                        <th className="px-4 py-3">
                          Score
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-zinc-800">
                      {data.heroPool.map(
                        (hero) => (
                          <tr
                            key={hero.heroId}
                            className="bg-zinc-900"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {hero.heroImageUrl && (
                                  <img
                                    src={
                                      hero.heroImageUrl
                                    }
                                    alt={
                                      hero.heroName
                                    }
                                    className="h-10 w-16 rounded object-cover"
                                  />
                                )}

                                <span className="font-medium">
                                  {hero.heroName}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              {hero.matches}
                            </td>

                            <td className="px-4 py-4">
                              <p className="font-medium">
                                {hero.winRate}%
                              </p>

                              <p className="text-xs text-zinc-500">
                                {hero.wins}V /{" "}
                                {hero.losses}D
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              {hero.averageKda}
                            </td>

                            <td className="px-4 py-4">
                              {hero.averageGpm}
                            </td>

                            <td className="px-4 py-4">
                              {hero.averageXpm}
                            </td>

                            <td className="px-4 py-4">
                              <div
                                className={`inline-flex rounded-lg border px-3 py-2 font-bold ${performanceClasses(
                                  hero.averagePerformance,
                                )}`}
                              >
                                {
                                  hero.averagePerformance
                                }
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold">
              Partidas recentes
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Clique no Match ID para abrir a análise detalhada da partida.
            </p>

            {!data.matches ||
            data.matches.length === 0 ? (
              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-sm text-zinc-400">
                  Nenhuma partida recente encontrada.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-800">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">
                        Herói
                      </th>

                      <th className="px-4 py-3">
                        Resultado
                      </th>

                      <th className="px-4 py-3">
                        Performance
                      </th>

                      <th className="px-4 py-3">
                        K / D / A
                      </th>

                      <th className="px-4 py-3">
                        GPM
                      </th>

                      <th className="px-4 py-3">
                        XPM
                      </th>

                      <th className="px-4 py-3">
                        Duração
                      </th>

                      <th className="px-4 py-3">
                        Data
                      </th>

                      <th className="px-4 py-3">
                        Match ID
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-800">
                    {data.matches.map(
                      (match) => (
                        <tr
                          key={match.matchId}
                          className="bg-zinc-900 transition hover:bg-zinc-800/60"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {match.heroImageUrl && (
                                <img
                                  src={
                                    match.heroImageUrl
                                  }
                                  alt={
                                    match.heroName
                                  }
                                  className="h-10 w-16 rounded object-cover"
                                />
                              )}

                              <span className="font-medium">
                                {match.heroName}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={
                                match.result ===
                                "WIN"
                                  ? "font-semibold text-emerald-400"
                                  : "font-semibold text-red-400"
                              }
                            >
                              {match.result ===
                              "WIN"
                                ? "Vitória"
                                : "Derrota"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <div
                              className={`inline-flex min-w-24 flex-col rounded-lg border px-3 py-2 ${performanceClasses(
                                match.performanceScore,
                              )}`}
                            >
                              <span className="text-lg font-bold">
                                {
                                  match.performanceScore
                                }
                              </span>

                              <span className="text-xs">
                                {
                                  match.performanceLabel
                                }
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {match.kills}
                            {" / "}
                            {match.deaths}
                            {" / "}
                            {match.assists}
                          </td>

                          <td className="px-4 py-4">
                            {match.gpm}
                          </td>

                          <td className="px-4 py-4">
                            {match.xpm}
                          </td>

                          <td className="px-4 py-4">
                            {formatDuration(
                              match.duration,
                            )}
                          </td>

                          <td className="px-4 py-4 text-zinc-400">
                            {formatDate(
                              match.startTime,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <Link
                              href={`/dashboard/matches/${match.matchId}`}
                              className="font-mono text-xs font-medium text-sky-400 transition hover:text-sky-300 hover:underline"
                            >
                              {match.matchId}
                            </Link>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
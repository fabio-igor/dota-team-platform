"use client";

import {
  useEffect,
  useState,
} from "react";

type MatchPlayer = {
  accountId: number | null;
  playerSlot: number;
  side: "RADIANT" | "DIRE";
  won: boolean;

  heroId: number;
  heroName: string;
  heroImageUrl: string | null;

  personaname: string;

  kills: number;
  deaths: number;
  assists: number;

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

type LaneHero = {
  heroId: number;
  heroName: string;
  heroImageUrl: string | null;
  personaname: string;

  totalKillsAt7: number;
  laneKillsAt7: number;
};

type LaneMetrics = {
  goldAt7: number | null;
  xpAt7: number | null;
  lastHitsAt7: number | null;
  deniesAt7: number | null;
  laneEfficiency: number | null;

  laneKillsAt7: number;
  otherKillsAt7: number;
};

type LaneSide = {
  result: "WIN" | "EVEN" | "LOSS";
  advantage: number;
  players: LaneHero[];
  metrics: LaneMetrics;
};

type LaneResult = {
  name: string;
  radiant: LaneSide;
  dire: LaneSide;
};

type MatchResponse = {
  match?: {
    id: string;

    radiantWin: boolean;

    duration: number;

    startTime: number | null;

    radiantScore: number | null;
    direScore: number | null;

    gameMode: number | null;
    lobbyType: number | null;

    patch: number | null;

    parsed: boolean;
    version: number | null;

    laneMinute: number;

    lanes: LaneResult[];

    players: MatchPlayer[];
  };

  error?: string;
};

type MatchDetailsProps = {
  matchId: string;
};

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

function formatLaneEfficiency(
  value: number | null,
) {
  if (value === null) {
    return "Não informado";
  }

  if (value <= 1) {
    return `${Math.round(
      value * 100,
    )}%`;
  }

  return `${Math.round(
    value,
  )}%`;
}

function laneResultLabel(
  result: "WIN" | "EVEN" | "LOSS",
) {
  if (result === "WIN") {
    return "Lane vencida";
  }

  if (result === "LOSS") {
    return "Lane perdida";
  }

  return "Lane equilibrada";
}

function laneResultClasses(
  result: "WIN" | "EVEN" | "LOSS",
) {
  if (result === "WIN") {
    return "border-emerald-900 bg-emerald-950/30 text-emerald-400";
  }

  if (result === "LOSS") {
    return "border-red-900 bg-red-950/30 text-red-400";
  }

  return "border-amber-900 bg-amber-950/30 text-amber-400";
}

function formatLaneScore(
  score: number,
) {
  if (score > 0) {
    return `+${score.toFixed(1)}`;
  }

  return score.toFixed(1);
}

function laneDominanceLabel(
  score: number,
) {
  if (score >= 25) {
    return "Domínio forte";
  }

  if (score >= 15) {
    return "Vitória clara";
  }

  if (score >= 10) {
    return "Vantagem";
  }

  if (score > -10) {
    return "Equilibrada";
  }

  if (score > -15) {
    return "Desvantagem";
  }

  if (score > -25) {
    return "Derrota clara";
  }

  return "Domínio adversário";
}

function laneDominanceClasses(
  score: number,
) {
  if (score >= 10) {
    return "text-emerald-400";
  }

  if (score > -10) {
    return "text-amber-400";
  }

  return "text-red-400";
}

export default function MatchDetails({
  matchId,
}: MatchDetailsProps) {
  const [
    data,
    setData,
  ] =
    useState<
      MatchResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      setLoading(true);

      try {
        const response =
          await fetch(
            `/api/matches/${matchId}`,
          );

        const json =
          await response.json();

        setData(json);
      } catch {
        setData({
          error:
            "Não foi possível carregar a partida.",
        });
      } finally {
        setLoading(false);
      }
    }

    loadMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-400">
          Carregando partida...
        </p>
      </div>
    );
  }

  if (
    !data?.match ||
    data.error
  ) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <p className="text-zinc-300">
          {data?.error ??
            "Partida não encontrada."}
        </p>
      </div>
    );
  }

  const match =
    data.match;

  const radiant =
    match.players.filter(
      (player) =>
        player.side ===
        "RADIANT",
    );

  const dire =
    match.players.filter(
      (player) =>
        player.side ===
        "DIRE",
    );

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Resultado
          </p>

          <p className="mt-2 text-xl font-bold">
            {match.radiantWin
              ? "Radiant venceu"
              : "Dire venceu"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Placar
          </p>

          <p className="mt-2 text-xl font-bold">
            {match.radiantScore ?? "?"}
            {" x "}
            {match.direScore ?? "?"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Duração
          </p>

          <p className="mt-2 text-xl font-bold">
            {formatDuration(
              match.duration,
            )}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Patch
          </p>

          <p className="mt-2 text-xl font-bold">
            {match.patch ??
              "Não informado"}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Replay parseado
          </p>

          <p
            className={
              match.parsed
                ? "mt-2 text-xl font-bold text-emerald-400"
                : "mt-2 text-xl font-bold text-amber-400"
            }
          >
            {match.parsed
              ? "Sim"
              : "Não"}
          </p>
        </div>
      </div>

      {match.parsed &&
        match.lanes.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold">
              Resultado das lanes
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Lane phase avaliada aos {match.laneMinute} minutos. Kills no oponente indicam apenas que um adversário daquele confronto foi abatido até esse momento, não necessariamente que a kill ocorreu dentro da lane.
            </p>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              {match.lanes.map(
                (lane) => (
                  <LaneCard
                    key={lane.name}
                    lane={lane}
                    minute={
                      match.laneMinute
                    }
                  />
                ),
              )}
            </div>
          </section>
        )}

      <TeamTable
        title="Radiant"
        players={radiant}
        won={match.radiantWin}
      />

      <TeamTable
        title="Dire"
        players={dire}
        won={!match.radiantWin}
      />
    </div>
  );
}

function LaneCard({
  lane,
  minute,
}: {
  lane: LaneResult;
  minute: number;
}) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="font-semibold">
        {lane.name}
      </h3>

      <div className="mt-5 space-y-5">
        <LaneSideCard
          title="Radiant"
          side={lane.radiant}
          minute={minute}
        />

        <div className="border-t border-zinc-800" />

        <LaneSideCard
          title="Dire"
          side={lane.dire}
          minute={minute}
        />
      </div>
    </article>
  );
}

function LaneSideCard({
  title,
  side,
  minute,
}: {
  title: string;
  side: LaneSide;
  minute: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Lane Score:{" "}
            <span className="font-semibold text-zinc-300">
              {formatLaneScore(
                side.advantage,
              )}
            </span>
          </p>

          <p
            className={`mt-1 text-xs font-semibold ${laneDominanceClasses(
              side.advantage,
            )}`}
          >
            {laneDominanceLabel(
              side.advantage,
            )}
          </p>
        </div>

        <span
          className={`rounded-lg border px-3 py-2 text-xs font-semibold ${laneResultClasses(
            side.result,
          )}`}
        >
          {laneResultLabel(
            side.result,
          )}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {side.players.map(
          (player) => (
            <div
              key={`${title}-${player.heroId}-${player.personaname}`}
              className="rounded-lg bg-zinc-950 px-2 py-2"
            >
              <div className="flex items-center gap-2">
                {player.heroImageUrl && (
                  <img
                    src={
                      player.heroImageUrl
                    }
                    alt={
                      player.heroName
                    }
                    className="h-8 w-12 rounded object-cover"
                  />
                )}

                <div>
                  <p className="text-xs font-medium">
                    {player.heroName}
                  </p>

                  <p className="text-[11px] text-zinc-500">
                    {player.personaname}
                  </p>
                </div>
              </div>

              <div className="mt-2 space-y-1 text-[11px]">
                <p className="text-zinc-400">
                  Kills no oponente @{minute}:{" "}
                  <span className="font-semibold text-zinc-200">
                    {player.laneKillsAt7}
                  </span>
                </p>

                {player.totalKillsAt7 >
                  player.laneKillsAt7 && (
                  <p className="text-zinc-500">
                    Kills em outros heróis @{minute}:{" "}
                    {player.totalKillsAt7 -
                      player.laneKillsAt7}
                  </p>
                )}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Metric
          label={`Gold @${minute}`}
          value={
            side.metrics.goldAt7
          }
        />

        <Metric
          label={`XP @${minute}`}
          value={
            side.metrics.xpAt7
          }
        />

        <Metric
          label={`LH @${minute}`}
          value={
            side.metrics.lastHitsAt7
          }
        />

        <Metric
          label={`DN @${minute}`}
          value={
            side.metrics.deniesAt7
          }
        />

        <Metric
          label={`Kills no oponente @${minute}`}
          value={
            side.metrics.laneKillsAt7
          }
        />

        <Metric
          label={`Kills em outros heróis @${minute}`}
          value={
            side.metrics.otherKillsAt7
          }
        />

        <Metric
          label="Lane Eff."
          value={
            formatLaneEfficiency(
              side.metrics.laneEfficiency,
            )
          }
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value:
    | number
    | string
    | null;
}) {
  return (
    <div className="rounded-lg bg-zinc-950 p-2">
      <p className="text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value ?? "N/A"}
      </p>
    </div>
  );
}

function TeamTable({
  title,
  players,
  won,
}: {
  title: string;
  players: MatchPlayer[];
  won: boolean;
}) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        <span
          className={
            won
              ? "text-sm font-semibold text-emerald-400"
              : "text-sm font-semibold text-red-400"
          }
        >
          {won
            ? "Vitória"
            : "Derrota"}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[1800px] text-left text-sm">
          <thead className="bg-zinc-950 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">
                Jogador
              </th>
              <th className="px-4 py-3">
                Herói
              </th>
              <th className="px-4 py-3">
                K / D / A
              </th>
              <th className="px-4 py-3">
                KP
              </th>
              <th className="px-4 py-3">
                GPM
              </th>
              <th className="px-4 py-3">
                XPM
              </th>
              <th className="px-4 py-3">
                LH / DN
              </th>
              <th className="px-4 py-3">
                Lane
              </th>
              <th className="px-4 py-3">
                Lane Role
              </th>
              <th className="px-4 py-3">
                Lane Eff.
              </th>
              <th className="px-4 py-3">
                Gold @7
              </th>
              <th className="px-4 py-3">
                XP @7
              </th>
              <th className="px-4 py-3">
                LH @7
              </th>
              <th className="px-4 py-3">
                DN @7
              </th>
              <th className="px-4 py-3">
                Gold @10
              </th>
              <th className="px-4 py-3">
                XP @10
              </th>
              <th className="px-4 py-3">
                Hero Damage
              </th>
              <th className="px-4 py-3">
                DPM
              </th>
              <th className="px-4 py-3">
                Tower Damage
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800">
            {players.map(
              (player) => (
                <tr
                  key={
                    player.playerSlot
                  }
                  className="bg-zinc-900"
                >
                  <td className="px-4 py-4">
                    {player.personaname}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {player.heroImageUrl && (
                        <img
                          src={
                            player.heroImageUrl
                          }
                          alt={
                            player.heroName
                          }
                          className="h-10 w-16 rounded object-cover"
                        />
                      )}

                      <span className="font-medium">
                        {player.heroName}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {player.kills}
                    {" / "}
                    {player.deaths}
                    {" / "}
                    {player.assists}
                  </td>

                  <td className="px-4 py-4">
                    {player.killParticipation !== null
                      ? `${player.killParticipation}%`
                      : "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.gpm ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.xpm ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.lastHits ?? "-"}
                    {" / "}
                    {player.denies ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.laneLabel}
                  </td>

                  <td className="px-4 py-4">
                    {player.laneRoleLabel}
                  </td>

                  <td className="px-4 py-4">
                    {formatLaneEfficiency(
                      player.laneEfficiency,
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {player.goldAt7 ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.xpAt7 ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.lastHitsAt7 ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.deniesAt7 ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.goldAt10 ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.xpAt10 ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.heroDamage ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.damagePerMinute ?? "-"}
                  </td>

                  <td className="px-4 py-4">
                    {player.towerDamage ?? "-"}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
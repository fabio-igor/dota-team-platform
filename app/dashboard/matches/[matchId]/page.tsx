import Link from "next/link";

import MatchDetails from "./match-details";

type MatchPageProps = {
  params: Promise<{
    matchId: string;
  }>;
};

export default async function MatchPage({
  params,
}: MatchPageProps) {
  const { matchId } =
    await params;

  return (
    <div>
      <Link
        href="/dashboard/players"
        className="text-sm text-zinc-400 transition hover:text-white"
      >
        ← Voltar
      </Link>

      <div className="mt-6">
        <p className="text-sm text-zinc-400">
          Análise de partida
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Match {matchId}
        </h1>
      </div>

      <div className="mt-8">
        <MatchDetails
          matchId={matchId}
        />
      </div>
    </div>
  );
}
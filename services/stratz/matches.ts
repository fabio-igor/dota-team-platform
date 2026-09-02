import { stratzQuery } from "@/services/stratz/client";

type StratzMatchPlayer = {
  steamAccountId: number | null;
  heroId: number;
  position: string | null;
  imp: number | null;

  kills: number;
  deaths: number;
  assists: number;

  goldPerMinute: number;
  experiencePerMinute: number;
};

type StratzMatch = {
  id: number;
  didRadiantWin: boolean;
  durationSeconds: number;

  players: StratzMatchPlayer[];
};

type StratzMatchResponse = {
  match: StratzMatch | null;
};

const MATCH_QUERY = `
  query Match($matchId: Long!) {
    match(id: $matchId) {
      id
      didRadiantWin
      durationSeconds

      players {
        steamAccountId
        heroId
        position
        imp

        kills
        deaths
        assists

        goldPerMinute
        experiencePerMinute
      }
    }
  }
`;

export async function getStratzMatch(
  matchId: string,
) {
  const normalizedMatchId =
    matchId.trim();

  if (!/^\d+$/.test(normalizedMatchId)) {
    throw new Error(
      "Match ID inválido.",
    );
  }

  const data =
    await stratzQuery<StratzMatchResponse>(
      MATCH_QUERY,
      {
        matchId: normalizedMatchId,
      },
    );

  if (!data.match) {
    throw new Error(
      "Partida não encontrada no STRATZ.",
    );
  }

  return data.match;
}
const OPENDOTA_BASE_URL =
  "https://api.opendota.com/api";

export type OpenDotaPlayer = {
  tracked_until?: string | null;
  solo_competitive_rank?: number | null;
  competitive_rank?: number | null;
  rank_tier?: number | null;
  leaderboard_rank?: number | null;

  mmr_estimate?: {
    estimate?: number | null;
  };

  profile?: {
    account_id?: number;
    personaname?: string | null;
    name?: string | null;
    plus?: boolean;
    cheese?: number;
    steamid?: string | null;
    avatar?: string | null;
    avatarmedium?: string | null;
    avatarfull?: string | null;
    profileurl?: string | null;
    last_login?: string | null;
    loccountrycode?: string | null;
    is_contributor?: boolean;
    is_subscriber?: boolean;
  };
};

export type OpenDotaRecentMatch = {
  match_id: number;
  player_slot: number;
  radiant_win: boolean;
  hero_id: number;

  kills: number;
  deaths: number;
  assists: number;

  duration: number;

  gold_per_min: number;
  xp_per_min: number;

  hero_damage?: number | null;
  tower_damage?: number | null;
  hero_healing?: number | null;

  last_hits?: number | null;

  start_time?: number | null;

  average_rank?: number | null;
};

export type OpenDotaHero = {
  id: number;
  name: string;
  localized_name: string;
  primary_attr?: string;
  attack_type?: string;
  roles?: string[];
};

export type OpenDotaKillLogEntry = {
  time: number;
  key: string;
};

export type OpenDotaMatchPlayer = {
  account_id?: number | null;
  player_slot: number;
  hero_id: number;

  kills: number;
  deaths: number;
  assists: number;

  gold_per_min?: number | null;
  xp_per_min?: number | null;

  hero_damage?: number | null;
  tower_damage?: number | null;
  hero_healing?: number | null;

  last_hits?: number | null;
  denies?: number | null;

  lane?: number | null;
  lane_role?: number | null;
  is_roaming?: boolean | null;

  lane_efficiency?: number | null;

  personaname?: string | null;

  gold_t?: number[] | null;
  xp_t?: number[] | null;
  lh_t?: number[] | null;
  dn_t?: number[] | null;

  kills_log?: OpenDotaKillLogEntry[] | null;
};

export type OpenDotaMatch = {
  match_id: number;
  radiant_win: boolean;
  duration: number;
  start_time?: number | null;

  radiant_score?: number | null;
  dire_score?: number | null;

  game_mode?: number | null;
  lobby_type?: number | null;

  patch?: number | null;

  version?: number | null;

  players?: OpenDotaMatchPlayer[];
};

function validateAccountId(
  accountId: string,
) {
  const normalizedAccountId =
    accountId.trim();

  if (!normalizedAccountId) {
    throw new Error(
      "Steam Account ID não informado.",
    );
  }

  if (!/^\d+$/.test(normalizedAccountId)) {
    throw new Error(
      "Steam Account ID inválido.",
    );
  }

  return normalizedAccountId;
}

function validateMatchId(
  matchId: string,
) {
  const normalizedMatchId =
    matchId.trim();

  if (!normalizedMatchId) {
    throw new Error(
      "Match ID não informado.",
    );
  }

  if (!/^\d+$/.test(normalizedMatchId)) {
    throw new Error(
      "Match ID inválido.",
    );
  }

  return normalizedMatchId;
}

async function handleOpenDotaResponse(
  response: Response,
) {
  if (response.ok) {
    return;
  }

  if (response.status === 404) {
    throw new Error(
      "Dados não encontrados no OpenDota.",
    );
  }

  if (response.status === 429) {
    throw new Error(
      "Limite de requisições do OpenDota atingido. Tente novamente mais tarde.",
    );
  }

  throw new Error(
    `Erro OpenDota: HTTP ${response.status}`,
  );
}

export async function getOpenDotaPlayer(
  accountId: string,
): Promise<OpenDotaPlayer> {
  const normalizedAccountId =
    validateAccountId(accountId);

  const response = await fetch(
    `${OPENDOTA_BASE_URL}/players/${normalizedAccountId}`,
    {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 300,
      },
    },
  );

  await handleOpenDotaResponse(response);

  return response.json();
}

export async function getOpenDotaRecentMatches(
  accountId: string,
): Promise<OpenDotaRecentMatch[]> {
  const normalizedAccountId =
    validateAccountId(accountId);

  const response = await fetch(
    `${OPENDOTA_BASE_URL}/players/${normalizedAccountId}/recentMatches`,
    {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 300,
      },
    },
  );

  await handleOpenDotaResponse(response);

  return response.json();
}

export async function getOpenDotaMatch(
  matchId: string,
): Promise<OpenDotaMatch> {
  const normalizedMatchId =
    validateMatchId(matchId);

  const response = await fetch(
    `${OPENDOTA_BASE_URL}/matches/${normalizedMatchId}`,
    {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 300,
      },
    },
  );

  await handleOpenDotaResponse(response);

  return response.json();
}

export async function getOpenDotaHeroes(): Promise<
  OpenDotaHero[]
> {
  const response = await fetch(
    `${OPENDOTA_BASE_URL}/heroes`,
    {
      headers: {
        Accept: "application/json",
      },

      next: {
        revalidate: 86400,
      },
    },
  );

  await handleOpenDotaResponse(response);

  return response.json();
}

export function getHeroImageUrl(
  heroName: string,
) {
  const slug = heroName.replace(
    "npc_dota_hero_",
    "",
  );

  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;
}
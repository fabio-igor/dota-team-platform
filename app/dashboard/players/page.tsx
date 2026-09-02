"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Player = {
  id: string;
  nickname: string;
  steamAccountId: string | null;
  primaryPosition: string;
  secondaryPosition: string | null;
  mmr: number | null;

  teamMember: {
    user: {
      name: string;
      email: string;
    };
  };
};

const positions = [
  { value: "CARRY", label: "Carry / Pos 1" },
  { value: "MID", label: "Mid / Pos 2" },
  { value: "OFFLANE", label: "Offlane / Pos 3" },
  { value: "SUPPORT_4", label: "Support / Pos 4" },
  { value: "SUPPORT_5", label: "Support / Pos 5" },
];

function positionLabel(position: string | null) {
  if (!position) {
    return "Não informada";
  }

  const labels: Record<string, string> = {
    CARRY: "Carry / Pos 1",
    MID: "Mid / Pos 2",
    OFFLANE: "Offlane / Pos 3",
    SUPPORT_4: "Support / Pos 4",
    SUPPORT_5: "Support / Pos 5",
  };

  return labels[position] ?? position;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadPlayers() {
    setLoading(true);

    const response = await fetch("/api/players");
    const data = await response.json();

    if (response.ok) {
      setPlayers(data.players);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const mmrValue = formData.get("mmr");

    const response = await fetch("/api/players", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        nickname: formData.get("nickname"),
        email: formData.get("email"),
        steamAccountId: formData.get("steamAccountId"),
        primaryPosition: formData.get("primaryPosition"),
        secondaryPosition: formData.get("secondaryPosition"),
        mmr:
          typeof mmrValue === "string" && mmrValue
            ? Number(mmrValue)
            : null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Erro ao cadastrar jogador");
      return;
    }

    setMessage(
      `Jogador cadastrado. Senha temporária: ${data.temporaryPassword}`,
    );

    form.reset();

    await loadPlayers();
  }

  return (
    <div>
      <div>
        <p className="text-sm text-zinc-400">
          Gestão de elenco
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Jogadores
        </h1>

        <p className="mt-2 text-zinc-400">
          Cadastre e acompanhe os jogadores vinculados ao time.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <h2 className="text-lg font-semibold">
            Adicionar jogador
          </h2>

          <input
            name="name"
            placeholder="Nome"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />

          <input
            name="nickname"
            placeholder="Nickname"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />

          <input
            name="email"
            type="email"
            placeholder="E-mail"
            required
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />

          <input
            name="steamAccountId"
            placeholder="Steam Account ID"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />

          <select
            name="primaryPosition"
            required
            defaultValue=""
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          >
            <option value="" disabled>
              Posição principal
            </option>

            {positions.map((position) => (
              <option
                key={position.value}
                value={position.value}
              >
                {position.label}
              </option>
            ))}
          </select>

          <select
            name="secondaryPosition"
            defaultValue=""
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          >
            <option value="">
              Sem posição secundária
            </option>

            {positions.map((position) => (
              <option
                key={position.value}
                value={position.value}
              >
                {position.label}
              </option>
            ))}
          </select>

          <input
            name="mmr"
            type="number"
            min="0"
            placeholder="MMR"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200"
          >
            Cadastrar jogador
          </button>

          {message && (
            <p className="text-sm text-zinc-300">
              {message}
            </p>
          )}
        </form>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="border-b border-zinc-800 p-5">
            <h2 className="font-semibold">
              Elenco
            </h2>
          </div>

          {loading ? (
            <p className="p-5 text-zinc-400">
              Carregando...
            </p>
          ) : players.length === 0 ? (
            <p className="p-5 text-zinc-400">
              Nenhum jogador cadastrado.
            </p>
          ) : (
            <div className="divide-y divide-zinc-800">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <Link
                      href={`/dashboard/players/${player.id}`}
                      className="font-semibold transition hover:text-zinc-300 hover:underline"
                    >
                      {player.nickname}
                    </Link>

                    <p className="text-sm text-zinc-400">
                      {player.teamMember.user.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {player.teamMember.user.email}
                    </p>
                  </div>

                  <div className="grid gap-1 text-right">
                    <p className="text-sm font-medium">
                      {positionLabel(player.primaryPosition)}
                    </p>

                    <p className="text-xs text-zinc-400">
                      Secundária:{" "}
                      {positionLabel(player.secondaryPosition)}
                    </p>

                    <p className="text-xs text-zinc-400">
                      MMR: {player.mmr ?? "Não informado"}
                    </p>

                    <p className="text-xs text-zinc-500">
                      Steam ID:{" "}
                      {player.steamAccountId ?? "Não informado"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
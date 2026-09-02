"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type PlayerEditFormProps = {
  player: {
    id: string;
    nickname: string;
    steamAccountId: string | null;
    primaryPosition: string;
    secondaryPosition: string | null;
    mmr: number | null;

    teamMember: {
      user: {
        name: string;
      };
    };
  };
};

const positions = [
  {
    value: "CARRY",
    label: "Carry / Pos 1",
  },
  {
    value: "MID",
    label: "Mid / Pos 2",
  },
  {
    value: "OFFLANE",
    label: "Offlane / Pos 3",
  },
  {
    value: "SUPPORT_4",
    label: "Support / Pos 4",
  },
  {
    value: "SUPPORT_5",
    label: "Support / Pos 5",
  },
];

export default function PlayerEditForm({
  player,
}: PlayerEditFormProps) {
  const router = useRouter();

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const mmrValue = formData.get("mmr");

    const response = await fetch(
      `/api/players/${player.id}`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: formData.get("name"),
          nickname: formData.get("nickname"),

          steamAccountId:
            formData.get("steamAccountId"),

          primaryPosition:
            formData.get("primaryPosition"),

          secondaryPosition:
            formData.get("secondaryPosition"),

          mmr:
            typeof mmrValue === "string" &&
            mmrValue
              ? Number(mmrValue)
              : null,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(
        data.error ??
          "Erro ao atualizar jogador",
      );

      setSaving(false);

      return;
    }

    setMessage(
      "Jogador atualizado com sucesso.",
    );

    setSaving(false);
    setEditing(false);

    router.refresh();
  }

  if (!editing) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setMessage("");
          }}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Editar jogador
        </button>

        {message && (
          <p className="mt-3 text-sm text-zinc-300">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 max-w-2xl space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6"
    >
      <div>
        <h2 className="text-lg font-semibold">
          Editar jogador
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Atualize os dados competitivos do jogador.
        </p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm text-zinc-300"
        >
          Nome
        </label>

        <input
          id="name"
          name="name"
          defaultValue={
            player.teamMember.user.name
          }
          required
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="nickname"
          className="mb-1 block text-sm text-zinc-300"
        >
          Nickname
        </label>

        <input
          id="nickname"
          name="nickname"
          defaultValue={player.nickname}
          required
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="steamAccountId"
          className="mb-1 block text-sm text-zinc-300"
        >
          Steam Account ID
        </label>

        <input
          id="steamAccountId"
          name="steamAccountId"
          defaultValue={
            player.steamAccountId ?? ""
          }
          placeholder="Ex: 123456789"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </div>

      <div>
        <label
          htmlFor="primaryPosition"
          className="mb-1 block text-sm text-zinc-300"
        >
          Posição principal
        </label>

        <select
          id="primaryPosition"
          name="primaryPosition"
          defaultValue={
            player.primaryPosition
          }
          required
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        >
          {positions.map((position) => (
            <option
              key={position.value}
              value={position.value}
            >
              {position.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="secondaryPosition"
          className="mb-1 block text-sm text-zinc-300"
        >
          Posição secundária
        </label>

        <select
          id="secondaryPosition"
          name="secondaryPosition"
          defaultValue={
            player.secondaryPosition ?? ""
          }
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
      </div>

      <div>
        <label
          htmlFor="mmr"
          className="mb-1 block text-sm text-zinc-300"
        >
          MMR
        </label>

        <input
          id="mmr"
          name="mmr"
          type="number"
          min="0"
          defaultValue={
            player.mmr ?? ""
          }
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Salvando..."
            : "Salvar alterações"}
        </button>

        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setMessage("");
          }}
          disabled={saving}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
        >
          Cancelar
        </button>
      </div>

      {message && (
        <p className="text-sm text-zinc-300">
          {message}
        </p>
      )}
    </form>
  );
}
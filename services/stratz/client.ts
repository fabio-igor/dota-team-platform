const STRATZ_GRAPHQL_URL =
  "https://api.stratz.com/graphql";

type StratzGraphQLResponse<T> = {
  data?: T;

  errors?: Array<{
    message: string;
  }>;
};

export async function stratzQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const token =
    process.env.STRATZ_API_TOKEN;

  if (!token) {
    throw new Error(
      "STRATZ_API_TOKEN não está configurado.",
    );
  }

  const response = await fetch(
    STRATZ_GRAPHQL_URL,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Dota-Team-Platform/1.0",
      },

      body: JSON.stringify({
        query,
        variables,
      }),

      cache: "no-store",
    },
  );

  const responseText =
    await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "STRATZ retornou 401. Token inválido ou não autorizado.",
      );
    }

    if (response.status === 403) {
      throw new Error(
        `STRATZ retornou 403. Resposta: ${responseText.slice(
          0,
          500,
        )}`,
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Limite de requisições do STRATZ atingido.",
      );
    }

    throw new Error(
      `Erro STRATZ HTTP ${response.status}. Resposta: ${responseText.slice(
        0,
        500,
      )}`,
    );
  }

  let result: StratzGraphQLResponse<T>;

  try {
    result =
      JSON.parse(
        responseText,
      ) as StratzGraphQLResponse<T>;
  } catch {
    throw new Error(
      `STRATZ retornou uma resposta inválida: ${responseText.slice(
        0,
        500,
      )}`,
    );
  }

  if (result.errors?.length) {
    throw new Error(
      result.errors
        .map(
          (error) =>
            error.message,
        )
        .join(" | "),
    );
  }

  if (!result.data) {
    throw new Error(
      "STRATZ não retornou dados.",
    );
  }

  return result.data;
}
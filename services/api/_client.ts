import { settings } from "@/config";

/** Erros de validação no formato `{"errors": {"campo": ["mensagem"]}}` (422). */
export type ApiFieldErrors = Record<string, string[]>;

/** Falha HTTP da API, com o corpo já interpretado quando for JSON. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: ApiFieldErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const BASE_URL = settings.API_URL.replace(/\/+$/, "");

type SessionBridge = {
  /** Chamado quando uma rota autenticada responde `401`: o servidor não aceita mais o token. */
  onUnauthorized: () => void;
};

let session: SessionBridge | null = null;

/** Liga o cliente ao store de sessão sem que este arquivo importe o store. */
export const bindSession = (bridge: SessionBridge) => {
  session = bridge;
};

/**
 * Só entradas com lista de mensagens são erros de campo. O Phoenix responde
 * rotas inexistentes e falhas internas com `{"errors": {"detail": "Not Found"}}`,
 * que não é de nenhum campo do formulário.
 */
const parseFieldErrors = (errors: unknown): ApiFieldErrors =>
  errors && typeof errors === "object"
    ? Object.fromEntries(
        Object.entries(errors).filter(
          (entry): entry is [string, string[]] =>
            Array.isArray(entry[1]) && entry[1].every((message) => typeof message === "string"),
        ),
      )
    : {};

/**
 * `fetch` com JSON nos dois sentidos. Respostas fora de 2xx viram `ApiError`
 * com a mensagem de `{"error": ...}` ou os erros de campo de `{"errors": ...}`.
 */
export const request = async <T>(
  path: string,
  { body, token, method = body === undefined ? "GET" : "POST" }: {
    body?: unknown;
    token?: string;
    method?: string;
  } = {},
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token) session?.onUnauthorized();
    throw new ApiError(
      response.status,
      typeof data?.error === "string" ? data.error : `Erro ${response.status}`,
      parseFieldErrors(data?.errors),
    );
  }

  return data as T;
};

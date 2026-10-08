import { ApiError } from "@/services";

export const NETWORK_ERROR = "Não foi possível conectar ao servidor. Tente novamente.";
export const SESSION_EXPIRED = "Sua sessão expirou. Entre novamente.";

const FIELD_LABELS: Record<string, string> = {
  full_name: "Nome",
  username: "Nickname",
  email: "E-mail",
  password: "Senha",
};

/**
 * Mensagem de um erro de requisição para o usuário: `fallback` quando a API não
 * respondeu, sessão expirada no `401` e, nos demais casos, a mensagem da API.
 */
export const describeApiError = (error: unknown, fallback = NETWORK_ERROR) => {
  if (!(error instanceof ApiError)) return fallback;
  return error.status === 401 ? SESSION_EXPIRED : error.message;
};

/**
 * Primeiro erro de campo de um `422`, como frase pronta ("E-mail já está em uso.").
 * `null` quando o erro não traz erros de campo.
 */
export const firstFieldError = (error: unknown) => {
  if (!(error instanceof ApiError)) return null;
  const [field, messages] = Object.entries(error.fieldErrors)[0] ?? [];
  if (!field) return null;
  return { field, message: `${FIELD_LABELS[field] ?? field} ${messages[0] ?? "inválido"}.` };
};

/** Primeira mensagem de cada campo de um `422`, por nome do campo. */
export const fieldErrorMap = (error: unknown): Record<string, string> =>
  error instanceof ApiError
    ? Object.fromEntries(
        Object.entries(error.fieldErrors).map(([field, messages]) => [field, messages[0]]),
      )
    : {};

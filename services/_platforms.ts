import type { PlatformSlug } from "@/constants";
import { apiRequest } from "./_api";

/** Conta vinculada como `ApiJSON.platform_account/1` a serializa. */
export type PlatformAccount = {
  platform: PlatformSlug;
  external_user_id: string;
  profile_url: string | null;
  sync_status: string;
};

/** Resposta de `POST /api/platforms/:slug/verification-code` (PSN e RetroAchievements). */
export type VerificationCode = {
  code: string;
  /** Token assinado que amarra o código ao perfil; volta no `connect`. */
  verification_token: string;
  /** Validade do token, em segundos. */
  expires_in: number;
};

/** Corpo de `POST /api/platforms/:slug/connect`. */
export type OwnershipPayload = {
  /** PSN ID ou usuário do RetroAchievements. */
  username: string;
  /** NPSSO ou Web API Key do RetroAchievements. */
  api_key: string;
  verification_token: string;
};

export const list = (token: string) =>
  apiRequest<{ platforms: PlatformAccount[] }>("/api/platforms", { token });

/**
 * URL de autorização da Steam (OpenID, exige a Web API Key) ou do Xbox (OAuth).
 * O callback do backend redireciona para o deep link `prisma://connect`.
 */
export const connectUrl = (slug: "steam" | "xbox", token: string, apiKey?: string) =>
  apiRequest<{ url: string }>(`/api/platforms/${slug}/connect-url`, {
    token,
    method: "POST",
    body: apiKey === undefined ? undefined : { api_key: apiKey },
  });

export const verificationCode = (slug: PlatformSlug, token: string) =>
  apiRequest<VerificationCode>(`/api/platforms/${slug}/verification-code`, {
    token,
    method: "POST",
  });

/** Valida credenciais e o código no perfil antes de vincular. */
export const connect = (slug: PlatformSlug, token: string, payload: OwnershipPayload) =>
  apiRequest<{ platform: PlatformAccount }>(`/api/platforms/${slug}/connect`, {
    token,
    body: payload,
  });

/** `204` também quando a conta já não estava vinculada; `409` com sync em andamento. */
export const disconnect = (slug: PlatformSlug, token: string) =>
  apiRequest<null>(`/api/platforms/${slug}`, { token, method: "DELETE" });

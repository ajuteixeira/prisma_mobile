import type { PlatformSlug } from "@/constants";
import { request } from "./_client";
import type { OwnershipPayload, PlatformAccount, VerificationCode } from "./types";

export const platformsApi = {
  list: (token: string) => request<{ platforms: PlatformAccount[] }>("/api/platforms", { token }),

  /**
   * URL de autorização da Steam (OpenID, exige a Web API Key) ou do Xbox (OAuth).
   * O callback do backend redireciona para o deep link `prisma://connect`.
   */
  connectUrl: (slug: "steam" | "xbox", token: string, apiKey?: string) =>
    request<{ url: string }>(`/api/platforms/${slug}/connect-url`, {
      token,
      method: "POST",
      body: apiKey === undefined ? undefined : { api_key: apiKey },
    }),

  verificationCode: (slug: PlatformSlug, token: string) =>
    request<VerificationCode>(`/api/platforms/${slug}/verification-code`, {
      token,
      method: "POST",
    }),

  /** Valida credenciais e o código no perfil antes de vincular. */
  connect: (slug: PlatformSlug, token: string, payload: OwnershipPayload) =>
    request<{ platform: PlatformAccount }>(`/api/platforms/${slug}/connect`, {
      token,
      body: payload,
    }),

  /** `204` também quando a conta já não estava vinculada; `409` com sync em andamento. */
  disconnect: (slug: PlatformSlug, token: string) =>
    request<null>(`/api/platforms/${slug}`, { token, method: "DELETE" }),
};

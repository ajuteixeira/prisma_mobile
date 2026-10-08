import { settings } from "@/config";
import { request } from "./_client";
import type {
  ApiUser,
  ProfileCardData,
  ProfileStatsResponse,
  ProfileUpdatePayload,
} from "./types";

export const profileApi = {
  /** Bio, avatar, seguidores/seguindo e conquistas fixadas do usuário logado. */
  me: (token: string) => request<{ profile: ProfileCardData }>("/api/profile", { token }),

  /** Estatísticas e troféus por plataforma do usuário logado. */
  stats: (token: string) => request<ProfileStatsResponse>("/api/profile/stats", { token }),

  /** URL do perfil público na versão web (`GET /:username`). */
  publicUrl: (username: string) =>
    `${settings.API_URL.replace(/\/+$/, "")}/${encodeURIComponent(username)}`,

  /** Altera só as chaves enviadas; `422` traz os erros por campo. */
  update: (token: string, payload: ProfileUpdatePayload) =>
    request<{ profile: ProfileCardData; user: ApiUser }>("/api/profile", {
      token,
      method: "PATCH",
      body: payload,
    }),
};

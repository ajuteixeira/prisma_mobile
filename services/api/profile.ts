import { settings } from "@/config";
import { request } from "./_client";
import type {
  ApiUser,
  ProfileCardData,
  ProfileStatsResponse,
  ProfileUpdatePayload,
  RecentGame,
  RecentlyPlayed,
} from "./types";

type RecentlyPlayedResponse = {
  recently_played?: unknown;
  total?: unknown;
};

const text = (value: unknown) => (typeof value === "string" && value ? value : null);
const count = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** Lê um jogo sem confiar no formato: campo ausente ou com outro tipo vira `null`/0. */
const toRecentGame = (raw: unknown, index: number): RecentGame => {
  const game = (raw ?? {}) as Record<string, unknown>;
  const platform = (game.platform ?? {}) as Record<string, unknown>;
  const slug = text(platform.slug);

  return {
    id: count(game.id) ?? index,
    name: text(game.name) ?? "Jogo sem nome",
    cover_url: text(game.cover_url),
    platform: slug ? { slug, name: text(platform.name) ?? slug } : null,
    playtime_minutes: count(game.playtime_minutes),
    last_played_at: text(game.last_played_at),
    unlocked_achievements: count(game.unlocked_achievements) ?? 0,
    total_achievements: count(game.total_achievements) ?? 0,
  };
};

export const profileApi = {
  /** Bio, avatar, seguidores/seguindo e conquistas fixadas do usuário logado. */
  me: (token: string) => request<{ profile: ProfileCardData }>("/api/profile", { token }),

  /** Estatísticas e troféus por plataforma do usuário logado. */
  stats: (token: string) => request<ProfileStatsResponse>("/api/profile/stats", { token }),

  /** Os `limit` jogos jogados mais recentemente pelo usuário logado, do mais novo ao mais antigo. */
  recentlyPlayed: async (token: string, limit: number): Promise<RecentlyPlayed> => {
    const data = await request<RecentlyPlayedResponse>(
      `/api/profile/recently-played?limit=${limit}`,
      { token },
    );
    const games = Array.isArray(data?.recently_played)
      ? data.recently_played.map(toRecentGame)
      : [];
    return { games, total: count(data?.total) ?? games.length };
  },

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

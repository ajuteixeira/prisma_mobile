import { settings } from "@/config";
import { request } from "./_client";
import type {
  AchievementDetail,
  AchievementPage,
  ApiUser,
  GameAchievement,
  GameAchievementFilter,
  GameAchievementPage,
  PinnedAchievement,
  ProfileCardData,
  ProfileGame,
  ProfileGameDetail,
  ProfileGamePage,
  ProfileStatsResponse,
  ProfileUpdatePayload,
} from "./types";

type ProfileGamesResponse = {
  games?: unknown;
  next_offset?: unknown;
};

type GameAchievementsResponse = {
  achievements?: unknown;
  next_offset?: unknown;
};

const text = (value: unknown) => (typeof value === "string" && value ? value : null);
const count = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/** Lê um jogo sem confiar no formato: campo ausente ou com outro tipo vira `null`/0. */
const toProfileGame = (raw: unknown, fallbackId: number): ProfileGame => {
  const game = (raw ?? {}) as Record<string, unknown>;
  const platform = (game.platform ?? {}) as Record<string, unknown>;
  const slug = text(platform.slug);

  return {
    id: count(game.id) ?? fallbackId,
    name: text(game.name) ?? "Jogo sem nome",
    cover_url: text(game.cover_url),
    icon_url: text(game.icon_url),
    platform: slug ? { slug, name: text(platform.name) ?? slug } : null,
    playtime_minutes: count(game.playtime_minutes),
    last_played_at: text(game.last_played_at),
    unlocked_achievements: count(game.unlocked_achievements) ?? 0,
    total_achievements: count(game.total_achievements) ?? 0,
  };
};

/** Lê uma conquista do jogo sem confiar no formato, como `toProfileGame`. */
const toGameAchievement = (raw: unknown, fallbackId: number): GameAchievement => {
  const achievement = (raw ?? {}) as Record<string, unknown>;

  return {
    id: count(achievement.id) ?? fallbackId,
    name: text(achievement.name) ?? "Conquista sem nome",
    description: text(achievement.description),
    icon_url: text(achievement.icon_url),
    achieved: achievement.achieved === true,
    unlocked_at: text(achievement.unlocked_at),
  };
};

/** `/api/profile` do usuário logado ou `/api/profiles/:username` de outro perfil. */
const basePath = (username?: string) =>
  username ? `/api/profiles/${encodeURIComponent(username)}` : "/api/profile";

export const profileApi = {
  /** Bio, avatar, seguidores/seguindo e conquistas fixadas. Sem `username`, do usuário logado. */
  card: (token: string, username?: string) =>
    request<{ profile: ProfileCardData }>(basePath(username), { token }),

  /** Estatísticas e troféus por plataforma. Sem `username`, do usuário logado. */
  stats: (token: string, username?: string) =>
    request<ProfileStatsResponse>(`${basePath(username)}/stats`, { token }),

  /**
   * Uma página de todos os jogos, do jogado mais recente ao mais antigo; a ordem
   * é fixa na API. Sem `username`, do usuário logado.
   */
  games: async (token: string, offset: number, username?: string): Promise<ProfileGamePage> => {
    const data = await request<ProfileGamesResponse>(
      `${basePath(username)}/games?offset=${offset}`,
      { token },
    );
    // Sem `id`, usa a posição na lista inteira (negativa, para não colidir com ids reais).
    const games = Array.isArray(data?.games)
      ? data.games.map((raw, index) => toProfileGame(raw, -(offset + index + 1)))
      : [];
    return { games, next_offset: count(data?.next_offset) };
  },

  /** Um jogo do perfil para a tela de detalhes. Sem `username`, do usuário logado. */
  game: async (token: string, id: number, username?: string): Promise<ProfileGameDetail> => {
    const data = await request<{ game?: unknown }>(`${basePath(username)}/games/${id}`, {
      token,
    });
    const raw = (data?.game ?? {}) as Record<string, unknown>;
    return { ...toProfileGame(raw, id), last_unlock_at: text(raw.last_unlock_at) };
  },

  /**
   * Uma página das conquistas do jogo: desbloqueadas primeiro (da mais recente) e
   * depois as bloqueadas. Sem `username`, do usuário logado.
   */
  gameAchievements: async (
    token: string,
    id: number,
    filter: GameAchievementFilter,
    offset: number,
    username?: string,
  ): Promise<GameAchievementPage> => {
    const params = new URLSearchParams({ filter, offset: String(offset) });
    const data = await request<GameAchievementsResponse>(
      `${basePath(username)}/games/${id}/achievements?${params}`,
      { token },
    );
    const achievements = Array.isArray(data?.achievements)
      ? data.achievements.map((raw, index) => toGameAchievement(raw, -(offset + index + 1)))
      : [];
    return { achievements, next_offset: count(data?.next_offset) };
  },

  /** Uma página das conquistas desbloqueadas para fixar; `query` filtra por conquista ou jogo. */
  achievements: (token: string, offset: number, query = "") => {
    const params = new URLSearchParams({ offset: String(offset) });
    if (query) params.set("q", query);
    return request<AchievementPage>(`/api/profile/achievements?${params}`, { token });
  },

  /** Descrição, jogo e data de desbloqueio de uma conquista do usuário logado. */
  achievement: (token: string, id: number) =>
    request<{ achievement: AchievementDetail }>(`/api/profile/achievements/${id}`, { token }),

  /** Substitui as fixadas pelas `ids`, nesta ordem (até 4). */
  setPinned: (token: string, ids: number[]) =>
    request<{ pinned_achievements: PinnedAchievement[] }>("/api/profile/pinned-achievements", {
      token,
      method: "PUT",
      body: { ids },
    }),

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

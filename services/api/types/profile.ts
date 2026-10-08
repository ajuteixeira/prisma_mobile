/** Conquista fixada no cartão, na ordem de `position` (1 a 4). */
export type PinnedAchievement = {
  id: number;
  name: string;
  game_name: string;
  icon_url: string | null;
  position: number;
};

/** Cartão de perfil como `GET /api/profile` o serializa. */
export type ProfileCardData = {
  id: number;
  username: string;
  bio: string | null;
  /** Data URL do avatar enviado na web; `null` usa o avatar gerado. */
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  pinned_achievements: PinnedAchievement[];
};

/** Cards de estatísticas do perfil, com as mesmas regras da web. */
export type ProfileStats = {
  /** Conquistas desbloqueadas em todas as plataformas. */
  total_achievements: number;
  /** Média da % de conclusão dos jogos que têm conquistas (uma casa decimal). */
  avg_completion: number;
  /** Jogos com todas as conquistas desbloqueadas. */
  perfect_games: number;
};

/** Fatia de uma plataforma nas conquistas desbloqueadas. */
export type PlatformShare = {
  platform_id: number;
  name: string;
  slug: string;
  unlocked: number;
  /** De 0 a 100, com uma casa decimal. */
  percentage: number;
};

export type ProfileStatsResponse = {
  stats: ProfileStats;
  /** Todas as plataformas cadastradas, por id, inclusive as zeradas. */
  platform_distribution: PlatformShare[];
};

/** Corpo de `PATCH /api/profile`: só as chaves enviadas são alteradas. */
export type ProfileUpdatePayload = {
  full_name?: string;
  username?: string;
  bio?: string;
  /** Data URL (JPG, PNG, GIF ou WebP, até 2 MB). */
  avatar?: string;
};

/**
 * Jogo de `GET /api/profile/recently-played`, do mais recente ao mais antigo.
 * Formato presumido: até agora só vimos a lista vazia. Os campos são lidos em
 * `profileApi.recentlyPlayed`, e o que faltar vira `null` (ou 0 nas conquistas).
 */
export type RecentGame = {
  id: number;
  name: string;
  cover_url: string | null;
  platform: { slug: string; name: string } | null;
  playtime_minutes: number | null;
  /** ISO 8601. */
  last_played_at: string | null;
  unlocked_achievements: number;
  total_achievements: number;
};

/** Jogos recentes já normalizados, e quantos o usuário tem ao todo. */
export type RecentlyPlayed = {
  games: RecentGame[];
  total: number;
};

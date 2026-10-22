/** Conquista fixada no cartão, na ordem de `position` (1 a 4). */
export type PinnedAchievement = {
  id: number;
  name: string;
  game_name: string;
  icon_url: string | null;
  position: number;
};

/** Conquista desbloqueada na lista da pinagem; `position` só vem nas já fixadas. */
export type AchievementOption = Omit<PinnedAchievement, "position"> & { position: number | null };

/** Detalhes de `GET /api/profile/achievements/:id`; `unlocked_at` vem sem fuso. */
export type AchievementDetail = AchievementOption & {
  description: string | null;
  unlocked_at: string | null;
};

/** Uma página de `GET /api/profile/achievements`; `next_offset` é `null` no fim. */
export type AchievementPage = {
  results: AchievementOption[];
  next_offset: number | null;
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
 * Jogo de `GET /api/profile/games`, do jogado mais recente ao mais antigo (os
 * sem data por último). Os campos são lidos em `profileApi.games`, e o que
 * faltar vira `null` (ou 0 nas conquistas).
 */
export type ProfileGame = {
  id: number;
  name: string;
  /** Capa larga do destaque; a API já cai para o ícone quando não há capa. */
  cover_url: string | null;
  /** Miniatura quadrada da lista; a API já cai para a capa quando não há ícone. */
  icon_url: string | null;
  platform: { slug: string; name: string } | null;
  playtime_minutes: number | null;
  /** ISO 8601, sem fuso. */
  last_played_at: string | null;
  unlocked_achievements: number;
  total_achievements: number;
};

/** Uma página de `GET /api/profile/games`; `next_offset` é `null` no fim. */
export type ProfileGamePage = {
  games: ProfileGame[];
  next_offset: number | null;
};

import type { PlatformSlug } from "@/constants";

/** Linha de `GET /api/ranking`: você e quem você segue. */
export type RankingEntry = {
  profile_id: number;
  username: string;
  /** Data URL do avatar enviado na web; `null` usa o avatar gerado. */
  avatar_url: string | null;
  /** Conquistas desbloqueadas em todas as plataformas. */
  achievement_count: number;
  /** Conquistas desbloqueadas por slug de plataforma. */
  platform_counts: Partial<Record<PlatformSlug, number>>;
  /** Plataformas vinculadas ao perfil. */
  platforms: PlatformSlug[];
  is_current_user: boolean;
};
